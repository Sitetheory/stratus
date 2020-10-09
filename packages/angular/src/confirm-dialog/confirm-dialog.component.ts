import {
    Component,
    Inject
} from '@angular/core'
import {
    MAT_DIALOG_DATA,
    MatDialogRef
} from '@angular/material/dialog'

// Local Setup
const installDir = '/assets/1/0/bundles'
const systemDir = '@stratusjs/angular'
const moduleName = 'confirm-dialog'

// Directory Template
const localDir = `${installDir}/${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '')}`

export interface ConfirmDialogData {
    title: string
    message: string
}

/**
 * @title Dialog for User Confirmation
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${moduleName}/${moduleName}.component.html`,
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
