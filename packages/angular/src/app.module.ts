// Stratus Libraries
import {
    cookie
} from '@stratusjs/core/environment'

// Angular Core
import {
    registerLocaleData
} from '@angular/common'
import {
    HttpClientModule
} from '@angular/common/http'
import {
    ApplicationRef,
    ComponentFactory,
    NgModule
} from '@angular/core'
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms'
import {
    MatNativeDateModule
} from '@angular/material/core'
import {
    BrowserModule
} from '@angular/platform-browser'
import {
    BrowserAnimationsModule
} from '@angular/platform-browser/animations'

// Angular Locales
// import localeFr from '@angular/common/locales/fr'
// import localeEs from '@angular/common/locales/es'

// Register Locales
// registerLocaleData(localeFr, 'fr-FR')
// registerLocaleData(localeEs, 'es-ES')

// Material Modules
import {
    MaterialModules
} from '@stratusjs/angular/material'

// Base Components
import {
    BaseComponent
} from '@stratusjs/angular/base/base.component'

// Stratus Custom Components
import {
    EditorComponent
} from '@stratusjs/angular/editor/editor.component'
import {
    SelectorComponent
} from '@stratusjs/angular/selector/selector.component'
import {
    TreeComponent
} from '@stratusjs/angular/tree/tree.component'
import {
    TreeDialogComponent
} from '@stratusjs/angular/tree/tree-dialog.component'
import {
    TreeNodeComponent
} from '@stratusjs/angular/tree/tree-node.component'

// Angular Components
import {
    QuillModule
} from 'ngx-quill'
import {
    MonacoEditorModule, NgxMonacoEditorConfig
} from 'ngx-monaco-editor'

// External Dependencies
import _ from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'

// Quill Modules
import Quill from 'quill'
import QuillInputButtonPlugin from '@stratusjs/angular/editor/quill-input-button.plugin'
import {QuillConfig} from 'ngx-quill/lib/quill-editor.interfaces'
import {MediaDialogComponent} from '@stratusjs/angular/editor/media-dialog.component'

// Quill Registers
Quill.register('modules/mediaLibrary', QuillInputButtonPlugin)
Quill.register('modules/codeView', QuillInputButtonPlugin)

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
const quillConfig: QuillConfig = {
    modules: {
        // syntax: true,
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],

            [{ header: 1 }, { header: 2 }],                  // custom button values
            [{ list: 'ordered'}, { list: 'bullet' }],
            [{ script: 'sub'}, { script: 'super' }],         // superscript/subscript
            [{ indent: '-1'}, { indent: '+1' }],             // outdent/indent
            [{ direction: 'rtl' }],                          // text direction

            [{ size: ['small', false, 'large', 'huge'] }],   // custom dropdown
            [{ header: [1, 2, 3, 4, 5, 6, false] }],

            [{ color: [] }, { background: [] }],             // dropdown with defaults from theme
            [{ font: [] }],
            [{ align: [] }],

            ['clean'],                                       // remove formatting button

            [
                'link',
                // 'image',
                'video'
            ]
        ],
        /* *
        mediaLibrary: {
            debug: true,
            buttonHTML: '<i class="fas fa-photo-video"></i>',
            buttonTitle: 'Media Library',
            name: 'mediaLibrary',
            eventName: 'media-library'
        },
        /* */
        /* *
        codeView: {
            debug: true,
            buttonHTML: '<i class="fas fa-code"></i>',
            buttonTitle: 'Code View',
            name: 'codeView',
            eventName: 'code-view'
        }
        /* */
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
// This only shows the mediaLibrary and codeView when in dev mode
if (cookie('env')) {
    quillConfig.modules.mediaLibrary = {
        debug: true,
        buttonHTML: '<i class="fas fa-photo-video"></i>',
        buttonTitle: 'Media Library',
        name: 'mediaLibrary',
        eventName: 'media-library'
    }
    quillConfig.modules.codeView = {
        debug: true,
        buttonHTML: '<i class="fas fa-code"></i>',
        buttonTitle: 'Code View',
        name: 'codeView',
        eventName: 'code-view'
    }
}
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

@NgModule({
    imports: [
        // AngularModules,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        MaterialModules,
        MatNativeDateModule,
        ReactiveFormsModule,
        // Outline: https://app.asana.com/0/1154407311832843/1184252847388849
        QuillModule.forRoot(quillConfig),
        MonacoEditorModule.forRoot(monacoConfig)
        // SelectorComponent.forRoot()
    ],
    entryComponents: [
        BaseComponent,
        EditorComponent,
        MediaDialogComponent,
        SelectorComponent,
        TreeComponent,
        TreeDialogComponent,
        TreeNodeComponent,
    ],
    declarations: [
        BaseComponent,
        EditorComponent,
        MediaDialogComponent,
        SelectorComponent,
        TreeComponent,
        TreeDialogComponent,
        TreeNodeComponent,
    ],
    // bootstrap,
    providers: []
})
export class AppModule {
    // node: true || false
    initialTimeout = 1000
    instances = {}
    modules = {
        'sa-base': BaseComponent,
        'sa-editor': EditorComponent,
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
        setTimeout(() => {
            this.detectBoot(appRef)
        }, this.exponentialTimeout(4000))
    }
}
