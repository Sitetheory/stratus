// Panel Controller
// ----------------
import {Stratus} from '@stratusjs/runtime/stratus'
import {element, IAugmentedJQuery, IParseService, IScope, material} from 'angular'
import {safeUniqueId} from '@stratusjs/core/misc'
import {Collection} from '@stratusjs/angularjs/services/collection'
import {Model} from '@stratusjs/angularjs/services/model'

// This Controller handles simple panel display
// with bindings for the associated data types.
Stratus.Controllers.Panel = [
    '$scope',
    '$element',
    '$parse',
    '$mdPanel',
    async (
        $scope: IScope|any,
        $element: IAugmentedJQuery,
        $parse: IParseService,
        $mdPanel: material.IPanelService
    ) => {
        // Store Instance
        Stratus.Instances[safeUniqueId('panel')] = $scope

        // Digest Template
        $scope.template = $element.attr('template') || null
        $scope.template = $scope.template ? document.querySelector(
        $scope.template) : null
        $scope.template = $scope.template ? $scope.template.innerHTML : null

        // Digest Model Bindings
        $scope.model = null
        // compatibility with both valid and invalid html
        if ($element.attr('data-ng-model') || $element.attr('ng-model')) {
            $scope.$parent.$watch($element.attr('data-ng-model') || $element.attr('ng-model'), (model: Model) => {
                if (!model) {
                    return
                }
                if (typeof model !== 'object') {
                    return
                }
                $scope.model = model
            })
        }

        // Digest Collection Bindings
        $scope.collection = null
        // compatibility with both valid and invalid html
        if ($element.attr('data-ng-collection') || $element.attr('ng-collection')) {
            $scope.$parent.$watch($element.attr('data-ng-collection') || $element.attr('ng-collection'), (collection: Collection) => {
                if (!collection) {
                    return
                }
                if (typeof collection !== 'object') {
                    return
                }
                $scope.collection = collection
            })
        }

        // Handle Panel
        $scope.show = ($event: any) => {
            const position = $mdPanel.newPanelPosition()
              .relativeTo($element)
              .addPanelPosition($mdPanel.xPosition.OFFSET_END, $mdPanel.yPosition.ALIGN_TOPS)

            $mdPanel.open({
                attachTo: element(document.body),
                template: $scope.template || 'Template Not Found!',
                panelClass: 'dialogContainer',
                position,
                // @ts-ignore
                openFrom: $event,
                clickOutsideToClose: true,
                escapeToClose: true,
                focusOnOpen: false,
                locals: {
                    ngModel: $scope.model,
                    ngCollection: $scope.collection
                },
                controller: (
                    // tslint:disable-next-line:no-shadowed-variable
                    $scope: IScope|any,
                    mdPanelRef: material.IPanelRef,
                    ngModel: Model,
                    ngCollection: Collection
                ) => {
                    $scope.model = ngModel
                    $scope.collection = ngCollection
                    $scope.close = () => {
                        if (mdPanelRef) {
                            mdPanelRef.close()
                        }
                    }
                }
            })
        }
    }
]
