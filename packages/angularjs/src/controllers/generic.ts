// Generic Controller: used to connect to any API and/or process
// ------------------

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Forced Runtime Load
import 'angular'

// Modules
import 'angular-sanitize'

// Forced Dependent Service Load
import '@stratusjs/angularjs/services/registry'
import '@stratusjs/angularjs/services/model'
import '@stratusjs/angularjs/services/collection'

// Services
// tslint:disable-next-line:no-duplicate-imports
import {Registry} from '@stratusjs/angularjs/services/registry'
// tslint:disable-next-line:no-duplicate-imports
import {Model} from '@stratusjs/angularjs/services/model'

// Stratus Dependencies
import {
    isJSON,
    setUrlParams
} from '@stratusjs/core/misc'

// Require this to Sanitize all data-ng-bind-html instances
Stratus.Modules.ngSanitize = true

// This Controller handles simple element binding
// for a single scope to an API Object Reference.
Stratus.Controllers.Generic = [
    '$scope',
    '$element',
    '$log',
    '$sce',
    '$parse',
    '$window',
    'Registry',
    async (
        $scope: angular.IScope|any,
        $element: JQLite,
        $log: angular.ILogService,
        $sce: angular.ISCEService,
        $parse: angular.IParseService,
        $window: angular.IWindowService,
        R: Registry
    ) => {
        // Store Instance
        Stratus.Instances[_.uniqueId('generic_')] = $scope

        // Registry
        await R.fetch($element, $scope)

        // Wrappers
        // NOTE: parent is overwritten in nested controllers every time you have an data-ng-if statement (it silently
        // creates a new scope that inherits the variables of the current scope, but overwrites parent, so that you have
        // to do $parent.$parent.$parent everytime you need to access the parent inside nested data-ng-if statements. So we set
        // the realParent to a permanent variable here that can be accessed at any level of data-ng-if, because the parent variable
        // does not get modified
        $scope.ctrlParent = $scope.$parent
        $scope.Stratus = Stratus
        $scope._ = _
        $scope.$window = $window
        $scope.setUrlParams = (options: any) => {
            if (!_.isObject(options)) {
                return
            }
            let substance = false
            _.forEach(options, (value: any) => {
                if (_.isUndefined(value) || value === null) {
                    return
                }
                if (!_.isString(value) || value.length > 0) {
                    substance = true
                }
            })
            if (substance) {
                window.location.replace(setUrlParams(options))
            }
        }
        $scope.$log = $log

        // Inject Javascript Objects
        $scope.Math = Math

        // Type Checks
        $scope.isArray = _.isArray
        $scope.isDate = _.isDate
        $scope.isDefined = (value: any) => !_.isUndefined(value)
        $scope.isElement = _.isElement
        $scope.isFunction = _.isFunction
        $scope.isNumber = _.isNumber
        $scope.isObject = _.isObject
        $scope.isString = _.isString
        $scope.isUndefined = _.isUndefined

        // Angular Wrappers
        $scope.getHTML = $sce.trustAsHtml
        $scope.getURL = $sce.trustAsResourceUrl

        // Bind Redraw to all Change Events
        if ($scope.data && _.isFunction($scope.data.on)) {
            $scope.data.on('change', () => $scope.$applyAsync())
        }

        // Handle Selected
        if (!$scope.collection) {
            return
        }
        const selected: {
            raw: string;
            id: string,
            model?: Model|angular.ICompiledExpression,
            value?: any
        } = {
            id: $element.attr('data-selected'),
            raw: $element.attr('data-raw')
        }
        if (!selected.id || !_.isString(selected.id)) {
            return
        }
        if (isJSON(selected.id)) {
            selected.id = JSON.parse(selected.id)
            $scope.$watch('collection.models', (models: Array<Model>) => {
                if ($scope.selected || $scope.selectedInit) {
                    return
                }
                _.forEach(models, (model: Model) => {
                    if (selected.id !== model.getIdentifier()) {
                        return
                    }
                    $scope.selected = selected.raw ? model.data : model
                    $scope.selectedInit = true
                })
            })
        } else {
            selected.model = $parse(selected.id)
            selected.value = selected.model($scope.$parent)
            if (!_.isArray(selected.value)) {
                return
            }
            selected.value = selected.value.filter((n: any) => n)
            if (selected.value.length) {
                return
            }
            $scope.selected = _.first(selected.value)
        }
    }
]
