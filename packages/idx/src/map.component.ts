// IdxPropertyDetailsSubSection Component
// @stratusjs/idx/property/details-sub-section.component
// <stratus-idx-property-details-sub-section>
// --------------

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Services
import '@stratusjs/angularjs/services/model'

// Stratus Dependencies
import {cookie} from '@stratusjs/core/environment'
import {IdxComponentScope, IdxEmitter, IdxListScope, IdxService, Member, Property} from '@stratusjs/idx/idx'
import {Collection} from '@stratusjs/angularjs/services/collection'
import {MarkerSettings} from '@stratusjs/map/map.component'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
// const moduleName = 'property'
const componentName = 'map'
// There is not a very consistent way of pathing in Stratus at the moment
// const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/`

export type IdxMapScope = IdxComponentScope & {
    listId: string
    listInitialized: boolean

    instancePath: string
    mapMarkers: MarkerSettings[]
}

Stratus.Components.IdxMap = {
    bindings: {
        listId: '@',
        template: '@',
    },
    controller(
        $attrs: angular.IAttributes,
        $scope: IdxMapScope,
        Idx: IdxService,
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        $scope.instancePath = `Stratus.Instances.${$scope.elementId}`

        $ctrl.$onInit = () => {
            $scope.Idx = Idx
            $scope.listId = $attrs.listId || null
            $scope.listInitialized = false

            // Register this Map with the Property service
            // Idx.registerMapInstance($scope.elementId, $scope, $scope.linkId)
            Idx.registerMapInstance($scope.elementId, $scope)

            if ($scope.listId) {
                Idx.devLog($scope.elementId, 'is watching for map to update from', $scope.listId)
                /*Idx.on($scope.listId, 'collectionUpdated', (source: IdxListScope, collection: Collection) => {
                    console.log('collectionUpdated!!!!', source, collection)
                    $ctrl.prepareMapMarkers(source)
                })*/
                Idx.on($scope.listId, 'init', (source: IdxListScope) => {
                    // console.log('init!!!!', source)
                    $ctrl.prepareMapMarkers(source)
                })
                Idx.on($scope.listId, 'pageChanged', (source: IdxListScope, pageNumber: number) => {
                    // console.log('pageChanged!!!!', source, pageNumber)
                    $ctrl.prepareMapMarkers(source)
                })
            }
            Idx.emit('init', $scope)
        }

        $ctrl.prepareMapMarkers = (source: IdxListScope<Member | Property>): void => {
            // console.log('checking $scope.collection.models', $scope.collection.models)
            const markers: MarkerSettings[] = []
            source.getPageModels().forEach((model) => {
                // console.log('looping listing', listing)
                if (
                    Object.prototype.hasOwnProperty.call(model, 'Latitude') &&
                    Object.prototype.hasOwnProperty.call(model, 'Longitude')
                ) {
                    const address = Idx.getStreetAddress(model as Property) // TODO handle Member?
                    // TODO we could just send a whole Marker instead, but then we need to wait for google.maps to be ready
                    /*const marker = new google.maps.Marker({
                        position: {lat: listing.Latitude, lng: listing.Longitude},
                        title: address,
                        animation: google.maps.Animation.DROP
                    })
                    marker.addListener('click', () => {
                        $anchorScroll(`${$scope.elementId}_${listing._id}`)
                        // $scope.displayPropertyDetails(listing)
                    })
                    markers.push(marker)*/
                    markers.push({
                        position: {lat: model.Latitude, lng: model.Longitude},
                        title: address,
                        options: {
                            animation: 2 // DROP: 2 | BOUNCE: 1
                        },
                        click: {
                            action: 'function',
                            function: (marker: any, markerSetting: any) => {
                                console.log('Was clicked~')
                                // $anchorScroll(`${$scope.elementId}_${listing._id}`)
                                // $scope.displayPropertyDetails(listing)
                            }
                        }
                    })
                }
            })

            console.log('markers', markers)
            $scope.mapMarkers = markers
        }

        /*$scope.stopWatchingModel = $scope.$watch('$ctrl.ngModel', (data: any) => {
            // TODO might wanna check something else just to not import Model
            if (data instanceof Model && data !== $scope.model) {
                $scope.model = data
                $scope.stopWatchingModel()
            }
        })*/

        $scope.on = (emitterName: string, callback: IdxEmitter): void => Idx.on($scope.elementId, emitterName, callback)

        $scope.getUid = (): string => $scope.elementId

        $scope.remove = (): void => {
        }
    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
