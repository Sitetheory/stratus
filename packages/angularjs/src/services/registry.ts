// Registry Service
// ----------------

// Runtime
import _ from 'lodash'
import angular, {IScope} from 'angular'
import {Stratus} from '@stratusjs/runtime/stratus'

// Stratus Core
import {sanitize} from '@stratusjs/core/conversion'
import {flatten, isJSON, poll, ucfirst} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'

// AngularJS Dependency Injector
import {getInjector} from '@stratusjs/angularjs/injector'

// AngularJS Services
import {Model, ModelOptionKeys, ModelOptions} from '@stratusjs/angularjs/services/model'
import {Collection, CollectionOptionKeys, CollectionOptions} from '@stratusjs/angularjs/services/collection'

// Instantiate Injector
let injector = getInjector()

// Angular Services
// let $interpolate: angular.IInterpolateService = injector ? injector.get('$interpolate') : null
let $interpolate: angular.IInterpolateService

// Interfaces
export interface RegistryOptions extends CollectionOptions, ModelOptions {
    id?: number
    api?: string
    temp?: string
    decouple?: boolean
    fetch?: boolean
}

// Service Verification Function
const serviceVerify = async () => {
    return new Promise(async (resolve, reject) => {
        if ($interpolate) {
            resolve(true)
            return
        }
        if (!injector) {
            injector = getInjector()
        }
        if (injector) {
            $interpolate = injector.get('$interpolate')
        }
        if ($interpolate) {
            resolve(true)
            return
        }
        setTimeout(() => {
            if (cookie('env')) {
                console.log('wait for $interpolate service:', $interpolate)
            }
            serviceVerify().then(resolve)
        }, 250)
    })
}

// TODO: Move this to the Backend Package
export class Registry {
    constructor() {
        // Scope Binding
        // this.fetch = this.fetch.bind(this)
    }

    // TODO: Handle Version Routing through Angular
    // Maintain all models in Namespace
    // Inverse the parent and child objects the same way Doctrine does
    // TODO: PushState Handling like: #/media/p/2
    fetch(
        $element: string|object|JQLite|any,
        $scope: object|IScope|any
    ): Promise<boolean|Collection|Model> {
        return new Promise(async (resolve, reject) => {
            if (typeof $element === 'string') {
                $element = {
                    target: $element
                }
            }
            const inputs: RegistryOptions = {}
            const baseInputs = [
                'id',
                'api',
                'temp',
                'decouple',
                'fetch'
            ]
            _.forEach(
                _.union(ModelOptionKeys, CollectionOptionKeys, baseInputs),
                (option: string) => _.set(inputs, option, 'data-' + _.kebabCase(option))
            )
            // FIXME: Sanitize function fails here in certain cases
            const options = _.forEach(inputs, (value: string, key: string, list: any) => {
                list[key] = $element.attr ? $element.attr(value) : $element[key]
                if (!isJSON(list[key])) {
                    return
                }
                list[key] = JSON.parse(list[key])
            })
            options.api = sanitize(options.api)
            options.temp = sanitize(options.temp)
            // TODO: handle these sorts of shortcuts to the API that components are providing
            // $scope.api = isJSON(options.api) ? JSON.parse(options.api) : false
            // const request = {
            //     api: {
            //         options: options || {},
            //         limit: isJSON(options.limit) ? JSON.parse(options.limit) : 40
            //     }
            // }
            // if ($scope.api && _.isObject($scope.api)) {
            //     request.api = extendDeep(request.api, $scope.api)
            // }
            let completed = 0
            const verify = () => {
                if (!_.isNumber(completed) || completed !== _.size(options)) {
                    return
                }
                resolve(this.build(options, $scope))
            }
            if (!$interpolate) {
                // TODO: Verify the whether the const is necessity
                // tslint:disable-next-line:no-unused-variable
                const wait = await serviceVerify()
            }
            _.forEach(options, async (element, key) => {
                if (!element || typeof element !== 'string' || !$scope || !$scope.$parent) {
                    completed++
                    verify()
                    return
                }
                const interpreter = $interpolate(element, false, null, true)
                const initial = interpreter($scope.$parent)
                if (typeof initial !== 'undefined') {
                    options[key] = initial
                    completed++
                    verify()
                    return
                }
                if (cookie('env')) {
                    console.log(`poll (${key}): start`)
                }
                // TODO: Check if this ever hits a timeout
                let value: any
                try {
                    value = await poll(() => interpreter($scope.$parent), 1500, 250)
                } catch (err) {
                    if (
                        cookie('env') ||
                        err.name !== 'Timeout'
                    ) {
                        console.error(err)
                    }
                }
                if (cookie('env')) {
                    console.log(`poll (${key}):`, value)
                }
                options[key] = value
                completed++
                verify()
            })
        })
    }

    build(
        options: RegistryOptions,
        $scope: object|IScope|any
    ): Collection | Model {
        let data: Collection | Model
        // TODO: Code golf this function to be only 1 level
        if (options.target) {
            options.target = ucfirst(options.target)

            // Find or Create Reference
            if (options.manifest || options.id) {
                if (!Stratus.Catalog[options.target]) {
                    Stratus.Catalog[options.target] = {}
                }
                const id = options.id || 'manifest'
                if (options.decouple || !Stratus.Catalog[options.target][id]) {
                    const modelOptions: ModelOptions = {
                        stagger: true
                    }
                    _.forEach(ModelOptionKeys, (element) => {
                        const optionValue = _.get(options, element)
                        if (_.isUndefined(optionValue)) {
                            return
                        }
                        _.set(modelOptions, element, optionValue)
                    })
                    data = new Model(modelOptions, {
                        id: options.id
                    })
                    if (!options.decouple) {
                        Stratus.Catalog[options.target][id] = data
                    }
                } else if (Stratus.Catalog[options.target][id]) {
                    data = Stratus.Catalog[options.target][id]
                }
            } else {
                const registry = !options.direct ? 'Catalog' : 'Compendium'
                if (!Stratus[registry][options.target]) {
                    Stratus[registry][options.target] = {}
                }
                if (options.decouple ||
                    !Stratus[registry][options.target].collection) {
                    const collectionOptions: CollectionOptions = {}
                    _.forEach(CollectionOptionKeys, (element) => {
                        const optionValue = _.get(options, element)
                        if (_.isUndefined(optionValue)) {
                            return
                        }
                        _.set(collectionOptions, element, optionValue)
                    })
                    data = new Collection(collectionOptions)
                    if (!options.decouple) {
                        Stratus[registry][options.target].collection = data
                    }
                } else if (Stratus[registry][options.target].collection) {
                    data = Stratus[registry][options.target].collection
                }
            }

            // Filter if Necessary
            if (options.api) {
                data.meta.set('api', isJSON(options.api) ? JSON.parse(options.api) : options.api)
            }

            // Add Temp Values
            if (options.temp && _.isObject(options.temp)) {
                _.forEach(
                    flatten(options.temp),
                    (v: any, k: string) =>
                        data.meta.temp(`api.${k}`, v)
                )
            }

            // Handle Staggered
            if (data instanceof Model && data.stagger && typeof data.initialize === 'function') {
                data.initialize()
            }
        }

        // Evaluate
        if (typeof data === 'object' && data !== null) {
            if (typeof $scope !== 'undefined') {
                $scope.data = data
                if (data instanceof Model) {
                    $scope.model = data
                    if (typeof $scope.$applyAsync === 'function') {
                        $scope.model.on('change', () => {
                            // console.log('changed:', $scope)
                            $scope.$applyAsync()
                        })
                        $scope.model.on('error', () => {
                            // console.log('errored:', $scope)
                            $scope.$applyAsync()
                        })
                    }
                } else if (data instanceof Collection) {
                    $scope.collection = data
                }
            }
            if (!data.pending
                && !data.completed
                && (
                    _.isUndefined(options.fetch) || options.fetch
                )
            ) {
                data.fetch()
            }
        }
        return data
    }
}

// This Registry Service handles data binding for an element
Stratus.Services.Registry = [
    '$provide',
    ($provide: angular.auto.IProvideService) => {
        $provide.factory('Registry', [
            // '$interpolate',
            // 'Collection',
            // 'Model',
            (
                // $i: angular.IInterpolateService,
                // C: Collection,
                // M: Model
            ) => {
                // $interpolate = $i
                return new Registry()
            }
        ])
    }
]
Stratus.Data.Registry = Registry
