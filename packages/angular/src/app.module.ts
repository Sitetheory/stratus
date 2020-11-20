// PURPOSE
// - This is where we register every component that will be used or imported
// - add an import to define where it is located, e.g. import { BaseComponent } from '@stratusjs/angular/base/base.component'
// - add to declarations and entryComponents

// Stratus Libraries
import {cookie} from '@stratusjs/core/environment'

// Angular Core
import {HttpClientModule} from '@angular/common/http'
import {
    ApplicationRef,
    NgModule
} from '@angular/core'
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms'
import {MatNativeDateModule} from '@angular/material/core'
import {BrowserModule} from '@angular/platform-browser'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'

// Angular Locales
// import localeFr from '@angular/common/locales/fr'
// import localeEs from '@angular/common/locales/es'

// Register Locales
// registerLocaleData(localeFr, 'fr-FR')
// registerLocaleData(localeEs, 'es-ES')

// Material Modules
import {MaterialModules} from '@stratusjs/angular/material'

// Base Components
import {BaseComponent} from '@stratusjs/angular/base/base.component'

// Stratus Custom Directives/Components
import {ConfirmDialogComponent} from '@stratusjs/angular/confirm-dialog/confirm-dialog.component'
import {EditorComponent} from '@stratusjs/angular/editor/editor.component'
import {MapComponent} from '@stratusjs/map/map.component'
import {SelectorComponent} from '@stratusjs/angular/selector/selector.component'
import {TreeComponent} from '@stratusjs/angular/tree/tree.component'
import {TreeDialogComponent} from '@stratusjs/angular/tree/tree-dialog.component'
import {TreeNodeComponent} from '@stratusjs/angular/tree/tree-node.component'

// Angular Components
// import {
//     QuillModule
// } from 'ngx-quill'
// import {
//     FroalaEditorModule,
//     FroalaViewModule
// } from 'angular-froala-wysiwyg'

// The following components are not currently in use:
/* *
import {
    MonacoEditorModule,
    NgxMonacoEditorConfig
} from 'ngx-monaco-editor'
import {
    CodeEditorModule
} from '@ngstack/code-editor'
/* */

// External Dependencies
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'

// Highlight.js
// import hljs from 'highlight.js/lib/core'
// import javascript from 'highlight.js/lib/languages/javascript'
// import typescript from 'highlight.js/lib/languages/typescript'
// import twig from 'highlight.js/lib/languages/twig'
// import xml from 'highlight.js/lib/languages/xml'
// import yaml from 'highlight.js/lib/languages/yaml'

// Highlight.js
// hljs.configure({
//     languages: [
//         'css',
//         'javascript',
//         'less',
//         'scss',
//         'typescript',
//         'twig',
//         'xml',
//         'yaml'
//     ]
// })

// Highlight.js Registers
// hljs.registerLanguage('javascript', javascript)
// hljs.registerLanguage('typescript', typescript)
// hljs.registerLanguage('twig', twig)
// hljs.registerLanguage('xml', xml)
// hljs.registerLanguage('yaml', yaml)

// Google Modules (required by @stratusjs/map)
import {GoogleMapsModule} from '@angular/google-maps'

// Angular Editor Dependencies
import {
    AngularEditorModule
} from '@kolkov/angular-editor'

// Quill Modules
// import Quill from 'quill'
// import {QuillConfig} from 'ngx-quill/lib/quill-editor.interfaces'

// Editor Dialogs
import {
    CodeViewDialogComponent
} from '@stratusjs/angular/editor/code-view-dialog.component'
import {
    MediaDialogComponent
} from '@stratusjs/angular/editor/media-dialog.component'
import {
    FroalaEditorModule
} from '@stratusjs/angular/froala/editor/froala-editor.module'
import {
    FroalaViewModule
} from '@stratusjs/angular/froala/view/froala-view.module'

// Quill Plugins
// import {QuillInputButtonPlugin} from '@stratusjs/angular/editor/quill-input-button.plugin'

// External Quill Modules
// import ImageUploader from 'quill-image-uploader'
// import {
//     htmlEditButton
//     // @ts-ignore
// } from 'quill-html-edit-button'
// @ts-ignore
// import ImageDropAndPaste from 'quill-image-drop-and-paste'

// Quill Module Registers
// Quill.register('modules/mediaLibrary', QuillInputButtonPlugin)
// Quill.register('modules/codeView', QuillInputButtonPlugin)
// Quill.register('modules/imageUploader', ImageUploader)
// Quill.register('modules/htmlEditButton', htmlEditButton)
// Quill.register('modules/imageDropAndPaste', ImageDropAndPaste)

// Quill Format Registers
// FIXME: None of these fire when images are formatted
// Quill.register(QuillImageFormatPlugin)
// Quill.register('formats/image', QuillImageFormatPlugin)
// Quill.register('formats/imageCustom', QuillImageFormatPlugin)

// Quill Blot Registers
// console.log('Quill Break:', QuillBreak)
// Quill.register(QuillBreak)

// Third Party Quill
// TODO: Remove once our custom solutions are in place from the new QuillInputButton
// import QuillDropzone from '@stratusjs/angular/editor/quill.dropzone'
// import QuillHtmlEdit from '@stratusjs/angular/editor/quill.html.edit'
// Quill.register('modules/dropzone', QuillDropzone)
// Quill.register('modules/htmlEdit', QuillHtmlEdit)

// Dynamic Loader Prototype
// import {
//     AngularModules
// } from '@stratusjs/angular/angular.modules'

// let roster: {};
// roster = {
//     // 'sa-base': BaseComponent,
//     'sa-selector': SelectorComponent,
//     'sa-tree': TreeComponent
// };
//
// const bootstrap = _.keys(roster)
//     .map(component => {
//         const elements = document.getElementsByTagName(component);
//         if (!elements || !elements.length) {
//             return null;
//         }
//         return component;
//     })
//     .filter((item) => !!item)
//     .map((element) => _.get(roster, element) || null)
//     .filter((item) => !!item);

// External Configs
// const quillConfig: QuillConfig = {
const quillConfig: any = {
    /* *
    formats: [
        'header', 'font', 'size',
        'background', 'color',
        'script', 'align', 'direction',
        'bold', 'italic', 'underline', 'strike',
        'blockquote', 'code-block',
        'list', 'bullet', 'indent',
        'link', 'image', 'video',
        // 'imageCustom'
    ],
    /* */
    modules: {
        syntax: true,
        toolbar: [
            // inline text styles
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            [{script: 'sub'}, {script: 'super'}],         // superscript/subscript

            // block paragraph styles
            [{header: [1, 2, 3, 4, 5, 6, false]}],
            [{list: 'ordered'}, {list: 'bullet'}],
            ['blockquote', 'code-block'],

            // align and indent
            [{
                align: [
                    // For some reason `left` makes the button show as 'undefined'
                    // 'left',
                    // 'center',
                    // 'right',
                    // 'justify'
                ]
            }],
            [{indent: '-1'}, {indent: '+1'}],             // outdent/indent

            // [{ size: ['small', false, 'large', 'huge'] }],   // custom dropdown

            // [{ color: [] }, { background: [] }],             // dropdown with defaults from theme
            // [{ font: [] }],


            ['clean'],                                       // remove formatting button

            [
                'link',
                // 'image',
                'video'
            ],
            // [{ direction: 'rtl' }]                        // text direction
        ],
        mediaLibrary: {
            debug: true,
            buttonHTML: '<i class="fas fa-photo-video"></i>',
            buttonTitle: 'Media Library',
            name: 'mediaLibrary',
            eventName: 'media-library'
        },
        codeView: {
            debug: true,
            buttonHTML: '<i class="fas fa-file-code"></i>',
            buttonTitle: 'Code View',
            name: 'codeView',
            eventName: 'code-view'
        }
        // TODO: Remove once our custom solutions are in place from the new QuillInputButton
        /* *
        htmlEdit: {debug: true}
        /* */
        /* *
        dropzone: {
            container: document.body,
            config: {
                url: '/upload/file',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/hal+json'
                },
                init() {
                    // Demo Example (Not functional for our purposes)
                    // Quill.editors[0].editor.quill.onModuleLoad('dropzone', (dropzone: any) => {
                    //     this.on('success', (file: any, xhr: any) => {
                    //         // Handle response from server.
                    //         const location = xhr.location ? xhr.location : ''
                    //
                    //         // Attach insert buttons under each preview.
                    //         dropzone.actions(file.previewElement, window.location.origin + location)
                    //     })
                    // })
                }
            }
        }
        /* */
    }
}
// This only adds certain modules when in dev mode
if (cookie('env')) {
    /* *
    quillConfig.modules.imageUploader = {
        upload: (file: any) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/JavaScript-logo.png/480px-JavaScript-logo.png'
                    )
                }, 3500)
            })
        }
    }
    /* *
    quillConfig.modules.imageDropAndPaste = {
        handler: (imageDataUrl: any, type: any, imageData: any) => {
            // This logic requires that we build an uploader, but this does get triggered.
            // It does not appear to keep the filename intact, though.
            console.log('image dropped:', {imageDataUrl, type, imageData})

            let filename = 'my_cool_image.png'
            let blob = imageData.toBlob()
            let file = imageData.toFile(filename)

            // generate a form data
            let formData = new FormData()

            // append blob data
            formData.append('filename', filename)
            formData.append('file', blob)

            // or just append the file
            formData.append('file', file)

            // upload image to your server
            callUploadAPI(`https://app.sitetheory.io:3000/?session=${cookie('SITETHEORY')}`, formData, (err, res) => {
                if (err) return
                // success? you should return the uploaded image's url
                // then insert into the quill editor
                let index = (quill.getSelection() || {}).index || quill.getLength()
                if (index) quill.insertEmbed(index, 'image', res.data.image_url, 'user')
            })
        }
    }
    /* */
    /* *
    quillConfig.modules.htmlEditButton = {
        debug: true,
        // msg: 'Edit the content in HTML format',
        // okText: 'Ok',
        // cancelText: 'Cancel'
    }
    /* */
}
/* *
const monacoConfig: NgxMonacoEditorConfig = {
    // configure base path for monaco editor default: './assets'
    // baseUrl: 'sitetheorycore/node_modules/ngx-monaco-editor/assets',
    baseUrl: 'ngx-monaco-editor/assets',
    defaultOptions: {
        scrollBeyondLastLine: false
    },
    // use this function to extend monaco editor functionalities.
    onMonacoLoad: () => {
        console.log((window).monaco, this)
    }
}
/* */

@NgModule({
    // These are for external libraries (or Angular)
    imports: [
        // AngularModules,
        BrowserModule,
        BrowserAnimationsModule,
        // CodeEditorModule.forRoot(),
        FormsModule,
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot(),
        GoogleMapsModule, // Required by @stratusjs/map
        HttpClientModule,
        MaterialModules,
        MatNativeDateModule,
        ReactiveFormsModule,
        AngularEditorModule,
        // Outline: https://app.asana.com/0/1154407311832843/1184252847388849
        // QuillModule.forRoot(quillConfig),
        // MonacoEditorModule.forRoot(monacoConfig)
        // SelectorComponent.forRoot()
    ],
    // This determines what is accessible as a component. These must be listed in `declarations`.
    entryComponents: [
        BaseComponent,
        CodeViewDialogComponent,
        ConfirmDialogComponent,
        EditorComponent,
        MapComponent,
        MediaDialogComponent,
        SelectorComponent,
        TreeComponent,
        TreeDialogComponent,
        TreeNodeComponent,
    ],
    // These determine what exists as a component. These must be listed in `entryComponents`.
    declarations: [
        BaseComponent,
        CodeViewDialogComponent,
        ConfirmDialogComponent,
        EditorComponent,
        MapComponent,
        MediaDialogComponent,
        SelectorComponent,
        TreeComponent,
        TreeDialogComponent,
        TreeNodeComponent,
    ],
    // bootstrap,
    providers: [
        {provide: Window, useValue: window}
    ]
})
export class AppModule {
    // node: true || false
    initialTimeout = 1000
    instances = {}
    modules = {
        'sa-base': BaseComponent,
        'sa-editor': EditorComponent,
        'sa-map': MapComponent,
        'sa-selector': SelectorComponent,
        'sa-tree': TreeComponent
    }

    constructor() {
        Stratus.Instances[_.uniqueId('sa_app_module_')] = this
    }

    ngDoBootstrap(appRef: ApplicationRef) {
        this.detectBoot(appRef)
    }

    // Fade out detection cycles
    exponentialTimeout(limit?: number) {
        if (_.isNumber(limit) && limit < this.initialTimeout) {
            return limit
        }
        // store current
        const currentTimeout = this.initialTimeout
        // increase amount
        this.initialTimeout = this.initialTimeout * 1.01
        // return
        return currentTimeout
    }

    detectBoot(appRef: ApplicationRef) {
        _.forEach(this.modules, (module, selector) => {
            // if (!(module instanceof ComponentFactory)) {
            //     return;
            // }
            const elements = document.getElementsByTagName(selector)
            if (!elements || !elements.length) {
                return
            }
            _.forEach(elements, (node) => {
                if (node.hasAttribute('ng-version')) {
                    return
                }
                // console.log('ngDoBootstrap detected:', node);
                // FIXME: The Modules aren't explicitly the correct type
                // @ts-ignore
                appRef.bootstrap(module, node)
            })
        })
        // FIXME this logic is broken
        /*
        _.forEach(this.directives, (directive, selector) => {
            // if (!(module instanceof ComponentFactory)) {
            //     return;
            // }
            // const elements = document.getElementsByTagName(selector)
            const elements = document.querySelectorAll(`[${selector}]`)
            if (!elements || !elements.length) {
                return
            }
            _.forEach(elements, (node) => {
                if (node.hasAttribute('ng-version')) {
                    return
                }
                console.warn('detected ', selector)
                // console.log('ngDoBootstrap detected:', node);
                // FIXME: Directives cannot be added to ngModule.entryComponents, so this will error
                // @ts-ignore
                appRef.bootstrap(directive, node)
            })
        })*/
        setTimeout(() => {
            this.detectBoot(appRef)
        }, this.exponentialTimeout(4000))
    }
}
