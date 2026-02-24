import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BookCard } from './book-card';
import { Book } from '../../models/book.model';

describe('BookCard', () => {
    let component: BookCard;
    let fixture: ComponentFixture<BookCard>;
    const mockBook: Book = {
        id: '1',
        title: 'Test Book',
        author: 'Test Author',
        year: 2024,
        createdAt: '2024-02-23'
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BookCard],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();

        fixture = TestBed.createComponent(BookCard);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('book', mockBook);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display book title', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Test Book');
    });

    it('should display book author', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Test Author');
    });

    it('should display book year', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('2024');
    });

    it('should compute avatar color based on title', () => {
        expect(component.avatarColor()).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should compute initial from book title', () => {
        expect(component.initial()).toBe('T');
    });

    it('should emit removeClick when onRemoveClick is called', () => {
        const spy = jest.fn();
        component.removeClick.subscribe(spy);

        component.onRemoveClick();

        expect(spy).toHaveBeenCalled();
    });

    it('should show remove button when showRemoveButton is true', () => {
        fixture.componentRef.setInput('showRemoveButton', true);
        fixture.detectChanges();

        const removeButton = fixture.nativeElement.querySelector('.btn-remove-book');
        expect(removeButton).toBeTruthy();
    });

    it('should hide remove button when showRemoveButton is false', () => {
        fixture.componentRef.setInput('showRemoveButton', false);
        fixture.detectChanges();

        const removeButton = fixture.nativeElement.querySelector('.btn-remove-book');
        expect(removeButton).toBeFalsy();
    });
});