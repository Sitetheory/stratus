// Generic Controller: used to connect to any API and/or process
// ------------------

// Runtime
import * as _ from 'lodash'
import * as Stratus from 'stratus'
import * as angular from 'angular'

// Types
import {ICompiledExpression, ILogService, IParseService, ISCEService, IScope} from 'angular'

// Modules
import 'angular-sanitize'

// Services
import {Registry} from '@stratusjs/angularjs/services/registry'
import {Model} from '@stratusjs/angularjs/services/model'
import {Collection} from '@stratusjs/angularjs/services/collection'

// Stratus Dependencies
import {isJSON, setUrlParams} from '@stratusjs/core/misc'

// Require this to Sanitize all ng-bind-html instances
Stratus.Modules.ngSanitize = true

// This Controller handles simple element binding
// for a single scope to an API Object Reference.
Stratus.Controllers.Generic = [
    '$scope',
    '$element',
    '$log',
    '$sce',
    '$parse',
    'Registry',
    async ($scope: IScope|any, $element: JQLite, $log: ILogService, $sce: ISCEService, $parse: IParseService, R: Registry) => {
        // Store Instance
        Stratus.Instances[_.uniqueId('generic_')] = $scope

        // Registry
        await R.fetch($element, $scope)

        // Wrappers
        // NOTE: parent is overwritten in nested controllers every time you have an ng-if statement (it silently
        // creates a new scope that inherits the variables of the current scope, but overwrites parent, so that you have
        // to do $parent.$parent.$parent everytime you need to access the parent inside nested ng-if statements. So we set
        // the realParent to a permanent variable here that can be accessed at any level of ng-if, because the parent variable
        // does not get modified
        $scope.ctrlParent = $scope.$parent
        $scope.Stratus = Stratus
        $scope._ = _
        $scope.setUrlParams = (options: any) => {
            if (angular.isObject(options)) {
                let substance = false
                angular.forEach(options, (value: any) => {
                    if (angular.isDefined(value) && value !== null) {
                        if (!angular.isString(value)) {
                            substance = true
                        } else if (value.length > 0) {
                            substance = true
                        }
                    }
                })
                if (substance) {
                    window.location.replace(setUrlParams(options))
                }
            }
        }
        $scope.$log = $log

        // Inject Javascript Objects
        $scope.Math = window.Math

        // Type Checks
        $scope.isArray = angular.isArray
        $scope.isDate = angular.isDate
        $scope.isDefined = angular.isDefined
        $scope.isElement = angular.isElement
        $scope.isFunction = angular.isFunction
        $scope.isNumber = angular.isNumber
        $scope.isObject = angular.isObject
        $scope.isString = angular.isString
        $scope.isUndefined = angular.isUndefined

        // Angular Wrappers
        $scope.getHTML = $sce.trustAsHtml

        // Handle Selected
        if ($scope.collection) {
            const selected: { raw: string; id: string, model?: Model|ICompiledExpression, value?: any } = {
                id: $element.attr('data-selected'),
                raw: $element.attr('data-raw')
            }
            if (selected.id) {
                if (angular.isString(selected.id)) {
                    if (isJSON(selected.id)) {
                        selected.id = JSON.parse(selected.id)
                        $scope.$watch('collection.models', (models: Array<Model>) => {
                            if (!$scope.selected && !$scope.selectedInit) {
                                angular.forEach(models, (model: Model) => {
                                    if (selected.id === model.getIdentifier()) {
                                        $scope.selected = selected.raw ? model.data : model
                                        $scope.selectedInit = true
                                    }
                                })
                            }
                        })
                    } else {
                        selected.model = $parse(selected.id)
                        selected.value = selected.model($scope.$parent)
                        if (angular.isArray(selected.value)) {
                            selected.value = selected.value.filter((n: any) => n)
                            if (selected.value.length) {
                                $scope.selected = _.first(selected.value)
                            }
                        }
                    }
                }
            }
        }
    }
]
