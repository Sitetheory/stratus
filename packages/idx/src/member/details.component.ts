// IdxMemberDetails Component
// @stratusjs/idx/member/details.component
// <stratus-idx-member-details>
// --------------

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Angular 1 Modules
import 'angular-material'
import 'angular-sanitize'

// Services
import '@stratusjs/idx/idx'
// tslint:disable-next-line:no-duplicate-imports
import {CompileFilterOptions, IdxDetailsScope, IdxEmitter, IdxService, Member} from '@stratusjs/idx/idx'

// Stratus Dependencies
import {isJSON, LooseObject} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'

// Custom Filters
import 'stratus.filters.math'
import 'stratus.filters.moment'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'member'
const componentName = 'details'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

export type IdxMemberDetailsScope = IdxDetailsScope<Member> & LooseObject & { // FIXME do not extend LooseObject
}

Stratus.Components.IdxMemberDetails = {
    bindings: {
        elementId: '@',
        tokenUrl: '@',
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
        $scope: IdxMemberDetailsScope,
        // tslint:disable-next-line:no-shadowed-variable
        Model: any,
        Idx: IdxService,
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(moduleName) + '_' + _.camelCase(componentName) + '_')
        $scope.elementId = $attrs.elementId || $ctrl.uid
        Stratus.Instances[$scope.elementId] = $scope
        if ($attrs.tokenUrl) {
            Idx.setTokenURL($attrs.tokenUrl)
        }
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
            Idx.registerDetailsInstance($scope.elementId, moduleName, $scope)
            // console.log(this.uid)

            console.log('options', $scope.options, $attrs)
            $scope.fetchMember()
            Idx.emit('init', $scope)
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

        $scope.fetchMember = async (): Promise<void> => {
            /*
            {
                service: number | any,
                where: object | any,
                images?: object[] | any[],
            }
             */
            const memberQuery: CompileFilterOptions = {
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
        $scope.getMLSName = (): string => Idx.getMLSVariables($scope.model.data._ServiceId)[0].name // FIXME more checks need to happen here

        $scope.on = (emitterName: string, callback: IdxEmitter) => Idx.on($scope.elementId, emitterName, callback)

        $scope.remove = (): void => {
        }

        /**
         * Output console if not in production
         */
        $scope.devLog = (item1?: any, item2?: any): void => {
            if (cookie('env')) {
                console.log(item1, item2)
            }
        }
    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
