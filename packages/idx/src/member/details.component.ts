// IdxMemberDetails Component
// @stratusjs/idx/member/details.component
// <stratus-idx-member-details>
// --------------

// Runtime
import * as _ from 'lodash'
import * as Stratus from 'stratus'
import * as angular from 'angular'

// Angular 1 Modules
import 'angular-material'
import 'angular-sanitize'

// Libraries
import moment from 'moment'

// Services
import '@stratusjs/idx/idx'

// FIXME move filters to @stratusjs
// Custom Filters
import 'stratus.filters.math'
import 'stratus.filters.moment'

// Stratus Dependencies
import {isJSON} from '@stratusjs/core/misc'
import {camelToSnake} from '@stratusjs/core/conversion'

// Environment
const min = Stratus.Environment.get('production') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'member'
const componentName = 'details'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `/${boot.bundle}node_modules/@stratusjs/${packageName}/src/${moduleName}/`

Stratus.Components.IdxMemberDetails = {
    bindings: {
        elementId: '@',
        urlLoad: '@',
        pageTitle: '@',
        service: '@',
        memberKey: '@',
        memberStateLicense: '@',
        images: '@',
        openhouses: '@',
        googleApiKey: '@',
        options: '@',
        defaultListOptions: '@'
    },
    controller(
        $attrs: angular.IAttributes,
        $location: angular.ILocationService,
        $q: angular.IQService,
        $sce: angular.ISCEService,
        $scope: object | any, // angular.IScope breaks references so far
        Model: any,
        Idx: any,
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(camelToSnake(packageName) + '_' + camelToSnake(moduleName) + '_' + camelToSnake(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        Stratus.Internals.CssLoader(`${localDir}${$attrs.template || componentName}.component${min}.css`)

        $ctrl.$onInit = () => {
            // console.log('loaded!')
            $scope.options = $attrs.options && isJSON($attrs.options) ? JSON.parse($attrs.options) : {}
            $scope.options.urlLoad = $attrs.urlLoad && isJSON($attrs.urlLoad) ? JSON.parse($attrs.urlLoad) : true
            $scope.options.pageTitle = $attrs.pageTitle && isJSON($attrs.pageTitle) ? JSON.parse($attrs.pageTitle) : false
            $scope.options.service = $attrs.service ? $attrs.service : null
            $scope.options.MemberKey = $attrs.memberKey ? $attrs.memberKey : null
            $scope.options.MemberStateLicense = $attrs.memberStateLicense ? $attrs.memberStateLicense : null
            // Set default images and fields
            $scope.options.images = $attrs.images && isJSON($attrs.images) ? JSON.parse($attrs.images) : {
                fields: [
                    'Order',
                    'MediaURL',
                    'LongDescription'
                ]
            }

            $scope.googleApiKey = $attrs.googleApiKey || null

            $scope.defaultListOptions = $attrs.defaultListOptions && isJSON($attrs.defaultListOptions) ?
                JSON.parse($attrs.defaultListOptions) : {}
            $scope.memberMerged = {}
            $scope.memberCombined = {}

            // Register this List with the Property service
            Idx.registerListInstance($scope.elementId, $scope, 'MemberDetails')
            // console.log(this.uid)

            console.log('options', $scope.options, $attrs)
            $scope.fetchMember()
        }

        $scope.$watch('collection.models', async (models: any[]) => {
            $scope.devLog('Loaded Member Data:', models)

            await $scope.individualMember()

            if (
                $scope.options.pageTitle &&
                (
                    Object.prototype.hasOwnProperty.call($scope.memberMerged, 'MemberFullName') ||
                    Object.prototype.hasOwnProperty.call($scope.memberMerged, 'MemberFirstName')
                )
            ) {
                // Update the page title
                Idx.setPageTitle($scope.memberMerged.MemberFullName || `${$scope.memberMerged.MemberFirstName} ${$scope.memberMerged.MemberLastName}`)
            }
        })

        $scope.getUid = (): string => $ctrl.uid

        $scope.fetchMember = async (): Promise<void> => {
            const memberQuery: {
                service: number | any,
                where: object | any,
                images?: object[] | any[],
            } = {
                service: [$scope.options.service],
                where: {}
            }
            if ($scope.options.MemberKey) {
                memberQuery.where.MemberKey = $scope.options.MemberKey
            } else if ($scope.options.MemberStateLicense) {
                memberQuery.where.MemberStateLicense = $scope.options.MemberStateLicense
            }
            if ($scope.options.images) {
                memberQuery.images = $scope.options.images
            }
            if (
                memberQuery.service &&
                (memberQuery.where.MemberKey || memberQuery.where.MemberStateLicense)
            ) {
                await Idx.fetchMembers($scope, 'collection', memberQuery, true, 'MemberDetailsList')
            } else {
                console.error('No Service Id or Member Key/License is fetch from')
            }
        }

        /**
         * With the current collection results, parse $scope.memberMerged and $scope.memberCombined by joining the
         * Member object together for easier to read results. Note it may not always be ideal to use this data.
         */
        $scope.individualMember = async (): Promise<void> => $q((resolve: void | any) => {
            if ($scope.collection && $scope.collection.completed && $scope.collection.models.length > 0) {
                $scope.memberMerged = {}
                const tempCollection = [].concat($scope.collection.models).reverse()
                tempCollection.forEach((agent: any) => {
                    _.extend($scope.memberMerged, agent)
                })

                $scope.memberCombined = {}
                $scope.collection.models.map((agent: any) => {
                    Object.keys(agent).forEach((key: string) => {
                        // If not an empty array
                        if (
                            !_.isArray(agent[key]) ||
                            (_.isArray(agent[key]) && agent[key].length > 0)
                        ) {
                            $scope.memberCombined[key] = $scope.memberCombined[key] || []
                            // If not already in the agentCombined
                            if (!$scope.memberCombined[key].includes(agent[key])) {
                                $scope.memberCombined[key].push(agent[key])
                            }
                        }
                    })
                })
            }
            resolve()
        })

        /**
         * Display an MLS' Name
         */
        $scope.getMLSName = (): string => Idx.getMLSVariables($scope.model.data._ServiceId).name

        /**
         * Display an MLS' required legal disclaimer
         * @param html - if output should be HTML safe
         */
        $scope.getMLSDisclaimer = (html?: boolean): string => {
            let disclaimer = Idx.getMLSVariables($scope.collection.models[0]._ServiceId).disclaimer
            if ($scope.collection.models[0].ModificationTimestamp) {
                disclaimer = `Member last updated ${moment($scope.collection.models[0].ModificationTimestamp).format('M/D/YY HH:mm a')}. ${disclaimer}`
            }
            if ($scope.collection.models[0].fetchDate) {
                disclaimer = `Last checked ${moment($scope.model.meta.data.fetchDate).format('M/D/YY')}. ${disclaimer}`
            }

            return html ? $sce.trustAsHtml(disclaimer) : disclaimer
        }

        /**
         * Function that runs when widget is destroyed
         */
        $scope.remove = (): void => {
        }

        /**
         * Output console if not in production
         */
        $scope.devLog = (item1?: any, item2?: any): void => {
            if (!Stratus.Environment.get('production')) {
                console.log(item1, item2)
            }
        }
    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
