// Base Component
// --------------

// Runtime
import {isEqual} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {IAttributes, IScope, ITranscludeFunction} from 'angular'
import {safeUniqueId} from '@stratusjs/core/misc'

// Stratus Dependencies
import {cookie} from '@stratusjs/core/environment'
import {Registry} from '@stratusjs/angularjs/services/registry'
import {Model} from '@stratusjs/angularjs/services/model'
import {Collection} from '@stratusjs/angularjs/services/collection'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'angularjs-extras'
const moduleName = 'components'
const componentName = 'base'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

export type BaseScope = IScope &  {
    uid: string
    elementId: string
    initialized: boolean

    property?: string
    registry: Registry
    collection?: Collection
    model?: Model
    data?: Model | Collection

    initialize(): void
}

// This component is just a simple base.
Stratus.Components.Base = {
    // Angular Components allow transclude options directly in the object. So whatever you put in Foo, will overwrite
    // whatever is in this component's template `stratus-base-model` area.
    // <stratus-base><stratus-base-model>Foo</stratus-base-model></stratus-base>
    transclude: {
        // This is a sample only
        // See ngTransclude for more character options, e.g. ? means it won't freak out if child node doesn't exist
        model: '?stratusBaseModel'
    },
    // These are attribute that can be passed from the tag to this factory, they are accessed in the factory as
    // $attrs.x (flat string - used with @ sign) or
    // $ctrl.x (parsed - needed with = sign)
    bindings: {
        // Basic Control for Designers
        elementId: '@',

        // ngModel Logic for a Symbiotic Controller Relationship
        ngModel: '=',
        property: '@',

        // Registry Elements
        target: '@',
        id: '@',
        manifest: '@',
        decouple: '@',
        direct: '@',
        api: '@',
        urlRoot: '@',

        // Collection Options
        limit: '@',
        // One way bound (will parse once and never touch again)
        options: '<'
    },
    controller(
        $scope: BaseScope,
        $transclude: ITranscludeFunction,
        $attrs: IAttributes
    ) {
        // Initialize
        // $scope.uid = uniqueId(camelCase(packageName) + '_' + camelCase(moduleName) + '_' + camelCase(componentName) + '_')
        $scope.uid = safeUniqueId(packageName, moduleName, componentName)
        Stratus.Instances[$scope.uid] = $scope
        $scope.elementId = $attrs.elementId || $scope.uid
        Stratus.Internals.CssLoader(`${localDir}${componentName}${min}.css`)
        $scope.initialized = false

        // Hoist Attributes
        $scope.property = $attrs.property || null

        // Data References
        // Stratus Data Connectivity
        $scope.registry = new Registry()
        $scope.data = null
        $scope.model = null
        $scope.collection = null

        // Registry Connectivity
        if ($attrs.target) {
            $scope.registry.fetch($attrs, $scope).then()
        }

        // Symbiotic Data Connectivity
        $scope.$watch('$ctrl.ngModel', data => {
            if (data instanceof Model && data !== $scope.model) {
                $scope.model = data
            } else if (data instanceof Collection && data !== $scope.collection) {
                $scope.collection = data
            }
        })

        // Delayed Initialization
        $scope.initialize = () => {
            if ($scope.initialized) {
                return
            }
            if ($scope.model) {
                $scope.initialized = true
                $scope.model.on('change', () => {
                    console.log('model changed:', arguments)
                })
            }
            if ($scope.collection) {
                $scope.initialized = true
                console.log('collection available')
            }
        }

        // Model Watcher
        $scope.$watch('$scope.model.completed', (newVal, oldVal) => {
            if (!newVal || isEqual(newVal, oldVal)) {
                return
            }
            $scope.initialize()
        })

        // Collection Watcher
        $scope.$watch('$scope.collection.completed', (newVal, oldVal) => {
            if (!newVal || isEqual(newVal, oldVal)) {
                return
            }
            $scope.initialize()
        })

        // Display Complete Build
        if (!Stratus.Environment.get('production')) {
            console.log(componentName, 'component:', $scope, $attrs)
        }
    },
    // template: '<div id="{{ elementId }}"><div data-ng-if="model && property && model.get(property)"
    // style="list-style-type: none;">{{ model.get(property) | json }}</div><ul data-ng-if="collection && model &&
    // property" data-ng-cloak><stratus-search></stratus-search><li data-ng-repeat="model in collection.models">
    // {{ model.data | json }}</li><stratus-pagination></stratus-pagination></ul></div>',
    templateUrl: `${localDir}${componentName}${min}.html`,
}
