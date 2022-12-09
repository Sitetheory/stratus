// Details Service
// --------------

// Runtime
import {forEach, isNumber, isObject, isString, isUndefined, size} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {auto, IHttpService, IScope, IInterpolateService, IAugmentedJQuery, IHttpResponse} from 'angular'

// Stratus Dependencies
import {LooseObject} from '@stratusjs/core/misc'
import {Model} from '@stratusjs/angularjs/services/model'


// FIXME the checks below for this are not handled correctly. in the future we need some better testing
type ExpandedIAugmentedJQuery = IAugmentedJQuery & {
    selectedId: string
    property: string
}

// All Service functionality
const angularJsService = (
    $http: IHttpService,
    // tslint:disable-next-line:no-shadowed-variable
    Model: Model,
    $interpolate: IInterpolateService
) => {
    return class AngularDetails {
        // public fetch
        // public build
        constructor () {
            // Scope Binding
            this.fetch = this.fetch.bind(this)
            this.build = this.build.bind(this)
        }

        fetch($element: ExpandedIAugmentedJQuery | {target: string} | string, $scope: IScope) {
            return new Promise((resolve, _reject) => {
                if (isString($element)) {
                    $element = { target: $element }
                }
                const options: LooseObject = {
                    selectedId: ($element as ExpandedIAugmentedJQuery).attr
                        ? ($element as ExpandedIAugmentedJQuery).attr('data-selectedId')
                        : ($element as ExpandedIAugmentedJQuery).selectedId,
                    property: ($element as ExpandedIAugmentedJQuery).attr
                        ? ($element as ExpandedIAugmentedJQuery).attr('data-property')
                        : ($element as ExpandedIAugmentedJQuery).property
                }
                let completed = 0
                $scope.$watch(() => {
                    return completed
                }, (iteration) => {
                    if (!isNumber(iteration)) {
                        iteration = parseInt(iteration, 10)
                    }
                    if (isNumber(iteration) && iteration === size(options)) {
                        resolve(this.build(options, $scope))
                    }
                })
                forEach(options, (element, key) => {
                    if (element && isString(element)) {
                        const interpreter = $interpolate(element, false, null, true)
                        const initial = interpreter($scope.$parent)
                        if (!isUndefined(initial)) {
                            options[key] = initial
                            completed++
                        } else {
                            $scope.$watch(() => {
                                return interpreter($scope.$parent)
                            }, (value) => {
                                if (value) {
                                    options[key] = value
                                    completed++
                                }
                            })
                        }
                    } else {
                        completed++
                    }
                })
            })
        }

        build (options: LooseObject, $scope: IScope & LooseObject) {
            if (options.selectedId) {
                let targetUrl
                if (options.property === 'version.layout') {
                    targetUrl = '/Api/Layout/' + options.selectedId
                }
                if (options.property === 'version.template') {
                    targetUrl = '/Api/Template/' + options.selectedId
                }
                const action = 'GET'
                const prototype = {
                    method: action,
                    url: targetUrl,
                    headers: {}
                }
                $http(prototype).then((response: IHttpResponse<LooseObject>) => {
                    if (response.status === 200 && isObject(response.data)) {
                        $scope.convoyDetails = (response.data as LooseObject).payload || response.data
                        $scope.selectedName = $scope.convoyDetails.name
                        $scope.selectedDesc = $scope.convoyDetails.description
                    }
                })
            }
        }
    }
}

Stratus.Services.Details = [
    '$provide',
    ($provide: auto.IProvideService) => {
        $provide.factory('details', angularJsService)
    }
]
