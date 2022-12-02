// Froala Directive
// ----------------

// Runtime
import _ from 'lodash'
import jQuery from 'jquery'
import angular from 'angular'
import {StratusDirective} from './baseNew'

// Stratus Services
import {Stratus} from '@stratusjs/runtime/stratus'
import {Model} from '@stratusjs/angularjs/services/model'

// Froala Requirements
import 'froala'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror'
import 'froala-align'
import 'froala-code-beautifier'
import 'froala-code-view'
import 'froala-draggable'
import 'froala-entities'
import 'froala-file'
import 'froala-forms'
import 'froala-fullscreen'
import 'froala-help'
import 'froala-image'
import 'froala-image-manager'
import 'froala-inline-style'
import 'froala-link'
import 'froala-lists'
import 'froala-paragraph-format'
import 'froala-paragraph-style'
import 'froala-quick-insert'
import 'froala-quote'
import 'froala-table'
import 'froala-url'
import 'froala-video'
import 'froala-word-paste'
import {Collection} from '@stratusjs/angularjs/services/collection'

// This directive intends to provide basic froala capabilities.
Stratus.Directives.Froala = (): StratusDirective => {
    let generatedIds: any = 0
    const defaultConfig: any = {
        immediateAngularModelUpdate: false,
        angularIgnoreAttrs: null
    }

    const innerHtmlAttr = 'innerHTML'

    const froalaConfig = angular.module('stratusApp').value('froalaConfig') || {}

    // Constants
    const MANUAL = 'manual'
    const AUTOMATIC = 'automatic'
    const SPECIAL_TAGS = ['img', 'button', 'input', 'a']

    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            property: '@',
            froalaOptions: '=stratusFroala',
            staticOptions: '@froalaOptions', // Alias of stratusFroala, but for instances where the data cannot be bound
            initFunction: '&froalaInit',
            autoSave: '@' // A bool/string to define if the model will auto save on focus out or Enter presses. Defaults to true
        },
        link: (
            scope: angular.IScope & {
                uid?: string
                elementId?: string
                initialized?: boolean
                collection?: Collection
                model?: Model
                property?: string
                froalaOptions?: any
                staticOptions?: string
                initFunction?: (options: any) => void
                autoSave?: string|boolean
                initMode?: string
                settle?: () => void
                accept?: () => void
                value: any
            },
            element: JQuery & {
                froalaEditor?: any
            },
            attrs: angular.IAttributes & {
                elementId?: string
                limit?: string
                target?: string
            },
            ngModel: angular.INgModelController
        ) => {
            // Initialize
            scope.uid = _.uniqueId('froala_')
            Stratus.Instances[scope.uid] = scope

            // Data Connectivity
            scope.model = null

            if (!ngModel || !scope.property) {
                console.warn(scope.uid + ' has no model or property!')
                return
            }

            // Twiddle JQLite Element to JQuery to get in touch with Froala
            element = element.length ? jQuery(element[0]) : element

            const specialTag = SPECIAL_TAGS.indexOf(element.prop('tagName').toLowerCase()) !== -1

            const ctrl: any = {
                editorInitialized: false
            }

            if (scope.staticOptions && typeof scope.staticOptions === 'string') {
                scope.staticOptions = JSON.parse(scope.staticOptions)
            }

            scope.initMode = attrs.froalaInit ? MANUAL : AUTOMATIC

            scope.settle = () => {
                if (ctrl.editorInitialized &&
                    scope.model instanceof Model &&
                    scope.property &&
                    scope.model.get(scope.property) !== scope.value
                ) {
                    scope.model.set(scope.property, scope.value)
                    if (!scope.$root.$$phase) {
                        scope.$apply()
                    }
                }
            }

            scope.accept = () => {
                if (ctrl.editorInitialized &&
                    scope.model instanceof Model &&
                    scope.property &&
                    scope.model.changed === true
                ) {
                    // scope.model.set(scope.property, scope.value);
                    scope.model.throttleSave()
                }
            }

            // We may not be using a cancel function
            /* scope.cancel = () => {
             if (ctrl.editorInitialized
             && scope.model instanceof model
             && scope.property)
             {
             scope.value = scope.model.get(scope.property);
             ngModel.$render();
             }
             }; */

            ctrl.init = () => {
                if (!attrs.id) {
                    // generate an ID if not present
                    attrs.$set('id', 'froala-' + generatedIds++)
                }

                scope.$watch('model.data.' + scope.property, (data: any) => {
                    scope.value = data
                    ngModel.$render() // if the value changes, show the new change (since rendering doesn't always happen)
                })

                // init the editor
                if (scope.initMode === AUTOMATIC) {
                    ctrl.createEditor()
                }

                // Instruct ngModel how to update the froala editor
                ngModel.$render = () => {
                    if (ctrl.editorInitialized) {
                        if (specialTag) {
                            const tags: any = scope.value

                            // add tags on element
                            if (tags) {
                                for (const attr in tags) {
                                    if (Object.prototype.hasOwnProperty.call(tags, attr) && attr !== innerHtmlAttr) {
                                        element.attr(attr, tags[attr])
                                    }
                                }
                                if (Object.prototype.hasOwnProperty.call(tags, innerHtmlAttr)) {
                                    element[0].innerHTML = tags[innerHtmlAttr]
                                }
                            }
                        } else if (element.froalaEditor('html.get') !== scope.value) { // only rerender if there is a change
                            element.froalaEditor('html.set', scope.value || '', true)

                            // This will reset the undo stack everytime the model changes externally. Can we fix this?
                            element.froalaEditor('undo.reset')
                            element.froalaEditor('undo.saveStep')
                        }
                    }
                }

                ngModel.$isEmpty = (value: any) => {
                    if (!value) {
                        return true
                    }

                    return element.froalaEditor('node.isEmpty', jQuery('<div>' + value + '</div>').get(0))
                }
            }

            ctrl.createEditor = (froalaInitOptions: any) => {
                ctrl.listeningEvents = ['froalaEditor']
                if (!ctrl.editorInitialized) {
                    froalaInitOptions = (froalaInitOptions || {})
                    ctrl.options =
                        angular.extend({}, defaultConfig, froalaConfig, scope.froalaOptions, scope.staticOptions, froalaInitOptions)

                    if (ctrl.options.immediateAngularModelUpdate) {
                        ctrl.listeningEvents.push('keyup')
                    }

                    // flush means to load data-ng-model into editor
                    const flushNgModel: any = () => {
                        ctrl.editorInitialized = true
                        ngModel.$render()
                    }

                    if (specialTag) {
                        // flush before editor is initialized
                        flushNgModel()
                    } else {
                        ctrl.registerEventsWithCallbacks('froalaEditor.initialized', () => {
                            flushNgModel()
                        })
                    }

                    // Register events provided in the options
                    // Registering events before initializing the editor will bind the initialized event correctly.
                    for (const eventName in ctrl.options.events) {
                        if (Object.prototype.hasOwnProperty.call(ctrl.options.events, eventName)) {
                            ctrl.registerEventsWithCallbacks(eventName, ctrl.options.events[eventName])
                        }
                    }

                    ctrl.froalaElement = element.froalaEditor(ctrl.options).data('froala.editor').$el
                    ctrl.froalaEditor = angular.bind(element, element.froalaEditor)
                    ctrl.initListeners()

                    // assign the froala instance to the options object to make methods available in parent scope
                    if (scope.froalaOptions) {
                        scope.froalaOptions.froalaEditor = ctrl.froalaEditor
                    }

                    // TODO: the code below does not work (this was the recommended method from support)
                    // https://wysiwyg-editor.froala.help/hc/en-us/articles/360001272865-How-can-I-activate-the-editor-license-
                    // TODO: remove all failed attempts to issue key
                    // Assign the License
                    // element.froalaEditor({key: Stratus.Api.Froala})
                }
            }

            ctrl.initListeners = () => {
                // TODO: remove this if it doesn't work. HINT: it doesn't work right now but we need to find a way to do it.
                // This never executes
                // element.on('froalaEditor.initialized', () => {
                //   //scope.$evalAsync(ctrl.updateModelView)
                //   console.log('initialized', ctrl.froalaEditor)
                //   console.log('initialized', element.froalaEditor)
                //   element.froalaEditor({key: Stratus.Api.Froala})
                // })

                if (ctrl.options.immediateAngularModelUpdate) {
                    ctrl.froalaElement.on('keyup', () => {
                        scope.$evalAsync(ctrl.updateModelView)
                    })
                }
                element.on('froalaEditor.contentChanged', () => {
                    scope.$evalAsync(ctrl.updateModelView)
                })

                element.bind('$destroy', () => {
                    element.off(ctrl.listeningEvents.join(' '))
                    element.froalaEditor('destroy')
                    element = null
                })

                if (scope.autoSave !== false &&
                    scope.autoSave !== 'false'
                ) {
                    element.froalaEditor('events.on', 'blur', (event: any) => {
                        if (ctrl.editorInitialized) {
                            switch (event.type) {
                                case 'focusout':
                                case 'blur':
                                    scope.$apply(scope.accept)
                                    break
                            }
                        }
                    })
                }

                // FIXME need to make blur on cancel
                /* element.froalaEditor('events.on', 'keydown keypress', (event: any) => {
                 if (ctrl.editorInitialized) {
                 switch (event.which) {
                 case Stratus.Key.Escape:
                 scope.$apply(scope.cancel);
                 element.blur();
                 break;
                 }
                 }
                 }); */
            }

            ctrl.updateModelView = () => {
                let modelContent: any = null

                if (specialTag) {
                    const attributeNodes: any = element[0].attributes
                    const attributes: any = {}

                    for (const attributeNode of attributeNodes) {
                        const attrName: any = attributeNode.name
                        if (ctrl.options.angularIgnoreAttrs && ctrl.options.angularIgnoreAttrs.indexOf(attrName) !== -1) {
                            continue
                        }
                        attributes[attrName] = attributeNode.value
                    }
                    if (element[0].innerHTML) {
                        attributes[innerHtmlAttr] = element[0].innerHTML
                    }
                    modelContent = attributes
                } else {
                    const returnedHtml: any = element.froalaEditor('html.get')
                    if (angular.isString(returnedHtml)) {
                        modelContent = returnedHtml
                    }
                }

                scope.value = modelContent
                scope.settle()
            }

            ctrl.registerEventsWithCallbacks = (eventName: any, callback: any) => {
                if (eventName && callback) {
                    ctrl.listeningEvents.push(eventName)
                    element.on(eventName, callback)
                }
            }

            if (scope.initMode === MANUAL) {
                const controls: any = {
                    initialize: ctrl.createEditor,
                    destroy() {
                        if (ctrl.froalaEditor) {
                            ctrl.froalaEditor('destroy')
                            ctrl.editorInitialized = false
                        }
                    },
                    getEditor() {
                        return ctrl.froalaEditor ? ctrl.froalaEditor : null
                    }
                }
                scope.initFunction({initControls: controls})
            }

            scope.$watch('ngModel', (data: any) => {
                if (data instanceof Model && !_.isEqual(data, scope.model)) {
                    scope.model = data
                    if (ctrl.initialized !== true) {
                        const unwatch: any = scope.$watch('model.data', (dataCheck: any) => {
                            if (dataCheck !== undefined) {
                                unwatch() // Remove this watch as soon as it's run once
                                ctrl.init() // Initialize only after there is a model to work with
                            }
                        })
                    }
                }
            })
        }
    }
}

Stratus.Directives.FroalaView = ($sce: any) => ({
    restrict: 'ACM',
    scope: false,
    link(scope: any, element: any, attrs: any) {
        element.addClass('fr-view')
        scope.$watch(attrs.froalaView, (nv: any) => {
            if (nv || nv === '') {
                const explicitlyTrustedValue: any = $sce.trustAsHtml(nv)
                element.html(explicitlyTrustedValue.toString())
            }
        })
    }
})

