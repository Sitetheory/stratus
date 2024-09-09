// Redactor Directive
// -----------------
// TODO untested functionality not used anywhere

// Runtime
import {extend, forEach, isUndefined} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    IAttributes,
    IAugmentedJQuery,
    INgModelController,
    IScope,
    ITimeoutService,
    module
} from 'angular'
import {StratusDirective} from './baseNew'

export type RedactorScope = IScope & {
    redactorLoaded?: boolean
}
type RedactorOptions = {
    changeCallback?: CallableFunction
}

// This directive intends to provide basic logic for extending
// the Stratus Auto-Loader for various contextual uses.
Stratus.Directives.Redactor = (
    $timeout: ITimeoutService
): StratusDirective => ({
    restrict: 'A',
    require: 'ngModel',
    link: (
        $scope: RedactorScope,
        $element: IAugmentedJQuery & {redactor: (value1?: unknown, value2?: unknown) => unknown},
        $attrs: IAttributes,
        ngModel: INgModelController
    ) => {
        // Initialize
        const redactorOptions: RedactorOptions = {}
        module('angular-redactor', []).constant('redactorOptions', redactorOptions)

        // Inject CSS
        forEach([
            `${Stratus.BaseUrl}sitetheorycore/dist/redactor/redactor.css`,
            `${Stratus.BaseUrl}sitetheorycore/dist/redactor/redactor-clips.css`,
            `${Stratus.BaseUrl}${Stratus.BundlePath}node_modules/codemirror/lib/codemirror.css`
        ], (url) => {
            Stratus.Internals.CssLoader(url).then()
        })

        // Expose scope let with loaded state of Redactor
        $scope.redactorLoaded = false

        const updateModel = (value: any) => {
            // $timeout to avoid $digest collision
            $timeout(() => {
                $scope.$apply(() => {
                    ngModel.$setViewValue(value)
                })
            })
        }
        const options: RedactorOptions = {
            changeCallback: updateModel
        }
        const additionalOptions = $attrs.redactor
            ? $scope.$eval($attrs.redactor)
            : {}
        let editor: unknown

        extend(options, redactorOptions, additionalOptions)

        // prevent collision with the constant values on ChangeCallback
        const changeCallback = additionalOptions.changeCallback || redactorOptions.changeCallback
        if (changeCallback) {
            options.changeCallback = function (value: any) {
                updateModel.call(this, value)
                changeCallback.call(this, value)
            }
        }

        // put in timeout to avoid $digest collision.  call render() to
        // set the initial value.
        $timeout(() => {
            editor = $element.redactor(options)
            ngModel.$render()
            $element.on('remove', () => {
                $element.off('remove')
                $element.redactor('core.destroy')
            })
        })

        ngModel.$render = () => {
            if (!isUndefined(editor)) {
                $timeout(() => {
                    $element.redactor('code.set', ngModel.$viewValue || '')
                    $element.redactor('placeholder.toggle')
                    $scope.redactorLoaded = true
                })
            }
        }
    }
})
