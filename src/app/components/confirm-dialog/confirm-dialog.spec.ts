import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
    let component: ConfirmDialog;
    let fixture: ComponentFixture<ConfirmDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConfirmDialog],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmDialog);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display default title', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Confirm');
    });

    it('should display custom title', () => {
        fixture.componentRef.setInput('title', 'Custom Title');
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Custom Title');
    });

    it('should display default message', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Are you sure?');
    });

    it('should display custom message', () => {
        fixture.componentRef.setInput('message', 'Custom message');
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Custom message');
    });

    it('should display default confirm label', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Delete');
    });

    it('should display custom confirm label', () => {
        fixture.componentRef.setInput('confirmLabel', 'Proceed');
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Proceed');
    });

    it('should emit confirmed when confirm button is clicked', () => {
        const confirmedSpy = jest.spyOn(component.confirmed, 'emit');

        const confirmButton = fixture.nativeElement.querySelector('.btn-confirm');
        confirmButton?.click();

        expect(confirmedSpy).toHaveBeenCalled();
    });

    it('should emit cancelled when cancel button is clicked', () => {
        const cancelledSpy = jest.spyOn(component.cancelled, 'emit');

        const cancelButton = fixture.nativeElement.querySelector('.btn-cancel');
        cancelButton?.click();

        expect(cancelledSpy).toHaveBeenCalled();
    });
});