// Angular Core
import {
    // ChangeDetectionStrategy,
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
/* *
import {
    AngularEditorConfig
} from '@kolkov/angular-editor'
/* */

// Quill Dependencies
// import Quill from 'quill'
// import {
//     EditorChangeContent,
//     EditorChangeSelection
// } from 'ngx-quill'

// Components
import {
    RootComponent
} from '../core/root.component'
import {
    CitationDialogComponent,
    CitationDialogData
} from './citation-dialog.component'
import {
    LinkDialogComponent,
    LinkDialogData
} from './link-dialog.component'
import {
    MediaDialogComponent,
    MediaDialogData
} from './media-dialog.component'
import {
    CodeViewDialogComponent,
    CodeViewDialogData
} from './code-view-dialog.component'

// Bridges
import {
    CodeMirrorBridge
} from './code-mirror-bridge'

// Services
import {Registry} from '@stratusjs/angularjs/services/registry'

// Core Classes
import {
    cookie
} from '@stratusjs/core/environment'
import {
    EventManager
} from '@stratusjs/core/events/eventManager'
import {
    EventBase
} from '@stratusjs/core/events/eventBase'
import {
    LooseObject
} from '@stratusjs/core/misc'

// Core Interfaces
import {
    TriggerInterface
} from '../core/trigger.interface'

// AngularJS Classes
import {
    Model
} from '@stratusjs/angularjs/services/model'
import {
    Collection
} from '@stratusjs/angularjs/services/collection'

// Transformers
import {
    keys
} from 'ts-transformer-keys'

// Froala External Requirements (Before Plugins are Loaded)
import 'html2pdf'
import 'font-awesome'

// Froala Plugins
import 'froala-plugins'
import 'froala-embedly'
import 'froala-font-awesome'
import 'froala-image-tui'
// import 'froala-spell-checker'

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
import '../froala/plugins/citationManager'
import '../froala/plugins/linkManager'
import '../froala/plugins/mediaManager'
// import '../froala/plugins/menuButton'

// Froala Directive
import {FroalaEditorDirective} from 'angular-froala-wysiwyg'

// CodeMirror Requirements
import {
    basicSetup,
    EditorView
} from 'codemirror'
import {Extension} from '@codemirror/state'
import {html} from '@codemirror/lang-html'
import {oneDarkTheme} from '@codemirror/theme-one-dark'

// Local Setup
const systemPackage = '@stratusjs/angular'
const froalaPackage = 'froala-editor'
// const codeMirrorPackage = 'codemirror'
const moduleName = 'editor'

// Directory Template
const min = !cookie('env') ? '.min' : ''
const localDir = `${Stratus.BaseUrl}${boot.configuration.paths[`${systemPackage}/*`].replace(/[^\/]*$/, '').replace(/\/dist\/$/, '/src/')}`
// const codeMirrorDir = `${Stratus.BaseUrl}${boot.configuration.paths[`${codeMirrorPackage}/*`].replace(/[^\/]*$/, '')}`
const froalaDir = `${Stratus.BaseUrl}${boot.configuration.paths[froalaPackage].replace(/js\/[^\/]*$/, '')}`

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
    templateUrl: `${localDir}/${moduleName}/${moduleName}.component${min}.html`,
    // FIXME: This doesn't work, as it seems Angular attempts to use a System.js import instead of their own, so it will
    // require the steal-css module
    // styleUrls: [
    //     `${localDir}/${moduleName}/${moduleName}.component${min}.css`
    // ],
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class EditorComponent extends RootComponent implements OnInit, TriggerInterface { // implements OnInit, OnChanges

    // Basic Component Settings
    title = `${moduleName}_component`
    uid: string
    dev = !!cookie('env')
    debug = !!cookie(`debug_${moduleName}`)
    editor: 'froala'|'angular-editor'|'quill' = 'froala'

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
    Stratus = Stratus

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
    // disableRefresh = true

    // Forms
    form: FormGroup = this.fb.group({
        dataString: new FormControl(),
    })
    dataChangeLog: string[] = []
    incomingData = ''
    outgoingData = ''

    // Debounce Saving Controls
    debounceSave = true
    debounceTime = 5000

    // Model Saving Controls
    forceSave = false

    // Child Components
    froalaEditorDirective: FroalaEditorDirective
    // quill: Quill

    // Angular Editor Config
    /* *
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
    /* */

    froalaStandardButtons = {
        moreText: [
            'bold',
            'italic',
            'underline',
            'strikeThrough',
            'subscript',
            'superscript',
            // FIXME: The vertical lines don't work
            // '|',
            'fontFamily',
            'fontSize',
            'textColor',
            'backgroundColor',
            // FIXME: The vertical lines don't work
            // '|',
            'inlineClass',
            'inlineStyle',
            // FIXME: The vertical lines don't work
            // '|',
            'clearFormatting'
        ],
        moreParagraph: [
            'linkManager',
            // 'formatOLSimple',
            'formatOL',
            'formatUL',
            'indent',
            'outdent',
            'quote',
            'paragraphFormat',
            'paragraphStyle',
            // 'lineHeight'
            'alignLeft',
            'alignCenter',
            'alignRight',
            'alignJustify',
        ],
        moreRich: [
            'mediaManager',
            'insertTable',
            'insertImage',
            'insertVideo',
            'insertFile',
            'citationInsert',
            'insertHR',
            'specialCharacters',
            // 'insertLink',
            // FIXME: The free version is lacking and will require custom `fontAwesomeSets` to remove PRO icons
            // 'fontAwesome',
            // 'emoticons',
            // 'embedly'
        ],
        moreMisc: [
            // 'menuButton',
            'html',
            'undo',
            'redo',
            'fullscreen',
            'print',
            // FIXME: This plugin doesn't detect the window.html2pdf, likely due to timing issues
            // 'getPDF',
            // FIXME: This icon never appears
            // 'spellChecker',
            'selectAll',
            'help'
        ],
    }

    // Froala Configuration
    froalaConfig = {
        attribution: false,
        key: Stratus.Environment.get('froalaKey'),
        zIndex: 9999,
        events: {
            initialized: (froalaEditorDirective: FroalaEditorDirective) => {
                // console.log('initialized:', editor.html.get(), editor, froalaEditorDirective)
                this.froalaEditorDirective = froalaEditorDirective
            },
            // blur: this.onBlur,
            blur: (event: FocusEvent) => this.onBlur(event),
            // FIXME: Froala doesn't support focus events, so this never fires...
            focus: (event: FocusEvent) => this.onFocus(event),
            // bound to Froala Editor
            // contentChanged () {
            //     const editor = this
            //     console.log('contentChanged:', editor.html.get())
            // },
            // bound to EditorComponent
            // contentChanged: (...args: Array<any>) => {
            //     console.log('contentChanged:', this, args)
            // },
            // 'paste.afterCleanup' (clipboardHTML: any) {
            //     console.log('paste.afterCleanup:', this, clipboardHTML)
            // }
        },
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
        // fromTextArea
        codeMirror: {
            fromTextArea: (el: HTMLTextAreaElement, opts: LooseObject) => {
                const extensions: Array<Extension> = [
                    basicSetup,
                    EditorView.lineWrapping,
                    html({
                        // extraTags: [
                        //     'sa-editor'
                        // ],
                        // extraGlobalAttributes: [
                        //     'stratus-src'
                        // ],
                    }),
                ]
                if (cookie('dark')) {
                    extensions.push(oneDarkTheme)
                }
                // Note: We're instantiating a Bridge Class to act as an intermediate for Froala's legacy implementation.
                return new CodeMirrorBridge({extensions}).fromTextArea(el, opts)
            }
        },
        codeMirrorOptions: {
            indentWithTabs: false,
            lineNumbers: true,
            lineWrapping: true,
            mode: 'text/html',
            tabMode: 'space',
            tabSize: 4
        },
        fileInsertButtons: [
            'fileBack',
            // '|',
            // 'mediaManager'
        ],
        fileUploadURL: 'https://app.sitetheory.io/?session=' + cookie('SITETHEORY'),
        fontFamily: {
            'Arial,Helvetica,sans-serif': 'Arial',
            'Georgia,serif': 'Georgia',
            'Impact,Charcoal,sans-serif': 'Impact',
            'Tahoma,Geneva,sans-serif': 'Tahoma',
            '"Times New Roman",Times,serif': 'Times New Roman',
            'Verdana,Geneva,sans-serif': 'Verdana'
        },
        heightMax: window.innerHeight || document.documentElement.clientHeight || 500,
        htmlAllowedAttrs: [
            // Note: We can't use a blanket regex for attributes, since the `htmlAllowedAttrs`
            // get spliced into the `pasteDeniedAttrs`, so the whitelist can overwrite the
            // blacklist.
            // '.*'
            // Regex Options
            'aria-.+',
            'data-.+',
            'ng-.+',
            'stratus-.+',
            'sa-.+',
            // Common Attributes
            'accept', 'accept-charset', 'accesskey', 'action', 'align', 'allow', 'allowfullscreen',
            'allowtransparency', 'alt', 'async', 'autocomplete', 'autofocus',
            'autoplay', 'autosave',
            'background', 'bgcolor', 'border',
            'charset', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'color',
            'cols', 'colspan', 'content', 'contenteditable', 'contextmenu', 'controls',
            'coords',
            'data', 'datetime', 'default', 'defer', 'dir', 'dirname',
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
            'webkitallowfullscreen', 'width', 'wrap',
            // XML Attributes (Required for outer SVG Tag)
            'xmlns',
            'xmlns:xlink',
            // SVG Attributes - pulled from: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute
            'accent-height', 'accumulate', 'additive', 'alignment-baseline', 'alphabetic', 'amplitude', 'arabic-form', 'ascent',
            'attributeName', 'attributeType', 'azimuth',
            'baseFrequency', 'baseline-shift', 'baseProfile', 'bbox', 'begin', 'bias', 'by',
            'calcMode', 'cap-height', 'clip', 'clipPathUnits', 'clip-path', 'clip-rule', 'color-interpolation',
            'color-interpolation-filters', 'color-profile', 'color-rendering', 'contentScriptType', 'contentStyleType', 'crossorigin',
            'cursor', 'cx', 'cy',
            'd', 'decelerate', 'descent', 'diffuseConstant', 'direction', 'display', 'divisor', 'dominant-baseline', 'dur', 'dx', 'dy',
            'edgeMode', 'elevation', 'enable-background', 'end', 'exponent', 'externalResourcesRequired',
            'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterRes', 'filterUnits', 'flood-color', 'flood-opacity', 'font-family',
            'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'format', 'from',
            'fr', 'fx', 'fy',
            'g1', 'g2', 'glyph-name', 'glyph-orientation-horizontal', 'glyph-orientation-vertical', 'glyphRef', 'gradientTransform',
            'gradientUnits',
            'hanging', 'horiz-adv-x', 'horiz-origin-x',
            'ideographic', 'image-rendering', 'in', 'in2', 'intercept',
            'k', 'k1', 'k2', 'k3', 'k4', 'kernelMatrix', 'kernelUnitLength', 'kerning', 'keyPoints', 'keySplines', 'keyTimes',
            'lengthAdjust', 'letter-spacing', 'lighting-color', 'limitingConeAngle', 'local',
            'marker-end', 'marker-mid', 'marker-start', 'markerHeight', 'markerUnits', 'markerWidth', 'mask', 'maskContentUnits',
            'maskUnits', 'mathematical', 'mode',
            'numOctaves',
            'offset', 'opacity', 'operator', 'order', 'orient', 'orientation', 'origin', 'overflow', 'overline-position',
            'overline-thickness',
            'panose-1', 'paint-order', 'path', 'pathLength', 'patternContentUnits', 'patternTransform', 'patternUnits', 'pointer-events',
            'points', 'pointsAtX', 'pointsAtY', 'pointsAtZ', 'preserveAlpha', 'preserveAspectRatio', 'primitiveUnits',
            'r', 'radius', 'referrerPolicy', 'refX', 'refY', 'rendering-intent', 'repeatCount', 'repeatDur', 'requiredExtensions',
            'requiredFeatures', 'restart', 'result', 'rotate', 'rx', 'ry',
            'scale', 'seed', 'shape-rendering', 'slope', 'spacing', 'specularConstant', 'specularExponent', 'speed', 'spreadMethod',
            'startOffset', 'stdDeviation', 'stemh', 'stemv', 'stitchTiles', 'stop-color', 'stop-opacity', 'strikethrough-position',
            'strikethrough-thickness', 'string', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin',
            'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'surfaceScale', 'systemLanguage',
            'tableValues', 'targetX', 'targetY', 'text-anchor', 'text-decoration', 'text-rendering', 'textLength', 'to', 'transform',
            'transform-origin',
            'u1', 'u2', 'underline-position', 'underline-thickness', 'unicode', 'unicode-bidi', 'unicode-range', 'units-per-em',
            'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'values', 'vector-effect', 'version', 'vert-adv-y',
            'vert-origin-x', 'vert-origin-y', 'viewBox', 'viewTarget', 'visibility',
            'widths', 'word-spacing', 'writing-mode',
            'x', 'x-height', 'x1', 'x2', 'xChannelSelector',
            'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show',
            'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space',
            'y', 'y1', 'y2', 'yChannelSelector',
            'z', 'zoomAndPan'
        ],
        htmlAllowedEmptyTags: [
            'textarea', 'a', 'iframe', 'object', 'video', 'style', 'script',
            'form',
            // '.fa', '.fr-emoticon', '.fr-inner',
            // 'path', 'line',
            'hr', 'div',
            // SVG Exclusive Tags
            'animate', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'defs', 'desc', 'discard', 'ellipse',
            'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
            'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG',
            'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset',
            'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence',
            'filter', 'foreignObject', 'g', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'mpath',
            'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'set', 'stop', 'svg', 'switch',
            'symbol', 'text', 'textPath', 'tspan', 'unknown', 'use', 'view',
            // AngularJS Tags
            'ng-app', 'ng-bind', 'ng-bind-html', 'ng-bind-template', 'ng-blur', 'ng-change', 'ng-checked', 'ng-class', 'ng-class-even',
            'ng-class-odd', 'ng-click', 'ng-cloak', 'ng-controller', 'ng-copy', 'ng-csp', 'ng-cut', 'ng-dblclick', 'ng-disabled',
            'ng-focus', 'ng-form', 'ng-hide', 'ng-href', 'ng-if', 'ng-include', 'ng-init', 'ng-jq', 'ng-keydown', 'ng-keypress', 'ng-keyup',
            'ng-list', 'ng-maxlength', 'ng-minlength', 'ng-model', 'ng-model-options', 'ng-mousedown', 'ng-mouseenter', 'ng-mouseleave',
            'ng-mousemove', 'ng-mouseover', 'ng-mouseup', 'ng-non-bindable', 'ng-on', 'ng-open', 'ng-options', 'ng-paste', 'ng-pattern',
            'ng-pluralize', 'ng-prop', 'ng-readonly', 'ng-ref', 'ng-repeat', 'ng-required', 'ng-selected', 'ng-show', 'ng-src', 'ng-srcset',
            'ng-style', 'ng-submit', 'ng-switch', 'ng-transclude', 'ng-value', 'ng-animate-children', 'ng-animate-swap', 'ng-outlet',
            'ng-message', 'ng-message-default', 'ng-message-exp', 'ng-messages', 'ng-messages-include', 'ng-view', 'ng-swipe-left',
            'ng-swipe-right',
            // AngularJS Material Tags
            'md-autocomplete', 'md-autofocus', 'md-button', 'md-calendar', 'md-card', 'md-checkbox', 'md-chip', 'md-chip-remove',
            'md-chips', 'md-colors', 'md-contact-chips', 'md-content', 'md-datepicker', 'md-dialog', 'md-divider', 'md-fab-actions',
            'md-fab-speed-dial', 'md-fab-toolbar', 'md-force-height', 'md-grid-list', 'md-grid-tile', 'md-highlight-text', 'md-icon',
            'md-ink-ripple', 'md-input', 'md-input-container', 'md-list', 'md-list-item', 'md-menu', 'md-menu-bar', 'md-nav-bar',
            'md-nav-item', 'md-optgroup', 'md-option', 'md-progress-circular', 'md-progress-linear', 'md-radio-button', 'md-radio-group',
            'md-select', 'md-select-on-focus', 'md-sidenav', 'md-slider', 'md-slider-container', 'md-subheader', 'md-swipe-down',
            'md-swipe-left', 'md-swipe-right', 'md-swipe-up', 'md-switch', 'md-tab', 'md-tabs', 'md-toolbar', 'md-tooltip', 'md-truncate',
            'md-virtual-repeat', 'md-virtual-repeat-container', 'md-whiteframe',
            // AngularJS Material Secondary Tags
            'md-svg-src',
            // Stratus AngularJS Tags
            'stratus-base',
            'stratus-calculator-mortgage',
            'stratus-calendar',
            'stratus-citation',
            'stratus-citation-notitle',
            'stratus-contact-form',
            'stratus-content-selector',
            'stratus-date-time',
            'stratus-delete',
            'stratus-error-message',
            'stratus-facebook',
            'stratus-filter',
            'stratus-help',
            'stratus-idx-disclaimer',
            'stratus-idx-map',
            'stratus-idx-member-details',
            'stratus-idx-member-list',
            'stratus-idx-member-search',
            'stratus-idx-office-list',
            'stratus-idx-office-search',
            'stratus-idx-property-details',
            'stratus-idx-property-details-sub-section',
            'stratus-idx-property-list',
            'stratus-idx-property-search',
            'stratus-image-carousel',
            'stratus-json-editor',
            'stratus-media-details',
            'stratus-media-drag-drop',
            'stratus-media-library',
            'stratus-media-selector',
            'stratus-media-short-details',
            'stratus-media-uploader',
            'stratus-open-houses',
            'stratus-option-value',
            'stratus-pagination',
            'stratus-password-reset',
            'stratus-permissions',
            'stratus-proposal-alert',
            'stratus-publish',
            'stratus-role',
            'stratus-search',
            'stratus-single-sign-on',
            'stratus-social-media',
            'stratus-sort',
            'stratus-swiper-carousel',
            'stratus-tag',
            'stratus-theme-selector',
            'stratus-twitter-feed',
            'stratus-user-authentication',
            'stratus-user-selector',
            'stratus-visual-selector',
            // Stratus Angular+ Tags
            'sa-boot',
            'sa-editor',
            'sa-map',
            'sa-media-selector',
            'sa-selector',
            'sa-stripe-payment-method-list',
            'sa-stripe-payment-method-selector',
            'sa-tree',
        ],
        htmlAllowedStyleProps: [
            '.*'
            // 'align-content', 'align-items', 'align-self', 'animation', 'animation-delay', 'animation-direction', 'animation-duration',
            // 'animation-fill-mode', 'animation-iteration-count', 'animation-name', '@keyframes', 'animation-play-state',
            // 'animation-timing-function',
            // 'backface-visibility', 'background', 'background-attachment', 'background-clip', 'background-color', 'background-image',
            // 'background-origin', 'background-position', 'background-repeat', 'background-size', 'border', 'border-bottom',
            // 'border-bottom-color', 'border-bottom-left-radius', 'border-bottom-right-radius', 'border-bottom-style',
            // 'border-bottom-width', 'border-collapse', 'border-color', 'border-image', 'border-image-outset', 'border-image-repeat',
            // 'border-image-slice', 'border-image-source', 'border-image-width', 'border-left', 'border-left-color', 'border-left-style',
            // 'border-left-width', 'border-radius', 'border-right', 'border-right-color', 'border-right-style', 'border-right-width',
            // 'border-spacing', 'border-style', 'border-top', 'border-top-color', 'border-top-left-radius', 'border-top-right-radius',
            // 'border-top-style', 'border-top-width', 'border-width', 'bottom', 'box-shadow', 'box-sizing',
            // 'caption-side', 'clear', 'clip', 'color','column-count', 'column-fill', 'column-gap', 'column-rule', 'column-rule-color',
            // 'column-rule-style', 'column-rule-width', 'column-span', 'column-width', 'columns', 'column-width', 'column-count',
            // 'content', 'counter-increment', 'counter-reset', 'cursor',
            // 'direction', 'display',
            // 'empty-cells',
            // 'flex', 'flex-basis', 'flex-direction', 'flex-flow', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink',
            // 'flex-wrap', 'float', 'font', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant',
            // 'font-weight',
            // 'height',
            // 'justify', 'justify-content',
            // 'left', 'letter-spacing', 'line-height', 'list-style', 'list-style-image', 'list-style-position', 'list-style-type',
            // 'margin', 'margin-bottom', 'margin-left', 'margin-right', 'margin-top', 'max-height', 'max-width', 'min-height',
            // 'min-width',
            // 'opacity', 'order', 'outline', 'outline-color', 'outline-offset', 'outline-style', 'outline-width', 'overflow',
            // 'overflow-x', 'overflow-y',
            // 'padding', 'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 'page-break-after', 'page-break-before',
            // 'page-break-inside', 'perspective', 'perspective-origin', 'position',
            // 'quotes',
            // 'resize', 'right',
            // 'tab-size', 'table-layout', 'text-align', 'text-align-last', 'text-align', 'text-decoration', 'text-decoration-color',
            // 'text-decoration-line', 'text-decoration-line', 'text-decoration-style', 'text-decoration-line', 'text-indent',
            // 'text-justify', 'text-align', 'text-overflow', 'text-shadow', 'text-transform', 'top', 'transform', 'transform-origin',
            // 'transform-style', 'transition', 'transition-delay', 'transition-duration', 'transition-property',
            // 'transition-timing-function',
            // 'vertical-align', 'visibility',
            // 'white-space', 'width', 'word-break', 'word-spacing', 'word-wrap',
            // 'z-index'
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
            'wbr',
            // SVG Exclusive Tags
            'animate', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'defs', 'desc', 'discard', 'ellipse',
            'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
            'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG',
            'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset',
            'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence',
            'filter', 'foreignObject', 'g', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'mpath',
            'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'set', 'stop', 'svg', 'switch',
            'symbol', 'text', 'textPath', 'tspan', 'unknown', 'use', 'view',
            // AngularJS Tags
            'ng-app', 'ng-bind', 'ng-bind-html', 'ng-bind-template', 'ng-blur', 'ng-change', 'ng-checked', 'ng-class', 'ng-class-even',
            'ng-class-odd', 'ng-click', 'ng-cloak', 'ng-controller', 'ng-copy', 'ng-csp', 'ng-cut', 'ng-dblclick', 'ng-disabled',
            'ng-focus', 'ng-form', 'ng-hide', 'ng-href', 'ng-if', 'ng-include', 'ng-init', 'ng-jq', 'ng-keydown', 'ng-keypress', 'ng-keyup',
            'ng-list', 'ng-maxlength', 'ng-minlength', 'ng-model', 'ng-model-options', 'ng-mousedown', 'ng-mouseenter', 'ng-mouseleave',
            'ng-mousemove', 'ng-mouseover', 'ng-mouseup', 'ng-non-bindable', 'ng-on', 'ng-open', 'ng-options', 'ng-paste', 'ng-pattern',
            'ng-pluralize', 'ng-prop', 'ng-readonly', 'ng-ref', 'ng-repeat', 'ng-required', 'ng-selected', 'ng-show', 'ng-src', 'ng-srcset',
            'ng-style', 'ng-submit', 'ng-switch', 'ng-transclude', 'ng-value', 'ng-animate-children', 'ng-animate-swap', 'ng-outlet',
            'ng-message', 'ng-message-default', 'ng-message-exp', 'ng-messages', 'ng-messages-include', 'ng-view', 'ng-swipe-left',
            'ng-swipe-right',
            // AngularJS Material Tags
            'md-autocomplete', 'md-autofocus', 'md-button', 'md-calendar', 'md-card', 'md-checkbox', 'md-chip', 'md-chip-remove',
            'md-chips', 'md-colors', 'md-contact-chips', 'md-content', 'md-datepicker', 'md-dialog', 'md-divider', 'md-fab-actions',
            'md-fab-speed-dial', 'md-fab-toolbar', 'md-force-height', 'md-grid-list', 'md-grid-tile', 'md-highlight-text', 'md-icon',
            'md-ink-ripple', 'md-input', 'md-input-container', 'md-list', 'md-list-item', 'md-menu', 'md-menu-bar', 'md-nav-bar',
            'md-nav-item', 'md-optgroup', 'md-option', 'md-progress-circular', 'md-progress-linear', 'md-radio-button', 'md-radio-group',
            'md-select', 'md-select-on-focus', 'md-sidenav', 'md-slider', 'md-slider-container', 'md-subheader', 'md-swipe-down',
            'md-swipe-left', 'md-swipe-right', 'md-swipe-up', 'md-switch', 'md-tab', 'md-tabs', 'md-toolbar', 'md-tooltip', 'md-truncate',
            'md-virtual-repeat', 'md-virtual-repeat-container', 'md-whiteframe',
            // AngularJS Material Secondary Tags
            'md-svg-src',
            // Stratus Angular+ Tags
            'sa-boot',
            'sa-editor',
            'sa-map',
            'sa-media-selector',
            'sa-selector',
            'sa-stripe-payment-method-list',
            'sa-stripe-payment-method-selector',
            'sa-tree',
            // StratusJS tags
            'stratus-.+',
        ],
        // @ts-ignore
        htmlRemoveTags: [],
        htmlSimpleAmpersand: false,
        // FIXME: This setting breaks the unordered and ordered list buttons.
        // htmlUntouched: true,
        imageInsertButtons: [
            'imageBack',
            '|',
            // 'mediaManager',
            'imageUpload',
            'imageByURL',
            // 'imageManager'
        ],
        // TODO: These options control the styles for images
        // imageDefaultWidth: 'auto', // Default: 300
        // imageDefaultAlign: false, // Default: 'center'
        // imageDefaultDisplay: false, // Default: 'block'
        imageUpload: true,
        imageUploadRemoteUrls: true,
        imageUploadURL: 'https://app.sitetheory.io/?session=' + cookie('SITETHEORY'),
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
        linkEditButtons: [
            'linkOpen',
            // 'linkStyle',
            // 'linkEdit',
            'linkManagerEdit',
            'linkRemove',
        ],
        linkInsertButtons: [
            'linkBack',
            // '|',
            // 'linkList',
            // 'linkManager',
        ],
        // linkList: [
        //     {
        //         text: 'Meow',
        //         href: 'https://meow.com/',
        //         target: '_blank',
        //         rel: 'nofollow'
        //     }
        // ],
        multiLine: true,
        paragraphStyles: {
            // 'fr-text-gray': 'Gray',
            // 'fr-text-bordered': 'Bordered',
            // 'fr-text-spaced': 'Spaced',
            // 'fr-text-uppercase': 'Uppercase',
            // TODO: Move Button
            btn: 'Button',
            header: 'Header',
            title: 'Title',
            'alt-title': 'Alt Title (over)',
            subtitle: 'Subtitle',
            pullout: 'Pullout Quote',
        },
        pasteDeniedAttrs: [
            'id',
            'class',
            'style',
            'dir',
            'data-.+',
            'aria-.+',
            'ng-.+',
            'stratus-.+',
            'sa-.+'
        ],
        pasteDeniedTags: [
            'form',
            'input',
            'label',
            'style'
        ],
        pastePlain: false,
        pluginsEnabled: [
            'align',
            'charCounter',
            'codeBeautifier',
            'codeView',
            'colors',
            // 'cryptojs',
            'draggable',
            'embedly',
            // 'emoticons',
            'entities',
            'file',
            'fontAwesome',
            'fontFamily',
            'fontSize',
            // 'forms',
            'fullscreen',
            'help',
            'image',
            // TODO: Install & Configure: https://froala.com/wysiwyg-editor/examples/tui-advanced-image-editor/
            'imageTUI',
            // 'imageManager',
            'inlineStyle',
            'inlineClass',
            'lineBreaker',
            // 'lineHeight',
            'link',
            'linkManager',
            'citationManager',
            'lists',
            'mediaManager',
            // 'menuButton',
            'paragraphFormat',
            'paragraphStyle',
            'print',
            'quickInsert',
            'quote',
            'save',
            'specialCharacters',
            // 'spellChecker',
            'table',
            // 'trimVideo',
            'url',
            'video',
            'wordPaste',
        ],
        quickInsertButtons: [
            // 'image',
            'media',
            'link',
            'video',
            'embedly',
            'table',
            'ul',
            'ol',
            'hr'
        ],
        scrollableContainer: Stratus.Environment.get('viewPort') || 'body',
        spellcheck: true,
        theme: cookie('dark') ? 'dark' : null,
        toolbarSticky: true,
        toolbarButtons: {
            moreText: {
                buttons: this.froalaStandardButtons.moreText,
                buttonsVisible: 3
            },
            moreParagraph: {
                buttons: this.froalaStandardButtons.moreParagraph,
                buttonsVisible: 8
            },
            moreRich: {
                buttons: this.froalaStandardButtons.moreRich,
                buttonsVisible: 1
            },
            moreMisc: {
                buttons: this.froalaStandardButtons.moreMisc,
                align: 'right',
                buttonsVisible: 1
            }
        },
        // A MD sized screen will show the default toolbarButtons
        // toolbarButtonsMD: null,
        toolbarButtonsSM: {
            moreText: {
                buttons: this.froalaStandardButtons.moreText,
                buttonsVisible: 3
            },
            moreParagraph: {
                buttons: this.froalaStandardButtons.moreParagraph,
                buttonsVisible: 0
            },
            moreRich: {
                buttons: this.froalaStandardButtons.moreRich,
                buttonsVisible: 3
            },
            moreMisc: {
                buttons: this.froalaStandardButtons.moreMisc,
                align: 'right',
                buttonsVisible: 0
            }
        },
        toolbarButtonsXS: {
            moreText: {
                buttons: this.froalaStandardButtons.moreText,
                buttonsVisible: 0
            },
            moreParagraph: {
                buttons: this.froalaStandardButtons.moreParagraph,
                buttonsVisible: 0
            },
            moreRich: {
                buttons: this.froalaStandardButtons.moreRich,
                buttonsVisible: 0
            },
            moreMisc: {
                buttons: this.froalaStandardButtons.moreMisc,
                align: 'right',
                buttonsVisible: 0
            }
        },
        // This needs to remain false, or inline styles will be converted to froala classes.
        // FIXME: Allowing this field causes cascading issues in persistence and UI functionality
        useClasses: true,
        videoInsertButtons: [
            'videoBack',
            '|',
            // 'mediaManager',
            'videoByURL',
            'videoEmbed',
            'videoUpload',
        ],
        videoUpload: true,
        videoUploadURL: 'https://app.sitetheory.io/?session=' + cookie('SITETHEORY')
    }

    constructor(
        // private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        protected ref: ChangeDetectorRef,
        private elementRef: ElementRef,
        private fb: FormBuilder,
        public dialog: MatDialog,
    ) {
        // Chain constructor
        super()

        // Initialization
        this.uid = _.uniqueId(`sa_${_.snakeCase(moduleName)}_component_`)
        Stratus.Instances[this.uid] = this

        // FIXME: Event for code view is 'codeView.update'

        // SVG Icons
        // iconRegistry.addSvgIcon(
        //     'selector:delete',
        //     sanitizer.bypassSecurityTrustResourceUrl('/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/delete.svg')
        // )

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.LoadCss([
            `${localDir}${moduleName}/${moduleName}.component${min}.css`,
            // `${codeMirrorDir}lib/codemirror.css`,
            `${froalaDir}css/froala_editor.pkgd${min}.css`,
            // `${froalaDir}css/froala_style${min}.css`,
            `${froalaDir}css/themes/dark${min}.css`,
            `${froalaDir}css/third_party/embedly${min}.css`,
            `${froalaDir}css/third_party/font_awesome${min}.css`,
            `${froalaDir}css/third_party/image_tui${min}.css`,
            // `${froalaDir}css/third_party/spell_checker${min}.css`
        ]).then(() => {
            this.styled = true
            this.refresh()
        }).catch((e: Error) => {
            console.error(e)
            console.warn('Issue detected in CSS Loader for Component:', this.uid)
            this.styled = true
            this.refresh()
        })

        // _.forEach(cssFiles, (file: string) => Stratus.Internals.CssLoader(file).catch((e) => console.error(e)))

        // TODO: Allow more CSS files to get pulled and mark this.styled appropriately
        /* *
        if (_.has(boot.configuration.paths, 'quill')) {
            const quillDir = `${Stratus.BaseUrl}${boot.configuration.paths.quill.replace(/[^/]*$/, '')}`
            Stratus.Internals.CssLoader(`${quillDir}quill.core.css`)
            // Stratus.Internals.CssLoader(`${quillDir}quill.bubble.css`)
            Stratus.Internals.CssLoader(`${quillDir}quill.snow.css`)
        }
        /* */

        // Hydrate Root App Inputs
        this.hydrate(elementRef, sanitizer, keys<EditorComponent>())

        // Data Connections
        // TODO: Spelunk through this code to determine why I am getting an empty component on occasion...
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
        // TODO: Test if the observable is necessary in any way...
        this.dataSub = new Observable(subscriber => {
            if (this.dev) {
                console.warn(`[observable] creating subscriber on ${this.uid}`, subscriber)
            }
            return this.dataDefer(subscriber)
        })
        this.dataSub.pipe(
            // debounceTime(250),
            debounce(() => timer(250)),
            catchError(this.handleError)
        ).subscribe(evt => {
            // While the editor is focused, we skip debounce updates to avoid cursor glitches
            if (this.focused) {
                if (this.dev) {
                    console.warn(`[subscriber] waiting on updates due to focus on ${this.uid}`)
                }
                return
            }
            // TODO: This may need to only work on blur and not focus, unless it is the initialization value
            const dataControl = this.form.get('dataString')
            if (dataControl.value === evt) {
                // In the case of data being edited by the code view or something else,
                // we need to refresh the UI, as long as it has been initialized.
                if (this.initialized) {
                    this.refresh()
                }
                return
            }
            dataControl.patchValue(evt)
            // Note: A refresh may be necessary if things become less responsive
            this.refresh()
        })

        // console.info('constructor!');
    }

    ngOnInit() {
        this.initialized = true
        // console.info(`${moduleName}.ngOnInit`)
        const dataControl = this.form.get('dataString')
        // This valueChanges field is an Event Emitter
        if (this.debounceSave) {
            // Pipe for Model Debounce
            dataControl.valueChanges.pipe(
                debounce(() => timer(this.debounceTime)),
                catchError(this.handleError)
            ).subscribe((evt: string) => this.modelSave(evt))
            // Pipe for changedExternal
            dataControl.valueChanges.pipe(
                debounce(() => timer(250)),
                catchError(this.handleError)
            ).subscribe((evt: string) => {
                if (this.model.changedExternal) {
                    return
                }
                this.model.changedExternal = true
                this.model.trigger('change')
            })
            // Pipe for outgoingData
            dataControl.valueChanges.forEach(
                (value: string) => this.outgoingData = value
            )
        } else {
            dataControl.valueChanges.forEach(
                (value: string) => this.modelSave(value)
            )
        }
        // Detect and list duplicates
        if (this.dev) {
            this.listDuplicates(this.froalaConfig)
        }
    }

    modelSave(value: string) {
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

        // If `useClasses: false`, this uses the innerHTML instead of the form output
        // to avoid the fr-original-style attributes being persisted into the models.
        let innerHTML = null
        if (!this.froalaConfig.useClasses
            && this.froalaEditorDirective
            // @ts-ignore
            && this.froalaEditorDirective.getEditor()
            // @ts-ignore
            && this.froalaEditorDirective.getEditor().el
            // @ts-ignore
            && this.froalaEditorDirective.getEditor().el.innerHTML
        ) {
            // @ts-ignore
            innerHTML = this.froalaEditorDirective.getEditor().el.innerHTML
        }

        // Save the qualified change!
        this.model.set(
            this.property,
            this.normalizeOut(innerHTML || value)
        )

        // Remove the changedExternal flag if using debounceSave
        if (this.debounceSave) {
            this.model.changedExternal = false
        }

        // If enabled, Force Save on Persisted Models
        if (this.forceSave && !_.isEmpty(this.model.getIdentifier())) {
            this.model.save()
        }
    }

    listDuplicates(data: LooseObject) : LooseObject {
        _.forEach(data, (value, key) => {
            if (!_.isArray(value)) {
                return
            }
            const catalog: LooseObject = {}
            value.forEach((e: string) => catalog[e] = (catalog[e] || 0) + 1)
            const duplicates: Array<any> = _.filter(_.map(catalog, ((v, k) => v > 1 ? k : null)))
            if (!duplicates.length) {
                return
            }
            console.warn('Froala Config:', key, 'has duplicates:', duplicates)
        })
        return data
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
            // TODO: look into either piping the data here to remove `fr-original-style`
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
        // TODO: This currently peels back the image, but we can either do more here or add this format down below
        const imgRegex: RegExp = /<img([\w\W]+?)>/gi
        let imgMatch: RegExpExecArray
        // console.log('imgRegex:', data, imgRegex)
        // tslint:disable-next-line:no-conditional-assignment
        while (imgMatch = imgRegex.exec(data)) {
            // Store the entire element for later use
            const el: string = imgMatch[0]

            // This skips elements with the entire image data in the src
            if (el.includes('data:image')) {
                continue
            }

            // TODO: Analyze whether we will need to ensure `data-stratus-src` is available for all Sitetheory Assets.
            // if (src.includes('cdn.sitetheory.io')) {
            //     console.log('sitetheory image:', src)
            // }

            // This skips image sizing for elements without lazy loading
            // TODO: Enable this after things are normalized
            // if (!src.includes('data-stratus-src')) {
            //     continue
            // }

            // Note: This regex may need further enhancements as more images enter the system.
            const srcRegex: RegExp = /^<img\s(.+?)(-[A-Z]{2})?\.(?=[^.]*$)(.+)>/gi
            const srcMatch: RegExpExecArray = srcRegex.exec(el)
            if (srcMatch === null) {
                console.warn('Unable to find file name for image src:', el)
                continue
            }
            // Handle Images without Lazy Loading
            if (!el.includes('data-stratus-src')) {
                // Ensure we only normalize images from our CDN
                if (!el.includes('cdn.sitetheory.io')) {
                    continue
                }
                // Ensure we only normalize images with our sizing format
                if (_.isEmpty(srcMatch[2])) {
                    continue
                }
                // console.log('data-stratus-src not found:', {
                //     data,
                //     imgMatch,
                //     el,
                //     srcMatch
                // })
                // This adds lazy loading to elements that need it
                data = data.replace(el, `<img data-stratus-src ${srcMatch[1]}-${size}.${srcMatch[3]}>`)
                // This removes image sizing from elements without lazy loading
                // data = data.replace(el, `${srcMatch[1]}.${srcMatch[3]}`)
                continue
            }
            data = data.replace(el, `<img ${srcMatch[1]}-${size}.${srcMatch[3]}>`)
        }
        return data
    }

    // ngOnChanges() {
    //     // Display Inputs
    //     if (!this.dev) {
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
            if (this.dev) {
                console.warn(`[defer] debouncing due to empty subscriber on ${this.uid}`)
            }
            setTimeout(() => {
                if (this.dev) {
                    console.warn(`[defer] debounced subscriber returned on ${this.uid}`)
                }
                this.dataDefer(subscriber)
            }, 250)
            return
        }
        const prevString = _.clone(this.incomingData)
        const dataString = this.dataRef()
        // ensure changes have occurred
        if (prevString === dataString) {
            return
        }
        if (!dataString && (!this.data || !this.data.completed)) {
            if (this.dev) {
                console.warn(`[defer] debouncing subscriber due to unavailable data on ${this.uid}`, this.data)
            }
            setTimeout(() => {
                if (this.dev) {
                    console.warn(`[defer] debounced subscriber returned on ${this.uid}`)
                }
                this.dataDefer(subscriber)
            }, 250)
            return
        }
        if (!this.froalaConfig.useClasses) {
            if (prevString === dataString) {
                return
            }
        }
        if (this.dev) {
            console.warn(`[subscriber] new value submitted on ${this.uid}:`, dataString)
        }
        this.subscriber.next(dataString)
        // TODO: Add a returned Promise to ensure async/await can use this defer directly.
    }

    dataRef(): string {
        if (!this.model) {
            return ''
        }
        return this.incomingData = this.normalizeIn(
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
    changedEditor(event: Event) {
        console.log('editor-change:', event)
    }

    onChangeEvent(event: Event) {
        console.log('change:', event)
    }

    onFocus(event: FocusEvent) {
        if (this.dev && this.debug) {
            console.warn(`[onFocus] triggered on ${this.uid}`)
        }
        this.focused = true
        this.blurred = false
    }

    onBlur(event: FocusEvent) {
        if (this.dev && this.debug) {
            console.warn(`[onBlur] triggered on ${this.uid}`)
        }
        this.focused = false
        this.blurred = true
        // Handle debounce triggers
        if (!this.debounceSave) {
            return
        }
        this.modelSave(this.outgoingData)
    }

    bypassHTML(html: string) {
        return this.sanitizer.bypassSecurityTrustHtml(html)
    }

    trigger(name: string, data: any, callee: TriggerInterface) {
        if (this.dev && this.debug) {
            console.log('editor.trigger:', name, callee)
        }
        if (name === 'media-library') {
            this.openMediaDialog(callee)
        } else if (name === 'citation-input') {
            this.openCitationDialog(callee)
        } else if (name === 'link-library') {
            this.openLinkDialog(callee, data)
        } else if (name === 'code-view') {
            this.openCodeViewDialog()
        }
        // callee.trigger('editor', null, this)
    }

    public openCitationDialog(callee: TriggerInterface): void {
        const dialogRef = this.dialog.open(CitationDialogComponent, {
            width: '1000px',
            data: {
                editor: this,
                eventManager: callee,
                form: this.form,
                model: this.model,
                property: this.property,
            }
        })
        // Dialog will refresh itself
        // this.refresh()

        const that = this
        dialogRef.afterClosed().subscribe((result: CitationDialogData) => {
            if (!result || _.isEmpty(result)) {
                return
            }
            // Refresh Component
            that.refresh()
            // Display output if one exists
            if (this.dev && result) {
                console.log('citation dialog result:', result)
            }
        })
    }

    public openLinkDialog(callee: TriggerInterface, data: any): void {
        const dialogRef = this.dialog.open(LinkDialogComponent, {
            width: '500px',
            data: {
                editor: this,
                eventManager: callee,
                element: data,
                // eventInsert: false,
                form: this.form,
                model: this.model,
                property: this.property
            }
        })
        this.refresh()

        const that = this
        dialogRef.afterClosed().subscribe((result: LinkDialogData) => {
            if (!result || _.isEmpty(result)) {
                return
            }
            // Refresh Component
            that.refresh()
            // Display output if one exists
            if (this.dev && result) {
                console.log('link dialog result:', result)
            }
        })
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
            if (this.dev && result) {
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
            if (this.dev && result) {
                console.log('code view dialog result:', result)
            }
        })
    }
}
