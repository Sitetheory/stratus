// Drag Directive
// -----------------

// Runtime
import {get, uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    IAugmentedJQuery,
    IScope
} from 'angular'


// Environment
// const min = !cookie('env') ? '.min' : ''
const name = 'drag'
// const localPath = '@stratusjs/angularjs-extras/src/directives'

Stratus.Directives.Drag = (
    // $log: ILogService,,
    // $parse: IParseService
) => ({
    restrict: 'A',
    scope: {
        ngModel: '=ngModel'
    },
    link: (
        $scope: IScope,
        $element: IAugmentedJQuery,
    ) => {
        // Initialize
        Stratus.Instances[uniqueId(name + '_')] = $scope

        $element.bind('dragstart', function (rawEvent) {
            const event = rawEvent as unknown as DragEvent // Needs way to convert
            console.log('dragstart:', event)
            event.dataTransfer.effectAllowed = 'copy' // only dropEffect='copy'
            // will be droppable
            // event.dataTransfer.setData('Text', this.id) // required otherwise
            // Typescript doesn't believe id exists
            event.dataTransfer.setData('Text', get(this, 'id')) // required otherwise
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
