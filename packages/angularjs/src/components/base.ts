// Base Component
// --------------

// Runtime
import * as _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {IAttributes, IScope} from 'angular'

// Angular 1 Modules
import 'angular-material'

// Services
import '@stratusjs/angularjs/services/registry'
import '@stratusjs/angularjs/services/model'
import '@stratusjs/angularjs/services/collection'

// Stratus Dependencies
import {camelToSnake} from '@stratusjs/core/conversion'
import {Model} from '@stratusjs/angularjs/services/model'
import {Registry} from '@stratusjs/angularjs/services/registry'
import {Collection} from '@stratusjs/angularjs/services/collection'

// Environment
const min = Stratus.Environment.get('production') ? '.min' : ''
const name = 'base'
const localPath = '@stratusjs/angularjs/src/components'

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
        $scope: IScope|any,
        $attrs: IAttributes|any,
        R: Registry,
        M: Model,
        C: Collection
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(camelToSnake(name) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        Stratus.Internals.CssLoader(
            Stratus.BaseUrl + Stratus.BundlePath + localPath + '/' + name + min + '.css'
        )
        $scope.initialized = false

        // Hoist Attributes
        $scope.property = $attrs.property || null

        // Data References
        $scope.data = null
        $scope.model = null
        $scope.collection = null

        // Registry Connectivity
        if ($attrs.target) {
            R.fetch($attrs, $scope)
        }

        // Symbiotic Data Connectivity
        $scope.$watch('$ctrl.ngModel', (data: any) => {
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
                    console.log('model changed:', $scope.model.patch)
                })
            }
            if ($scope.collection) {
                $scope.initialized = true
                console.log('collection available')
            }
        }

        // Model Watcher
        $scope.$watch('$scope.model.completed', (newVal: any, oldVal: any) => {
            if (!newVal || _.isEqual(newVal, oldVal)) {
                return
            }
            $scope.initialize()
        })

        // Collection Watcher
        $scope.$watch('$scope.collection.completed', (newVal: any, oldVal: any) => {
            if (!newVal || _.isEqual(newVal, oldVal)) {
                return
            }
            $scope.initialize()
        })

        // Display Complete Build
        if (!Stratus.Environment.get('production')) {
            console.log(name, 'component:', $scope, $attrs)
        }
    },
    // template: '<!-- Inline Base Template -->\
    //     <div id="{{ elementId }}"> \
    //         <div ng-if="model && property && model.get(property)" style="list-style-type: none;"> \
    //             {{ model.get(property) | json }} \
    //         </div> \
    //         <ul ng-if="collection && model && property" ng-cloak> \
    //             <stratus-search></stratus-search> \
    //             <li ng-repeat="model in collection.models">{{ model.data | json }}</li> \
    //             <stratus-pagination></stratus-pagination> \
    //         </ul> \
    //     </div>',
    templateUrl: Stratus.BaseUrl + Stratus.DeploymentPath + localPath + '/' + name + min + '.html'
}
