import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.html',
    styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
    readonly title = input('Confirm');
    readonly message = input('Are you sure?');
    readonly confirmLabel = input('Delete');

    readonly confirmed = output();
    readonly cancelled = output();
}
