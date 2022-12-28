// Drag Directive
// -----------------

// Runtime
import {
    uniqueId
} from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    IAugmentedJQuery,
    IScope
} from 'angular'
import {
    StratusDirective
} from './baseNew'
import {safeUniqueId} from "@stratusjs/core/misc";


// Environment
const packageName = 'angularjs-extras'
const moduleName = 'directives'
const directiveName = 'drag'

Stratus.Directives.Drag = (
    // $log: ILogService,,
    // $parse: IParseService
): StratusDirective => ({
    restrict: 'A',
    scope: {
        ngModel: '=ngModel'
    },
    link: (
        $scope: IScope,
        $element: IAugmentedJQuery,
    ) => {
        // Initialize
        Stratus.Instances[safeUniqueId(packageName, moduleName, directiveName)] = $scope

        $element.bind('dragstart', (rawEvent) => {
            const event = rawEvent as unknown as DragEvent // Needs way to convert
            console.log('dragstart:', event)
            event.dataTransfer.effectAllowed = 'copy' // only dropEffect='copy'
            // will be droppable
            // FIXME: this one works in es6 with rollup (toggle accordingly)
            // event.dataTransfer.setData('Text', this.id) // required otherwise
            // Typescript doesn't believe id exists
            // FIXME: this one works in es2019 with systemjs (toggle accordingly)
            // event.dataTransfer.setData('Text', get(this, 'id')) // required otherwise
            // doesn't work
        })

        $element.bind('dragenter', rawEvent => {
            const event = rawEvent as unknown as DragEvent // Needs way to convert
            console.log('dragenter:', event)
            return false
        })

        $element.bind('dragover', rawEvent => {
            const event = rawEvent as unknown as DragEvent // Needs way to convert
            console.log('dragover:', event)
            if (event.preventDefault) {
                event.preventDefault()
            }
            event.dataTransfer.dropEffect = 'move' // or 'copy'
            return false
        })

        $element.bind('dragleave', rawEvent => {
            const event = rawEvent as unknown as DragEvent // Needs way to convert
            console.log('dragleave:', event)
        })

        $element.bind('drop', rawEvent => {
            const event = rawEvent as unknown as DragEvent // Needs way to convert
            console.log('drop:', event)
            if (event.stopPropagation) {
                event.stopPropagation()
            } // stops the browser from redirecting... why???
            const el = document.getElementById(event.dataTransfer.getData('Text'))
            el.parentNode.removeChild(el)
            return false
        })
    },
})
