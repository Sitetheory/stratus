// dialog Controller
// -------------------

import {Stratus} from '@stratusjs/runtime/stratus'
import {element, IAttributes, IParseService, IScope, material} from 'angular'
import {safeUniqueId} from '@stratusjs/core/misc'
import {Model} from '@stratusjs/angularjs/services/model'


// This Controller handles simple dialog display
// with bindings for the associated model
Stratus.Controllers.Dialog = [
    '$attrs',
    '$mdDialog',
    '$parse',
    '$scope',
    async (
        $attrs: IAttributes,
        $mdDialog: material.IDialogService,
        $parse: IParseService,
        $scope: IScope|any
    ) => {
        // Store Instance
        const uid = safeUniqueId('dialog')
        Stratus.Instances[uid] = $scope

        // Digest Template
        $scope.template = $attrs.template || null
        $scope.template = $scope.template ? document.querySelector($scope.template) : null
        $scope.template = $scope.template ? $scope.template.innerHTML : null

        // Digest Model Bindings
        $scope.model = null
        $scope.$parent.$watch($attrs.ngModel, (model: Model) => {
            if (model && typeof model === 'object') {
                $scope.model = model
            }
        })

        // Handle dialog
        $scope.show = ($event: any) => {
            $mdDialog.show({
                parent: element(document.body),
                template: $scope.template || 'Template Not Found!',
                targetEvent: $event,
                clickOutsideToClose: true,
                locals: {
                    ngModel: $scope.model
                },
                controller: (
                    // tslint:disable-next-line:no-shadowed-variable
                    $scope: IScope|any,
                    // tslint:disable-next-line:no-shadowed-variable
                    $mdDialog: material.IDialogService,
                    ngModel: Model
                ) => {
                    Stratus.Instances[uid + '_mdDialog'] = $scope
                    $scope.model = ngModel
                    $scope.hide = () => {
                        $mdDialog.hide()
                    }
                }
            })
        }
    }
]
