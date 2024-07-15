// Angular Core
import {
    ChangeDetectorRef,
    Component,
    Inject,
    OnInit
} from '@angular/core'
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators
} from '@angular/forms'

// Angular Material
import {
    MAT_DIALOG_DATA,
    MatDialogRef
} from '@angular/material/dialog'
import {
    MatSnackBar
} from '@angular/material/snack-bar'

// RXJS
import {
    Observable, Subscriber
} from 'rxjs'

// External
import {head, isEmpty, isString, isUndefined, snakeCase, uniqueId} from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {cookie} from '@stratusjs/core/environment'

import {
    LooseFunction,
    LooseObject
} from '@stratusjs/core/misc'
import {Model} from '@stratusjs/angularjs/services/model'
import {TriggerInterface} from '../core/trigger.interface'

// Extends
import {
    ResponsiveComponent
} from '../core/responsive.component'
// import {ContentEntity} from '../data/content.interface'
import {IconOptions, MatIconRegistry} from '@angular/material/icon'
import {DomSanitizer} from '@angular/platform-browser'
import {InputButtonPlugin} from '../froala/plugins/inputButton'
import {CitationManager} from '../froala/plugins/citationManager'

// Local Setup
const systemDir = '@stratusjs/angular'
const moduleName = 'citation-dialog'
const parentModuleName = 'editor'

// Directory Template
const min = !cookie('env') ? '.min' : ''
const localDir = `${Stratus.BaseUrl}${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '').replace(/\/dist\/$/, '/src/')}`

/**
 * @title Dialog for Nested Tree
 */
@Component({
    selector: `sa-internal-${moduleName}`,
    templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component${min}.html`,
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class CitationDialogComponent extends ResponsiveComponent implements OnInit {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Dependencies
    Stratus = Stratus

    dialogCitationForm: FormGroup
    popupTitle = 'Create New Citation'
    warningMessage?: string
    isPopupLoading = true
    formDisabled = false

    // Model Settings
    model: Model
    property: string

    // Event Settings
    editor: TriggerInterface
    eventManager: InputButtonPlugin<string>
    baseEditor: LooseObject & {
        citationManager: CitationManager // LooseObject<LooseFunction>
        selection: LooseObject<LooseFunction> & {
            element(): Element // entire element surrounding the highlighted text (maybe be inaccurate due to froala selection tags)
            endElement(): Element // entire element surrounding the highlighted text
            text(): string // only the highlighted text
        }
    }
    highlightedText: string // The originally highlighted text (incase selection changes)
    newCitation = true
    existingCitationElement?: Element

    // Icon Localization
    svgIcons: {
        [key: string]: string
    } = {}

    constructor(
        public dialogRef: MatDialogRef<CitationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: CitationDialogData,
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        protected ref: ChangeDetectorRef
    ) {
        // Chain constructor
        super()

        // Manually render upon data change
        // ref.detach()
    }

    ngOnInit() {
        // Initialization
        this.uid = uniqueId(`sa_${snakeCase(moduleName)}_component_`)
        Stratus.Instances[this.uid] = this

        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.CssLoader(`${localDir}${parentModuleName}/${moduleName}.component${min}.css`)

        // Hoist Data
        this.model = this.data.model
        this.property = this.data.property
        this.editor = this.data.editor
        this.eventManager = this.data.eventManager
        this.baseEditor = this.data.eventManager.editor

        // Form Logic
        this.dialogCitationForm = this.fb.group({
            citationContentInput: new FormControl('', [Validators.required]),
            citationTitleInput: new FormControl(''),
        })

        this.highlightedText = this.baseEditor.selection.text()
        // Let's figure out if this is going to make a new citation or update an existing
        const containedElement = this.baseEditor.citationManager.getSelectedCitation() ||
            this.baseEditor.citationManager.getLastKnownCitation() // Last known detect better and set from Toolbar
        this.baseEditor.citationManager.hideToolbar() // Let's ensure this closes and all vars reset
        // const containedElement = this.baseEditor.selection.endElement()
        // const containedElementName = containedElement.tagName
        if (containedElement) {
            this.newCitation = false
            this.existingCitationElement = containedElement
            const copiedElement = containedElement.cloneNode(true) as Element
            // if text is highlighted, we need to manually remove all the styling froala injected
            Array.from(copiedElement.getElementsByClassName('fr-marker')).forEach((markerEl)=>{
                markerEl.remove()
            })
            // find <stratus-citation-content> and <stratus-citation-content>
            const contentElement = head(copiedElement.getElementsByTagName('stratus-citation-content'))
            if (contentElement) {
                // Set all the contents of this existing Citation as edittable
                this.dialogCitationForm.get('citationContentInput').setValue(contentElement.innerHTML)
            }
            const titleElement = head(copiedElement.getElementsByTagName('stratus-citation-title'))
            if (titleElement) {
                // Set all the title of this existing Citation as edittable
                this.dialogCitationForm.get('citationTitleInput').setValue(titleElement.innerHTML)
            }
        }
        if (this.newCitation && !isEmpty(this.highlightedText)) {
            this.popupTitle = 'Convert Text into Citation'
            this.dialogCitationForm.get('citationTitleInput').setValue(this.highlightedText)
        }

        if (!this.newCitation) {
            this.popupTitle = 'Update Citation'
        }

        // FIXME: We have to go in this roundabout way to force changes to be detected since the
        // Dialog Sub-Components don't seem to have the right timing for ngOnInit
        this.isPopupLoading = false
        this.refresh()
    }

    cancel(): void {
        this.dialogRef.close()
        this.refresh()
    }

    confirm() {
        if (isUndefined(this.dialogCitationForm.get('citationContentInput'))) {
            return
        }
        const content = this.dialogCitationForm.get('citationContentInput').value
        if (isUndefined(content) || !isString(content)) {
            return
        }

        const title = this.dialogCitationForm.get('citationTitleInput').value
        const citationElement = this.createCitationHTML(content, title)
        if (!citationElement) {
            console.warn(`${moduleName}: unable to build citation for: ${content}`)
            this.snackBar.open(`Unable to build citation for: ${content}.`, 'dismiss', {
                duration: 5000,
                horizontalPosition: 'right',
                verticalPosition: 'bottom'
            })
            return
        }

        if (!this.eventManager) {
            console.warn(`${moduleName}: event manager is not set.`)
            return
        }

        // this.baseEditor.selection.restore()
        // if this is a new element, we can insert... however if this is existing, we only want to update the existing element
        if (!this.newCitation && this.existingCitationElement) {
            // The selection tool is not working properly... so we are just going to directly alter the existing element
            this.existingCitationElement.outerHTML = citationElement
        } else {
            this.eventManager.trigger('insert', citationElement, this.editor)
            // this.baseEditor.html.insert(citationElement) // same effect as above trigger
        }
        this.dialogRef.close()
    }

    createCitationHTML (content: string, title?: string): string|null {
        if (!content) {
            console.warn(`${moduleName}: unable to create citation for empty content`)
            return null
        }
        if (!isEmpty(title)) {
            title = `<stratus-citation-title>${title}</stratus-citation-title>`
        } else {
            title = `<stratus-citation-notitle/>`
        }

        return `<stratus-citation><stratus-citation-content>${content}</stratus-citation-content>${title}</stratus-citation-content>`
    }

    getSvg(url: string, options?: IconOptions): Observable<string> {
        const uid = this.addSvgIcon(url, options)
        return new Observable<string>((subscriber: Subscriber<string>) => {
            this.iconRegistry
                .getNamedSvgIcon(uid)
                .subscribe({
                    /* *
                     next(svg: SVGElement) {
                     console.log(`getSvg(${url}):`, svg)
                     },
                     /* */
                    error(err) {
                        console.error(`getSvg(${url}): ${err}`)
                    },
                    complete() {
                        // console.log(`getSvg(${url}): completed`)
                        subscriber.next(uid)
                    }
                })
        })
    }

    /**
     * This function marks a url safe with the DomSanitizer and returns a uid
     * https://material.angular.io/components/icon/overview#svg-icons
     */
    addSvgIcon(url: string, options?: IconOptions) : string {
        if (url in this.svgIcons) {
            return this.svgIcons[url]
        }
        if (!options) {
            options = {}
        }
        const uid = this.svgIcons[url] = uniqueId('selector_svg')
        this.iconRegistry.addSvgIcon(uid, this.sanitizer.bypassSecurityTrustResourceUrl(url), options)
        return uid
    }
}

// Data Types
export interface CitationDialogData {
    editor: TriggerInterface
    eventManager: InputButtonPlugin<string>
    form: FormGroup,
    model: Model,
    property: string
}
