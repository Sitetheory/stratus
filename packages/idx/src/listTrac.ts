// ListTrac Service
// @stratusjs/idx/listTrac
// TODO ListTrac on hold

// Runtime
// import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'
// import {IPromise} from 'angular'
import {DOMComplete} from '@stratusjs/core/dom'

// Services
import '@stratusjs/angularjs/services/model' // Needed as $provider
// import {Model} from '@stratusjs/angularjs/services/model' // Needed as Class
import '@stratusjs/angularjs/services/collection' // Needed as $provider
// import {Collection} from '@stratusjs/angularjs/services/collection' // Needed as Class

// Stratus Dependencies
// import {isJSON} from '@stratusjs/core/misc'
// import {cookie} from '@stratusjs/core/environment'


// Environment
// const min = !cookie('env') ? '.min' : ''
// There is not a very consistent way of pathing in Stratus at the moment
// const localDir = `/${boot.bundle}node_modules/@stratusjs/${packageName}/src/${moduleName}/`

Stratus.Services.ListTrac = [
    '$provide',
    ($provide: any) => {
        $provide.factory('ListTrac', (
            $injector: angular.auto.IInjectorService,
            $http: angular.IHttpService,
            $q: angular.IQService
            ) => {
                console.log('Running ListTrac')
                let listTracLoaded = false
                let listTracPending = false
                let listTracAccountId = ''
                /*import('https://code.listtrac.com/monitor.ashx?acct=x_100633&nonjq=1').then(test => {
                    console.log('imported')
                })*/
                /*DOMComplete().then(() => {
                    require(`https://code.listtrac.com/monitor.ashx?nonjq=1&acct=${listTracAccountId}`).then(() => {
                        console.log('imported ListTrac')
                    })
                })*/

                // loadListTrac()

                async function loadListTrac() {
                    if (!listTracAccountId) {
                        console.warn('ListTrac Account not provided, will not load')
                        return
                    }
                    // Only attempt to load ListTrac if it's not already loaded or currently attempting to load
                    if (!listTracPending && !listTracLoaded) {
                        try {
                            listTracPending = true
                            // TODO check if already loaded
                            await DOMComplete()
                            await require(`https://code.listtrac.com/monitor.ashx?nonjq=1&acct=${listTracAccountId}`)
                            listTracLoaded = true
                            console.log('imported ListTrac')
                        } catch (e) {
                            console.error(e)
                        }
                        listTracPending = false
                    }
                }

                function setAccountId(accountId: string): void {
                    listTracAccountId = accountId
                    console.log('Set account id to', listTracAccountId)
                    loadListTrac() // TODO should only load when a trackEvent needs to happen (e.g. Details view)
                }

                function randomFunction(): string {
                    return 'Test Function Ran'
                }

                async function randomFunctionAfterDOM(): Promise<string> {
                    await DOMComplete()
                    return 'Test Function Ran After DOM'
                }

                return {
                    randomFunction,
                    setAccountId
                }
            }
        )
    }
]
