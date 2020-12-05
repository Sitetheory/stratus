// Angular Core
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit,
} from '@angular/core'
import {
    FormBuilder,
    FormControl,
    FormGroup
} from '@angular/forms'

// Angular Material
import {
    MatDialog
} from '@angular/material/dialog'

// External
import {
    Observable,
    ObservableInput,
    Subject,
    Subscriber,
    timer
} from 'rxjs'
import {
    catchError,
    debounce
} from 'rxjs/operators'

// SVG Icons
import {
    DomSanitizer
} from '@angular/platform-browser'
// import {
//     MatIconRegistry
// } from '@angular/material/icon'

// External Dependencies
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import _ from 'lodash'

// Angular Editor Dependencies
import {
    AngularEditorConfig
} from '@kolkov/angular-editor'

// Quill Dependencies
// import Quill from 'quill'
// import {
//     EditorChangeContent,
//     EditorChangeSelection
// } from 'ngx-quill'

// Components
import {
    RootComponent
} from '@stratusjs/angular/core/root.component'
import {
    MediaDialogComponent,
    MediaDialogData
} from '@stratusjs/angular/editor/media-dialog.component'

// Services
import {Registry} from '@stratusjs/angularjs/services/registry'
import {cookie} from '@stratusjs/core/environment'

// Core Classes
import {
    EventManager
} from '@stratusjs/core/events/eventManager'
import {
    EventBase
} from '@stratusjs/core/events/eventBase'

// Core Interfaces
import {
    TriggerInterface
} from '@stratusjs/angular/core/trigger.interface'

// AngularJS Classes
import {
    Model
} from '@stratusjs/angularjs/services/model'
import {
    Collection
} from '@stratusjs/angularjs/services/collection'
import {
    CodeViewDialogComponent,
    CodeViewDialogData
} from '@stratusjs/angular/editor/code-view-dialog.component'

// Transformers
import {
    keys
} from 'ts-transformer-keys'
import {LooseObject} from '@stratusjs/core/misc'

// CodeMirror
import 'codemirror'
import 'codemirror/mode/xml/xml'

// Froala Plugins
import 'froala-plugins'
import 'froala-embedly'
import 'froala-font-awesome'
import 'froala-image-tui'
import 'froala-spell-checker'

// Froala Individual Plugins
// import 'froala-align'
// import 'froala-char-counter'
// import 'froala-code-beautifier'
// import 'froala-code-view'
// import 'froala-colors'
// import 'froala-cryptojs'
// import 'froala-draggable'
// import 'froala-edit-in-popup'
// import 'froala-emoticons'
// import 'froala-entities'
// import 'froala-file'
// import 'froala-files-manager'
// import 'froala-font-family'
// import 'froala-font-size'
// import 'froala-forms'
// import 'froala-fullscreen'
// import 'froala-help'
// import 'froala-image'
// import 'froala-image-manager'
// import 'froala-inline-class'
// import 'froala-inline-style'
// import 'froala-line-breaker'
// import 'froala-line-height'
// import 'froala-link'
// import 'froala-lists'
// import 'froala-paragraph-format'
// import 'froala-paragraph-style'
// import 'froala-print'
// import 'froala-quick-insert'
// import 'froala-quote'
// import 'froala-save'
// import 'froala-special-characters'
// import 'froala-table'
// import 'froala-trim-video'
// import 'froala-url'
// import 'froala-video'
// import 'froala-word-paste'

// Froala Custom Plugins
import '@stratusjs/angular/froala/plugins/mediaManager'

// Local Setup
const installDir = '/assets/1/0/bundles'
const systemPackage = '@stratusjs/angular'
const froalaPackage = 'froala-editor'
const codeMirrorPackage = 'codemirror'
const moduleName = 'editor'

// Directory Template
const localDir = `${installDir}/${boot.configuration.paths[`${systemPackage}/*`].replace(/[^\/]*$/, '')}`
const codeMirrorDir = `${installDir}/${boot.configuration.paths[`${codeMirrorPackage}/*`].replace(/[^\/]*$/, '')}`
const froalaDir = `${installDir}/${boot.configuration.paths[froalaPackage].replace(/js\/[^\/]*$/, '')}`

// Utility Functions
const has = (object: object, path: string) => _.has(object, path) && !_.isEmpty(_.get(object, path))

// export interface Model {
//     completed: boolean;
//     data: object;
// }

/**
 * @title AutoComplete Selector with Drag&Drop Sorting
 */
@Component({
    // selector: 'sa-selector-component',
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${moduleName}/${moduleName}.component.html`,
    // FIXME: This doesn't work, as it seems Angular attempts to use a System.js import instead of their own, so it will
    // require the steal-css module
    // styleUrls: [
    //     `${localDir}/${moduleName}/${moduleName}.component.css`
    // ],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class EditorComponent extends RootComponent implements OnInit, TriggerInterface { // implements OnInit, OnChanges

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string
    dev = !!cookie('env')
    editor: 'froala'|'angular-editor'|'quill' = this.dev ? 'froala' : 'angular-editor'

    // Registry Attributes
    @Input() target: string
    @Input() targetSuffix: string
    @Input() id: number
    @Input() manifest: boolean
    @Input() decouple: boolean
    @Input() direct: boolean
    @Input() api: object
    @Input() urlRoot: string

    // Component Attributes
    @Input() property: string

    // Dependencies
    _ = _
    has = has
    log = console.log

    // Stratus Data Connectivity
    registry = new Registry()
    fetched: Promise<boolean|Collection|Model>
    data: any
    collection?: EventBase
    // @Output() model: any;
    model?: Model

    // Observable Connection
    dataSub: Observable<[]>
    onChange = new Subject()
    subscriber: Subscriber<any>
    // Note: It may be better to LifeCycle::tick(), but this works for now

    // Icon Localization
    svgIcons: {
        [key: string]: string
    } = {}

    // UI Flags
    initialized = false
    styled = false
    blurred = false
    focused = false
    codeViewIsOpen: boolean

    // Forms
    form: FormGroup = this.fb.group({
        dataString: new FormControl(),
    })
    dataChangeLog: string[] = []

    // Child Components
    // quill: Quill
    editorConfig: AngularEditorConfig = {
        editable: true,
        spellcheck: true,
        height: 'auto',
        minHeight: '0',
        maxHeight: 'auto',
        width: 'auto',
        minWidth: '0',
        translate: 'yes',
        enableToolbar: true,
        showToolbar: true,
        placeholder: 'Enter text here...',
        defaultParagraphSeparator: '',
        defaultFontName: '',
        defaultFontSize: '',
        fonts: [
            {class: 'arial', name: 'Arial'},
            {class: 'times-new-roman', name: 'Times New Roman'},
            {class: 'calibri', name: 'Calibri'},
            {class: 'comic-sans-ms', name: 'Comic Sans MS'}
        ],
        customClasses: [
            {
                name: 'Button',
                class: 'btn',
                tag: 'span',
            },
            {
                name: 'Header',
                class: 'header',
                tag: 'span',
            },
            {
                name: 'Title',
                class: 'title',
                tag: 'span',
            },
            {
                name: 'Alt Title (over)',
                class: 'alt-title',
                tag: 'span',
            },
            {
                name: 'Subtitle',
                class: 'subtitle',
                tag: 'span',
            },
            {
                name: 'Pullout Quote',
                class: 'pullout',
                tag: 'span',
            },
        ],
        uploadUrl: `https://app.sitetheory.io:3000/?session=${cookie('SITETHEORY')}`,
        uploadWithCredentials: false,
        sanitize: false,
        toolbarPosition: 'top',
        toolbarHiddenButtons: [
            [
                // 'bold',
                // 'italic',
                // 'underline',
                // 'strikeThrough',
                // 'superscript',
                // 'subscript'
            ], [
                // 'heading',
                'fontName',
                'fontSize',
                'textColor',
                'backgroundColor'
            ], [
                // 'justifyLeft',
                // 'justifyCenter',
                // 'justifyRight',
                // 'justifyFull',
                // 'indent',
                // 'outdent'
            ], [
                // 'cut',
                // 'copy',
                // 'delete',
                // 'removeFormat',
                'undo',
                'redo'
            ], [
                // 'paragraph',
                // 'blockquote',
                // 'removeBlockquote',
                'insertHorizontalRule',
                // 'insertUnorderedList',
                // 'insertOrderedList',
                // 'customClasses'
            ], [
                // 'link',
                // 'unlink',
                'insertImage',
                'insertVideo'
                // 'toggleEditorMode'
            ]
        ],
    }

    // Froala 2 Buttons (For Reference)
    // 'insertOrderedList', 'insertUnorderedList', 'createLink', 'table'
    froalaButtons: string[] = [
        'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'formatBlock',
        'blockStyle', 'inlineStyle', 'paragraphStyle', 'paragraphFormat', 'align', 'formatOL',
        'formatUL', 'outdent', 'indent', '|', 'insertLink', 'insertImage', 'insertVideo', 'insertFile',
        'insertTable', '|', 'undo', 'redo', 'removeFormat', 'wordPaste', 'help', 'html', 'fullscreen'
    ]

    // Froala Configuration
    froalaConfig: LooseObject = {
        // key: 'LGnD1KNZf1CPBYCAZB-8F3UDSLLSG1VFf1A3C2==',
        codeBeautifierOptions: {
            end_with_newline: true,
            indent_inner_html: true,
            extra_liners: '["p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "ul", "ol", "table", "dl"]',
            brace_style: 'expand',
            // indent_char: '\t',
            indent_char: ' ',
            // indent_size: 1,
            indent_size: 4,
            wrap_line_length: 0
        },
        // FIXME: The CodeView Plugin gives the following error when initializing CodeMirror.
        // FIXME: TypeError: c.opts.codeMirror.fromTextArea is not a function
        codeMirror: false,
        codeMirrorOptions: {
            indentWithTabs: false,
            lineNumbers: true,
            lineWrapping: true,
            mode: 'text/html',
            tabMode: 'space',
            tabSize: 4
        },
        fileUploadURL: 'https://app.sitetheory.io/?session=' + cookie('SITETHEORY'),
        htmlAllowedAttrs: [
            'accept', 'accept-charset', 'accesskey', 'action', 'align', 'allowfullscreen',
            'allowtransparency', 'alt', 'aria-.*', 'async', 'autocomplete', 'autofocus',
            'autoplay', 'autosave',
            'background', 'bgcolor', 'border',
            'charset', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'color',
            'cols', 'colspan', 'content', 'contenteditable', 'contextmenu', 'controls',
            'coords',
            'data', 'data-.*', 'datetime', 'default', 'defer', 'dir', 'dirname',
            'disabled', 'download', 'draggable', 'dropzone',
            'enctype',
            'for', 'form', 'formaction', 'frameborder',
            'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'http-equiv',
            'icon', 'id', 'ismap', 'itemprop',
            'keytype', 'kind',
            'label', 'lang', 'language', 'list', 'loop', 'low',
            'max', 'maxlength', 'media', 'method', 'min', 'mozallowfullscreen', 'multiple',
            'muted',
            'name', 'novalidate',
            'open', 'optimum',
            'pattern', 'ping', 'placeholder', 'playsinline', 'poster', 'preload', 'pubdate',
            'radiogroup', 'readonly', 'rel', 'required', 'reversed', 'rows', 'rowspan',
            'sandbox', 'scope', 'scoped', 'scrolling', 'seamless', 'selected', 'shape',
            'size', 'sizes', 'span', 'src', 'srcdoc', 'srclang', 'srcset', 'start', 'step',
            'summary', 'spellcheck', 'style',
            'tabindex', 'target', 'title', 'type', 'translate',
            'usemap',
            'value', 'valign',
            'webkitallowfullscreen', 'width', 'wrap'
        ],
        htmlAllowedEmptyTags: [
            'textarea', 'a', 'iframe', 'object', 'video', 'style', 'script',
            '.fa', '.fr-emoticon', '.fr-inner', 'path', 'line', 'hr', 'div'
        ],
        htmlAllowedStyleProps: [
            // 'font-family', 'font-size', 'background', 'color', 'width',
            // 'text-align', 'vertical-align', 'background-color'
        ],
        htmlAllowedTags: [
            'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio',
            'b', 'base', 'bdi', 'bdo', 'blockquote', 'br', 'button',
            'canvas', 'caption', 'cite', 'code', 'col', 'colgroup',
            'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt',
            'em', 'embed',
            'fieldset', 'figcaption', 'figure', 'footer', 'form',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr',
            'i', 'iframe', 'img', 'input', 'ins',
            'kbd', 'keygen',
            'label', 'legend', 'li', 'link',
            'main', 'map', 'mark', 'menu', 'menuitem', 'meter',
            'nav', 'noscript',
            'object', 'ol', 'optgroup', 'option', 'output',
            'p', 'param', 'pre', 'progress',
            'queue',
            'rp', 'rt', 'ruby',
            's', 'samp', 'script', 'style', 'section', 'select', 'small',
            'source', 'span', 'strike', 'strong', 'sub', 'summary', 'sup',
            'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track',
            'u', 'ul',
            'var', 'video',
            'wbr'
        ],
        htmlRemoveTags: [
            // 'script', 'style', 'base'
        ],
        htmlSimpleAmpersand: false,
        htmlUntouched: true,
        imageInsertButtons: [
            'imageBack',
            '|',
            // 'imageUpload',
            'imageByURL',
            // 'imageManager'
            'mediaManager'
        ],
        imageManagerPageSize: 20,
        imageManagerScrollOffset: 10,
        imageManagerLoadMethod: 'GET',
        // imageManagerLoadParams: {},
        imageManagerLoadURL: '/Api/Media?payload-only=true',
        // imageManagerDeleteMethod: 'DELETE',
        // imageManagerDeleteParams: {},
        // Note: The request will contain the image source as src parameter.
        // imageManagerDeleteURL: '/Api/MediaSrc',
        // imageManagerPreloader: '/images/loader.gif',
        multiLine: true,
        pasteDeniedAttrs: [
            // 'class', 'id', 'style'
        ],
        pasteDeniedTags: [],
        pastePlain: true,
        pluginsEnabled: [
            'align',
            'charCounter',
            'codeBeautifier',
            'codeView',
            'colors',
            'draggable',
            'embedly',
            'emoticons',
            'entities',
            'file',
            // 'fontAwesome',
            'fontFamily',
            'fontSize',
            // 'fullscreen',
            'image',
            // 'imageTUI',
            // 'imageManager',
            // 'imageManagerCustom',
            'inlineStyle',
            'inlineClass',
            'lineBreaker',
            'lineHeight',
            'link',
            'lists',
            'mediaManager',
            'paragraphFormat',
            'paragraphStyle',
            'quickInsert',
            'quote',
            'save',
            'table',
            'url',
            'video',
            'wordPaste',
        ],
        quickInsertButtons: [
            // 'image',
            'media',
            'video',
            'embedly',
            'table',
            'ul',
            'ol',
            'hr'
        ],
        scrollableContainer: Stratus.Environment.get('viewPort') || 'body',
        spellcheck: true,
        toolbarSticky: true,
        toolbarButtons: {
            moreText: {
                buttons: [
                    'bold',
                    'italic',
                    'underline',
                    'strikeThrough',
                    'subscript',
                    'superscript',
                    'fontFamily',
                    'fontSize',
                    'textColor',
                    'backgroundColor',
                    'inlineClass',
                    'inlineStyle',
                    'clearFormatting'
                ]
            },
            moreParagraph: {
                buttons: [
                    'alignLeft',
                    'alignCenter',
                    'formatOLSimple',
                    'alignRight',
                    'alignJustify',
                    'formatOL',
                    'formatUL',
                    'paragraphFormat',
                    'paragraphStyle',
                    'lineHeight',
                    'outdent',
                    'indent',
                    'quote'
                ]
            },
            moreRich: {
                buttons: [
                    'insertLink',
                    'mediaManager',
                    'insertImage',
                    'insertVideo',
                    'insertTable',
                    'emoticons',
                    // 'fontAwesome',
                    'specialCharacters',
                    'embedly',
                    'insertFile',
                    'insertHR'
                ]
            },
            moreMisc: {
                buttons: [
                    'undo',
                    'redo',
                    // 'fullscreen',
                    'print',
                    // 'getPDF',
                    'spellChecker',
                    // 'selectAll',
                    'html',
                    'help'
                ],
                align: 'right',
                buttonsVisible: 2
            }
        },
        // A MD sized screen will show the default toolbarButtons
        // toolbarButtonsMD: null,
        toolbarButtonsSM: {
            moreText: {
                buttons: [
                    'bold',
                    'italic',
                    'underline',
                    'strikeThrough',
                    'subscript',
                    'superscript',
                    'fontFamily',
                    'fontSize',
                    'textColor',
                    'backgroundColor',
                    'inlineClass',
                    'inlineStyle',
                    'clearFormatting'
                ],
                buttonsVisible: 2
            },
            moreParagraph: {
                buttons: [
                    'alignLeft',
                    'alignCenter',
                    'formatOLSimple',
                    'alignRight',
                    'alignJustify',
                    'formatOL',
                    'formatUL',
                    'paragraphFormat',
                    'paragraphStyle',
                    'lineHeight',
                    'outdent',
                    'indent',
                    'quote'
                ],
                buttonsVisible: 2
            },
            moreRich: {
                buttons: [
                    'insertLink',
                    'mediaManager',
                    'insertImage',
                    'insertVideo',
                    'insertTable',
                    'emoticons',
                    // 'fontAwesome',
                    'specialCharacters',
                    'embedly',
                    'insertFile',
                    'insertHR'
                ],
                buttonsVisible: 2
            },
            moreMisc: {
                buttons: [
                    'undo',
                    'redo',
                    // 'fullscreen',
                    'print',
                    // 'getPDF',
                    'spellChecker',
                    // 'selectAll',
                    'html',
                    'help'
                ],
                align: 'right',
                buttonsVisible: 2
            }
        },
        toolbarButtonsXS: {
            moreText: {
                buttons: [
                    'bold',
                    'italic',
                    'underline',
                    'strikeThrough',
                    'subscript',
                    'superscript',
                    'fontFamily',
                    'fontSize',
                    'textColor',
                    'backgroundColor',
                    'inlineClass',
                    'inlineStyle',
                    'clearFormatting'
                ],
                buttonsVisible: 0
            },
            moreParagraph: {
                buttons: [
                    'alignLeft',
                    'alignCenter',
                    'formatOLSimple',
                    'alignRight',
                    'alignJustify',
                    'formatOL',
                    'formatUL',
                    'paragraphFormat',
                    'paragraphStyle',
                    'lineHeight',
                    'outdent',
                    'indent',
                    'quote'
                ],
                buttonsVisible: 0
            },
            moreRich: {
                buttons: [
                    'insertLink',
                    'mediaManager',
                    'insertImage',
                    'insertVideo',
                    'insertTable',
                    'emoticons',
                    // 'fontAwesome',
                    'specialCharacters',
                    'embedly',
                    'insertFile',
                    'insertHR'
                ],
                buttonsVisible: 0
            },
            moreMisc: {
                buttons: [
                    'undo',
                    'redo',
                    // 'fullscreen',
                    'print',
                    // 'getPDF',
                    'spellChecker',
                    // 'selectAll',
                    'html',
                    'help'
                ],
                align: 'right',
                buttonsVisible: 2
            }
        },
        videoInsertButtons: [
            'videoBack',
            '|',
            'videoByURL',
            'videoEmbed',
            // 'videoUpload',
        ]
    }

    constructor(
        // private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        private ref: ChangeDetectorRef,
        private elementRef: ElementRef,
        private fb: FormBuilder,
        public dialog: MatDialog,
    ) {
        // Chain constructor
        super()

        // Initialization
        this.uid = _.uniqueId(`sa_${moduleName}_component_`)
        Stratus.Instances[this.uid] = this

        // SVG Icons
        // iconRegistry.addSvgIcon(
        //     'selector:delete',
        //     sanitizer.bypassSecurityTrustResourceUrl('/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/delete.svg')
        // )

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.LoadCss([
            `${localDir}${moduleName}/${moduleName}.component${!this.dev ? '.min' : ''}.css`,
            `${codeMirrorDir}lib/codemirror.css`,
            `${froalaDir}css/froala_editor.pkgd${!this.dev ? '.min' : ''}.css`,
            `${froalaDir}css/froala_style${!this.dev ? '.min' : ''}.css`,
            `${froalaDir}css/third_party/embedly${!this.dev ? '.min' : ''}.css`,
            `${froalaDir}css/third_party/font_awesome${!this.dev ? '.min' : ''}.css`,
            `${froalaDir}css/third_party/image_tui${!this.dev ? '.min' : ''}.css`,
            `${froalaDir}css/third_party/spell_checker${!this.dev ? '.min' : ''}.css`
        ]).then(() => {
            this.styled = true
            this.refresh()
        }).catch((e: Error) => {
            console.error(e)
            console.warn('CSS Failed to load for Component:', this.uid)
            this.styled = true
            this.refresh()
        })

        // _.forEach(cssFiles, (file: string) => Stratus.Internals.CssLoader(file).catch((e) => console.error(e)))

        // TODO: Allow more CSS files to get pulled and mark this.styled appropriately
        /* *
        if (_.has(boot.configuration.paths, 'quill')) {
            const quillDir = `/assets/1/0/bundles/${boot.configuration.paths.quill.replace(/[^/]*$/, '')}`
            Stratus.Internals.CssLoader(`${quillDir}quill.core.css`)
            // Stratus.Internals.CssLoader(`${quillDir}quill.bubble.css`)
            Stratus.Internals.CssLoader(`${quillDir}quill.snow.css`)
        }
        /* */

        // Hydrate Root App Inputs
        this.hydrate(elementRef, sanitizer, keys<EditorComponent>())

        // Data Connections
        this.fetchData()
            .then(data => {
                if (!data || !(data instanceof EventManager)) {
                    console.warn('Unable to bind data from Registry!')
                    return
                }
                // Manually render upon model change
                // this.ref.detach();
                const onDataChange = () => {
                    if (!data.completed) {
                        return
                    }
                    // this.onDataChange();
                    this.dataDefer(this.subscriber)
                    // Halt UI Logic when Code View is Open
                    if (this.codeViewIsOpen) {
                        return
                    }
                    // Refresh Quill
                    // if (this.quill) {
                    //     this.quill.update('user')
                    // }
                    // TODO: Add a debounce so we don't attempt to update multiple times while the model is changing.
                    // this.refresh()
                    // FIXME: Somehow this doesn't completely work...  It gets data from the model
                    // when it is changed, but won't propagate it when the form event changes the data.
                }
                data.on('change', onDataChange)
                onDataChange()
            })

        // Declare Observable with Subscriber (Only Happens Once)
        this.dataSub = new Observable(subscriber => this.dataDefer(subscriber))
        this.dataSub.pipe(
            debounce(() => timer(500)),
            catchError(this.handleError)
        ).subscribe(evt => {
            // While the editor is focused, we skip the debounce updates to avoid cursor glitches
            if (this.focused) {
                return
            }
            // TODO: This may need to only work on blur and not focus, unless it is the initialization value
            const dataControl = this.form.get('dataString')
            if (dataControl.value === evt) {
                // In the case of data being edited by the code view or something else,
                // we need to refresh the UI, as long as it has been initialized.
                // FIXME: This doesn't work
                // if (this.initialized) {
                //     this.refresh()
                // }
                return
            }
            dataControl.patchValue(evt)
            // Note: A refresh may be necessary if things become less responsive
            // this.refresh()
        })

        // console.info('constructor!');
    }

    ngOnInit() {
        this.initialized = true
        // console.info(`${moduleName}.ngOnInit`)
        const dataControl = this.form.get('dataString')
        // This valueChanges field is an Event Emitter
        dataControl.valueChanges.forEach(
            (value: string) => {
                // Avoid saving until the Model is truly available
                if (!this.model.completed) {
                    return
                }

                // This avoids saving if it's the same
                // if (value === this.model.get(this.property)) {
                //     return
                // }

                // This keeps a change log of what's been typed.  I used this for testing purposes,
                // but something this simple could be used for simple UX purposes down the road.
                // this.dataChangeLog.push(value)

                // Save the qualified change!
                this.model.set(
                    this.property,
                    this.normalizeOut(value)
                )
            }
        )
    }

    normalizeIn(data?: string): string {
        // Normalize non-string values to strings.
        if (!data || !_.isString(data)) {
            return ''
        }
        return this.changeImgSize(data, 'hq')
    }
    normalizeOut(data?: string): string {
        // Normalize null values to empty strings to maintain consistent typing.
        if (data === null) {
            return ''
        }
        if (!_.isString(data)) {
            return data
        }
        return this.changeImgSize(data, 'xs')
    }
    changeImgSize(data?: string, size?: string): string {
        if (!data || !_.isString(data)) {
            return data
        }
        if (!size || !_.isString(size)) {
            return data
        }
        const imgRegex: RegExp = /<img([\w\W]+?)>/gi
        let imgMatch: RegExpExecArray
        // tslint:disable-next-line:no-conditional-assignment
        while (imgMatch = imgRegex.exec(data)) {
            const src: string = imgMatch[0]
            // This skips image sizing for elements without lazy loading
            // TODO: Enable this after things are normalized
            // if (!src.includes('stratus-src')) {
            //     return
            // }
            const srcRegex: RegExp = /^(.+?)(-[A-Z]{2})?\.(?=[^.]*$)(.+)/gi
            const srcMatch: RegExpExecArray = srcRegex.exec(src)
            if (srcMatch === null) {
                console.error('Unable to find file name for image src:', src)
                return
            }
            // This removes image sizing from elements without lazy loading
            // TODO: Disable this after things are normalized
            if (!src.includes('stratus-src')) {
                data = data.replace(src, `${srcMatch[1]}.${srcMatch[3]}`)
                return
            }
            data = data.replace(src, `${srcMatch[1]}-${size}.${srcMatch[3]}`)
        }
        return data
    }

    // ngOnChanges() {
    //     // Display Inputs
    //     if (!cookie('env')) {
    //         return
    //     }
    //     console.log('inputs:', {
    //         target: this.target,
    //         targetSuffix: this.targetSuffix,
    //         id: this.id,
    //         manifest: this.manifest,
    //         decouple: this.decouple,
    //         direct: this.direct,
    //         api: this.api,
    //         urlRoot: this.urlRoot,
    //     })
    // }

    // ngDoCheck(): void {
    //     console.info('ngDoCheck:', this.dataSub);
    // }

    public refresh() {
        if (!this.ref) {
            console.error('ref not available:', this)
            return
        }
        this.ref.detach()
        this.ref.detectChanges()
        this.ref.reattach()
    }

    handleError(err: ObservableInput<any>): ObservableInput<any> {
        console.error(err)
        return err
    }

    // Data Connections
    fetchData() {
        if (this.fetched) {
            return this.fetched
        }
        return this.fetched = this.registry.fetch(
            Stratus.Select(this.elementRef.nativeElement),
            this
        )
        // return this.fetched = this.registry.fetch({
        //     target: this.target,
        //     targetSuffix: this.targetSuffix,
        //     id: this.id,
        //     manifest: this.manifest,
        //     decouple: this.decouple,
        //     direct: this.direct,
        //     api: this.api,
        //     urlRoot: this.urlRoot,
        // }, this)
    }

    // Ensures Data is populated before hitting the Subscriber
    dataDefer(subscriber: Subscriber<any>) {
        this.subscriber = this.subscriber || subscriber
        if (!this.subscriber) {
            return
        }
        const dataString = this.dataRef()
        if (!dataString) {
            setTimeout(() => {
                this.dataDefer(subscriber)
            }, 500)
            return
        }
        // console.log('pushed value to subscriber.')
        this.subscriber.next(dataString)
        // TODO: Add a returned Promise to ensure async/await can use this defer directly.
    }

    dataRef(): string {
        if (!this.model) {
            return ''
        }
        return this.normalizeIn(
            this.model.get(this.property)
        )
    }

    // selectedModel (observer: any) : any {
    //     if (!this.data) {
    //         this.fetchData().then(function (data: any) {
    //             observer.next(data)
    //         });
    //     }
    //     // data.on('change', () => observer.next(that.dataRef()));
    //     observer.next()
    // }

    onDataChange() {
        // FIXME: This is not in use due to contextual issues.
        this.dataDefer(this.subscriber)
        this.refresh()
    }

    // created(quill: Quill) {
    created() {
        // this.quill = quill
        /* *
        quill.on('text-change', (delta, oldDelta, source) => {
            if (source === 'api') {
                console.log('An API call triggered this change.')
            } else if (source === 'user') {
                console.log('A user action triggered this change.')
            }
        })
        /* */
    }

    // changedEditor(event: EditorChangeContent | EditorChangeSelection) {
    changedEditor(event: any) {
        console.log('editor-change:', event)
    }

    onChangeEvent($event: any) {
        console.log('change:', $event)
    }

    onFocus($event: any) {
        // console.log('focus:', $event)
        this.focused = true
        this.blurred = false
    }

    onBlur($event: any) {
        // console.log('blur:', $event)
        this.focused = false
        this.blurred = true
    }

    bypassHTML(html: string) {
        return this.sanitizer.bypassSecurityTrustHtml(html)
    }

    trigger(name: string, data: any, callee: TriggerInterface) {
        console.log('editor.trigger:', name, callee)
        if (name === 'media-library') {
            this.openMediaDialog(callee)
        } else if (name === 'code-view') {
            this.openCodeViewDialog()
        }
        // callee.trigger('editor', null, this)
    }

    public openMediaDialog(callee: TriggerInterface): void {
        const dialogRef = this.dialog.open(MediaDialogComponent, {
            width: '1000px',
            data: {
                editor: this,
                eventManager: callee,
                // eventInsert: false,
                form: this.form,
                model: this.model,
                property: this.property
            }
        })
        this.refresh()

        const that = this
        dialogRef.afterClosed().subscribe((result: MediaDialogData) => {
            if (!result || _.isEmpty(result)) {
                return
            }
            // Refresh Component
            that.refresh()
            // Display output if one exists
            if (cookie('env') && result) {
                console.log('media dialog result:', result)
            }
        })
    }

    public openCodeViewDialog(): void {
        this.codeViewIsOpen = true
        const dialogRef = this.dialog.open(CodeViewDialogComponent, {
            width: '1000px',
            data: {
                form: this.form,
                model: this.model,
                property: this.property
            }
        })
        this.refresh()

        dialogRef.afterClosed().subscribe((result: CodeViewDialogData) => {
            this.codeViewIsOpen = false
            // If result is present, handle it appropriately
            if (!result || _.isEmpty(result)) {
                return
            }
            // FIXME: Even with these triggers and updates, Quill still desyncs from the Code Editor
            // this.model.trigger('change')
            // if (this.quill) {
            //     this.quill.update('user')
            // }
            this.refresh()
            // Display output if one exists
            if (cookie('env') && result) {
                console.log('code view dialog result:', result)
            }
        })
    }
}
