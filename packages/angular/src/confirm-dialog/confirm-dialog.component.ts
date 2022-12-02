import {
    Component,
    Inject
} from '@angular/core'
import {
    MAT_DIALOG_DATA,
    MatDialogRef
} from '@angular/material/dialog'
import {cookie} from '@stratusjs/core/environment'
import {Stratus} from '@stratusjs/runtime/stratus'

// Local Setup
const systemDir = '@stratusjs/angular'
const moduleName = 'confirm-dialog'

// Directory Template
const min = !cookie('env') ? '.min' : ''
const localDir = `${Stratus.BaseUrl}${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '').replace(/\/dist\/$/, '/src/')}`

export interface ConfirmDialogData {
    title: string
    message: string
}

/**
 * @title Dialog for User Confirmation
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${moduleName}/${moduleName}.component${min}.html`,
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
    ) {}

    onConfirm(): void {
        this.dialogRef.close(true)
    }

    onDismiss(): void {
        this.dialogRef.close(false)
    }
}
