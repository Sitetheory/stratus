// JsonEditor Component
// --------------

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'
import {IAttributes, IScope} from 'angular'

// Stratus Dependencies
import {cookie} from '@stratusjs/core/environment'
import {isJSON, safeUniqueId} from '@stratusjs/core/misc'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'angularjs-extras'
const moduleName = 'components'
const componentName = 'jsonEditor'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

export type JsonEditorScope = IScope &  {
    uid: string
    elementId: string
    initialized: boolean

    name: string
    ariaLabel: string
    rows: number
    jsonString: string

    initialize(): void
    setDefaultValues(): void
}

Stratus.Components.JsonEditor = {
    bindings: {
        // Basic Control for Designers
        elementId: '@',

        // ngModel Logic for a Symbiotic Controller Relationship
        ngModel: '=',
        // This automatically binds to the form.field controller that gets used for setting validity on the $ctrl for the input
        formFieldCtrl: '=',
        // this is the name of the field (must match formFieldCtrl form name)
        name: '@',
        // This is an odd value... it would apply aria bale twice
        ariaLabel: '@',
        rows: '@'
    },
    controller(
        $scope: JsonEditorScope,
        $attrs: IAttributes
    ) {
        // Initialize
        // $scope.uid = uniqueId(camelCase(packageName) + '_' + camelCase(moduleName) + '_' + camelCase(componentName) + '_')
        $scope.uid = safeUniqueId(packageName, moduleName, componentName)
        Stratus.Instances[$scope.uid] = $scope
        $scope.elementId = $attrs.elementId || $scope.uid
        Stratus.Internals.CssLoader(`${localDir}${componentName}${min}.css`).then()
        $scope.initialized = false

        // Localized Value for the editor data
        $scope.jsonString = ''

        $scope.initialize = () => {
            console.log('Stratus Json Editor was initialized.')

            if ($scope.initialized) {
                return
            }
            $scope.initialized = true
            /**
             * WATCHER - Data Connectivity from ngModel
             * Populate the $scope.jsonString with the ngModel from the page
             * This is a component in order to sandbox dual binding so that when the directive fires to clean the JSON, it
             * does not update the model right away
             */
            $scope.$watch(() => this.ngModel, (jsonObject, _oldJsonObject) => {
                if (!jsonObject) {
                    return
                }
                $scope.setDefaultValues()
                // This will prettify the results
                const jsonString = JSON.stringify(jsonObject, null, 2)
                if ($scope.jsonString === jsonString) {
                    return
                }
                $scope.jsonString = jsonString
                $scope.$applyAsync()
            })
            // Saving Data if Valid This is expecting a string
            /**
             * This turns the string from the jsonString into an object to send to the model
             */
            $scope.$watch(() => $scope.jsonString, (newString, oldString) => {
                if (newString === oldString) {
                    return
                }
                const isValid = isJSON(newString)
                this.formFieldCtrl.$setValidity('validJson', isValid)
                if (!isValid) {
                    return
                }
                // turn it to an object
                this.ngModel = JSON.parse(newString)
            })
        }

        $scope.setDefaultValues = () => {
            $scope.name = $attrs.name || ''
            $scope.ariaLabel = $attrs.ariaLabel || ''
            $scope.rows = $attrs.rows || 4
            $scope.$applyAsync()
        }

        $scope.setDefaultValues()

        /**
         * Don't do anything until the $ctrl.formFieldCtrl exists (which is the form.fieldName controller that gets the
         * validity set on it.
         */
        const unwatch = $scope.$watch(() => this.formFieldCtrl, newValue => {
            if (!newValue) {
                return
            }
            $scope.initialize()
            unwatch()
        })
    },
    templateUrl: `${localDir}${componentName}${min}.html`,
}
