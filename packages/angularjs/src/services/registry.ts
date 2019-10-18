// Registry Service
// ----------------

// Runtime
import _ from 'lodash'
import angular from 'angular'
import {Stratus} from '@stratusjs/runtime/stratus'

// Stratus Core
import {sanitize} from '@stratusjs/core/conversion'
import {isJSON, poll, ucfirst} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'

// AngularJS Dependency Injector
import {getInjector} from '@stratusjs/angularjs/injector'

// AngularJS Services
import {Model} from '@stratusjs/angularjs/services/model'
import {Collection} from '@stratusjs/angularjs/services/collection'

// Instantiate Injector
let injector = getInjector()

// Angular Services
// let $interpolate: angular.IInterpolateService = injector ? injector.get('$interpolate') : null
let $interpolate: angular.IInterpolateService

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
        this.fetch = this.fetch.bind(this)
    }

    // TODO: Handle Version Routing through Angular
    // Maintain all models in Namespace
    // Inverse the parent and child objects the same way Doctrine does
    // TODO: PushState Handling like: #/media/p/2
    fetch($element: any, $scope: any) {
        return new Promise(async (resolve, reject) => {
            if (typeof $element === 'string') {
                $element = {
                    target: $element
                }
            }
            const inputs = {
                target: 'data-target',
                targetSuffix: 'data-target-suffix',
                id: 'data-id',
                manifest: 'data-manifest',
                decouple: 'data-decouple',
                direct: 'data-direct',
                api: 'data-api',
                urlRoot: 'data-url-root'
            }
            // FIXME: Sanitize function fails here in certain cases
            const options = _.each(inputs, (value: string, key: string, list: any) => {
                list[key] = $element.attr ? $element.attr(value) : $element[key]
                if (!isJSON(list[key])) {
                    return
                }
                list[key] = JSON.parse(list[key])
            })
            options.api = sanitize(options.api)
            /* TODO: handle these sorts of shortcuts to the API that components are providing *
             $scope.api = _.isJSON($attrs.api) ? JSON.parse($attrs.api) : false
             const request = {
             api: {
             options: this.options ? this.options : {},
             limit: _.isJSON($attrs.limit) ? JSON.parse($attrs.limit) : 40
             }
             }
             if ($scope.api && _.isObject($scope.api)) {
             request.api = _.extendDeep(request.api, $scope.api)
             }
             /* */
            let completed = 0
            const verify = () => {
                if (!_.isNumber(completed) || completed !== _.size(options)) {
                    return
                }
                resolve(this.build(options, $scope))
            }
            if (!$interpolate) {
                const wait = await serviceVerify()
            }
            _.forEach(options, (element, key) => {
                if (!element || typeof element !== 'string') {
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
                if (!Stratus.Environment.get('production')) {
                    console.log('poll attribute:', key)
                }
                // TODO: Check if this ever hits a timeout
                poll(() => interpreter($scope.$parent), 7500, 250)
                    .then((value: any) => {
                        if (!Stratus.Environment.get('production')) {
                            console.log('interpreted:', value)
                        }
                        if (typeof value === 'undefined') {
                            return
                        }
                        options[key] = value
                        completed++
                        verify()
                    })
                    .catch((message: any) => {
                        console.error(message)
                    })
            })
        })
    }

    build(options: any, $scope: any) {
        let data
        if (options.target) {
            options.target = ucfirst(options.target)

            // Find or Create Reference
            if (options.manifest || options.id) {
                if (!Stratus.Catalog[options.target]) {
                    Stratus.Catalog[options.target] = {}
                }
                const id = options.id || 'manifest'
                if (options.decouple || !Stratus.Catalog[options.target][id]) {
                    const modelOptions: any = {
                        target: options.target,
                        manifest: options.manifest,
                        stagger: true
                    }
                    if (options.urlRoot) {
                        modelOptions.urlRoot = options.urlRoot
                    }
                    if (options.targetSuffix) {
                        modelOptions.targetSuffix = options.targetSuffix
                    }
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
                    const collectionOptions: any = {
                        target: options.target,
                        direct: !!options.direct
                    }
                    if (options.urlRoot) {
                        collectionOptions.urlRoot = options.urlRoot
                    }
                    if (options.targetSuffix) {
                        collectionOptions.targetSuffix = options.targetSuffix
                    }
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
                data.meta.set('api', isJSON(options.api)
                                     ? JSON.parse(options.api)
                                     : options.api)
            }

            // Handle Staggered
            if (data.stagger && typeof data.initialize === 'function') {
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
                    }
                } else if (data instanceof Collection) {
                    $scope.collection = data
                }
            }
            if (!data.pending && !data.completed) {
                data.fetch()
            }
        }
        return data
    }
}

// This Registry Service handles data binding for an element
Stratus.Services.Registry = [
    '$provide',
    ($provide: any) => {
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
