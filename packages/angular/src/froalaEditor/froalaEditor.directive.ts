/* tslint:disable */
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms'
import {Directive, ElementRef, EventEmitter, Input, NgZone, Output, forwardRef} from '@angular/core'

// @ts-ignore
import FroalaEditor from 'froala-editor'

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[froalaEditor]',
    exportAs: 'froalaEditor',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR, useExisting:
                forwardRef(() => FroalaEditorDirective),
            multi: true
        }
    ]
})
export class FroalaEditorDirective implements ControlValueAccessor {

    constructor(el: ElementRef, private zone: NgZone) {

        const element: any = el.nativeElement

        // check if the element is a special tag
        if (this.SPECIAL_TAGS.indexOf(element.tagName.toLowerCase()) != -1) {
            this._hasSpecialTag = true
        }
        this._element = element

        this.zone = zone
    }

    // End ControlValueAccessor methods.

    // froalaEditor directive as input: store the editor options
    @Input() set froalaEditor(opts: any) {
        this._opts = this.clone(opts || this._opts)
        this._opts = {...this._opts}
    }

    // froalaModel directive as input: store initial editor content
    @Input() set froalaModel(content: any) {
        this.updateEditor(content)
    }

    // editor options
    private _opts: any = {
        immediateAngularModelUpdate: false,
        angularIgnoreAttrs: null
    }

    private _element: any

    private SPECIAL_TAGS: string[] = ['img', 'button', 'input', 'a']
    private INNER_HTML_ATTR = 'innerHTML'
    private _hasSpecialTag = false

    // editor element
    private _editor: any

    // initial editor content
    private _model: string

    private _editorInitialized = false

    private _oldModel: string = null

    // froalaModel directive as output: update model if editor contentChanged
    @Output() froalaModelChange: EventEmitter<any> = new EventEmitter<any>()

    // froalaInit directive as output: send manual editor initialization
    @Output() froalaInit: EventEmitter<Object> = new EventEmitter<Object>()

    // Begin ControlValueAccessor methods.
    onChange = (_: any) => {
    }
    onTouched = () => {
    }

    // Form model content changed.
    writeValue(content: any): void {
        this.updateEditor(content)
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn
    }

    // TODO: replace clone method with better possible alternate
    private clone(item: any) {
        const me = this
        if (!item) {
            return item
        } // null, undefined values check

        const types = [Number, String, Boolean]
        let result: string | number | boolean | any[] | { [key: string]: any } | Date

        // normalizing primitives if someone did new String('aaa'), or new Number('444');
        types.forEach((type: any) => {
            if (item instanceof type) {
                result = type(item)
            }
        })

        if (typeof result === 'undefined') {
            if (Object.prototype.toString.call(item) === '[object Array]') {
                result = []
                item.forEach((child: any, index: string|number, array: any[]) => {
                    // @ts-ignore
                    result[index] = me.clone(child)
                })
            } else if (typeof item === 'object') {
                // testing that this is DOM
                if (item.nodeType && typeof item.cloneNode === 'function') {
                    result = item.cloneNode(true)
                } else if (!item.prototype) { // check that this is a literal
                    if (item instanceof Date) {
                        result = new Date(item)
                    } else {
                        // it is an object literal
                        result = {}
                        for (const i in item) {
                            result[i] = me.clone(item[i])
                        }
                    }
                } else {
                    if (false && item.constructor) {
                        result = new item.constructor()
                    } else {
                        result = item
                    }
                }
            } else {
                result = item
            }
        }
        return result
    }

    // Update editor with model contents.
    private updateEditor(content: any) {
        if (JSON.stringify(this._oldModel) === JSON.stringify(content)) {
            return
        }

        if (!this._hasSpecialTag) {
            this._oldModel = content
        } else {
            this._model = content
        }

        if (this._editorInitialized) {
            if (!this._hasSpecialTag) {
                this._editor.html.set(content)
            } else {
                this.setContent()
            }
        } else {
            if (!this._hasSpecialTag) {
                this._element.innerHTML = content || ''
            } else {
                this.setContent()
            }
        }
    }

    // update model if editor contentChanged
    private updateModel() {
        this.zone.run(() => {

            let modelContent: any = null

            if (this._hasSpecialTag) {

                const attributeNodes = this._element.attributes
                const attrs: { [key: string]: any } = {}

                for (let i = 0; i < attributeNodes.length; i++) {

                    const attrName = attributeNodes[i].name
                    if (this._opts.angularIgnoreAttrs && this._opts.angularIgnoreAttrs.indexOf(attrName) != -1) {
                        continue
                    }

                    attrs[attrName] = attributeNodes[i].value
                }

                if (this._element.innerHTML) {
                    attrs[this.INNER_HTML_ATTR] = this._element.innerHTML
                }

                modelContent = attrs
            } else {

                const returnedHtml: any = this._editor.html.get()
                if (typeof returnedHtml === 'string') {
                    modelContent = returnedHtml
                }
            }
            if (this._oldModel !== modelContent) {
                this._oldModel = modelContent

                // Update froalaModel.
                this.froalaModelChange.emit(modelContent)

                // Update form model.
                this.onChange(modelContent)
            }

        })
    }

    private registerEvent(eventName: any, callback: any) {

        if (!eventName || !callback) {
            return
        }

        if (!this._opts.events) {
            this._opts.events = {}
        }

        this._opts.events[eventName] = callback
    }

    private initListeners() {
        const self = this
        // Check if we have events on the editor.
        if (this._editor.events) {
            // bind contentChange and keyup event to froalaModel
            this._editor.events.on('contentChanged', function() {
                self.updateModel()
            })
            this._editor.events.on('mousedown', function() {
                setTimeout(function() {
                    self.onTouched()
                }, 0)
            })

            if (this._opts.immediateAngularModelUpdate) {
                this._editor.events.on('keyup', function() {
                    setTimeout(function() {
                        self.updateModel()
                    }, 0)
                })
            }
        }

        this._editorInitialized = true
    }

    private createEditor() {
        if (this._editorInitialized) {
            return
        }

        this.setContent(true)

        // init editor
        this.zone.runOutsideAngular(() => {
            // Add listeners on initialized event.
            if (!this._opts.events) {
                this._opts.events = {}
            }

            // Register initialized event.
            this.registerEvent('initialized', this._opts.events && this._opts.events.initialized)
            const existingInitCallback = this._opts.events.initialized
            // Default initialized event.
            if (!this._opts.events.initialized || !this._opts.events.initialized.overridden) {
                this._opts.events.initialized = () => {
                    this.initListeners()
                    existingInitCallback && existingInitCallback.call(this._editor, this)
                }
                this._opts.events.initialized.overridden = true
            }

            // Initialize the Froala Editor.
            this._editor = new FroalaEditor(
                this._element,
                this._opts
            )
        })
    }

    private setHtml() {
        this._editor.html.set(this._model || '')

        // This will reset the undo stack everytime the model changes externally. Can we fix this?
        this._editor.undo.reset()
        this._editor.undo.saveStep()
    }

    private setContent(firstTime = false) {
        const self = this

        // Set initial content
        if (this._model || this._model === '') {
            this._oldModel = this._model
            if (this._hasSpecialTag) {

                const tags = this._model

                // add tags on element
                if (tags) {

                    // @ts-ignore
                    for (const attr in tags) {
                        if (tags.hasOwnProperty(attr) && attr != this.INNER_HTML_ATTR) {
                            this._element.setAttribute(attr, tags[attr])
                        }
                    }

                    if (tags.hasOwnProperty(this.INNER_HTML_ATTR)) {
                        // @ts-ignore
                        this._element.innerHTML = tags[this.INNER_HTML_ATTR]
                    }
                }
            } else {
                if (firstTime) {
                    this.registerEvent('initialized', function() {
                        self.setHtml()
                    })
                } else {
                    self.setHtml()
                }
            }
        }
    }

    private destroyEditor() {
        if (this._editorInitialized) {
            this._editor.destroy()
            this._editorInitialized = false
        }
    }

    private getEditor() {
        if (this._element) {
            return this._editor
        }

        return null
    }

    // send manual editor initialization
    private generateManualController() {
        const controls = {
            initialize: this.createEditor.bind(this),
            destroy: this.destroyEditor.bind(this),
            getEditor: this.getEditor.bind(this),
        }
        this.froalaInit.emit(controls)
    }

    // TODO not sure if ngOnInit is executed after @inputs
    ngAfterViewInit() {
        // check if output froalaInit is present. Maybe observers is private and should not be used??
        // TODO: how to better test that an output directive is present.
        if (!this.froalaInit.observers.length) {
            this.createEditor()
        } else {
            this.generateManualController()
        }
    }

    ngOnDestroy() {
        this.destroyEditor()
    }
}
