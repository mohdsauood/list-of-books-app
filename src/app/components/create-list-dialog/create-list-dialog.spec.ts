import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { CreateListDialog } from './create-list-dialog';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';
import { of } from 'rxjs';

describe('CreateListDialog', () => {
    let component: CreateListDialog;
    let fixture: ComponentFixture<CreateListDialog>;
    let bookService: jest.Mocked<BookService>;

    const mockBooks: Book[] = [
        {
            id: '1',
            title: 'Test Book 1',
            author: 'Author 1',
            year: 2024,
            createdAt: '2024-02-23'
        },
        {
            id: '2',
            title: 'Test Book 2',
            author: 'Author 2',
            year: 2023,
            createdAt: '2024-02-23'
        }
    ];

    beforeEach(async () => {
        const bookServiceMock = {
            addBook: jest.fn(),
            createBookList: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [CreateListDialog],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideZonelessChangeDetection(),
                { provide: BookService, useValue: bookServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(CreateListDialog);
        component = fixture.componentInstance;
        bookService = TestBed.inject(BookService) as jest.Mocked<BookService>;

        fixture.componentRef.setInput('books', mockBooks);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add dialog-open class to body on init', () => {
        expect(document.body.classList.contains('dialog-open')).toBe(true);
    });

    it('should remove dialog-open class from body on destroy', () => {
        component.ngOnDestroy();
        expect(document.body.classList.contains('dialog-open')).toBe(false);
    });

    it('should update list name on input', () => {
        const event = { target: { value: 'New List Name' } } as unknown as Event;
        component.onListNameInput(event);
        expect(component['listName']()).toBe('New List Name');
    });

    it('should update list description on input', () => {
        const event = { target: { value: 'New Description' } } as unknown as Event;
        component.onListDescriptionInput(event);
        expect(component['listDescription']()).toBe('New Description');
    });

    it('should update new book title on input', () => {
        const event = { target: { value: 'New Book Title' } } as unknown as Event;
        component.onNewBookTitleInput(event);
        expect(component['newBookTitle']()).toBe('New Book Title');
    });

    it('should update new book author on input', () => {
        const event = { target: { value: 'New Author' } } as unknown as Event;
        component.onNewBookAuthorInput(event);
        expect(component['newBookAuthor']()).toBe('New Author');
    });

    it('should update new book year on input', () => {
        const event = { target: { value: '2025' } } as unknown as Event;
        component.onNewBookYearInput(event);
        expect(component['newBookYear']()).toBe(2025);
    });

    it('should validate form correctly', () => {
        expect(component['isFormValid']()).toBe(false);

        const nameEvent = { target: { value: 'Test List' } } as unknown as Event;
        component.onListNameInput(nameEvent);

        expect(component['isFormValid']()).toBe(true);
    });

    it('should validate new book form correctly', () => {
        expect(component['isNewBookValid']()).toBe(false);

        const titleEvent = { target: { value: 'Test Book' } } as unknown as Event;
        component.onNewBookTitleInput(titleEvent);

        const authorEvent = { target: { value: 'Test Author' } } as unknown as Event;
        component.onNewBookAuthorInput(authorEvent);

        expect(component['isNewBookValid']()).toBe(true);
    });

    it('should check if book is selected', () => {
        component.toggleBook('1');
        expect(component.isBookSelected('1')).toBe(true);
        expect(component.isBookSelected('2')).toBe(false);
    });

    it('should toggle book selection', () => {
        component.toggleBook('1');
        expect(component.isBookSelected('1')).toBe(true);

        component.toggleBook('1');
        expect(component.isBookSelected('1')).toBe(false);
    });

    it('should get selected books', () => {
        component.toggleBook('1');
        const selectedBooks = component.getSelectedBooks();
        expect(selectedBooks).toEqual([mockBooks[0]]);
    });

    it('should remove selected book', () => {
        component.toggleBook('1');
        component.removeSelectedBook('1');
        expect(component.isBookSelected('1')).toBe(false);
    });

    it('should toggle book picker', () => {
        expect(component['showBookPicker']()).toBe(false);
        component.toggleBookPicker();
        expect(component['showBookPicker']()).toBe(true);
    });

    it('should toggle add book form', () => {
        expect(component['showAddBookForm']()).toBe(false);
        component.toggleAddBookForm();
        expect(component['showAddBookForm']()).toBe(true);

        // Should reset form when closing
        const titleEvent = { target: { value: 'Test' } } as unknown as Event;
        component.onNewBookTitleInput(titleEvent);
        component.toggleAddBookForm();

        expect(component['showAddBookForm']()).toBe(false);
        expect(component['newBookTitle']()).toBe('');
    });

    it('should add new book', () => {
        const newBook: Book = {
            id: '3',
            title: 'New Book',
            author: 'New Author',
            year: 2024,
            createdAt: '2024-02-23'
        };

        bookService.addBook.mockReturnValue(of(newBook));

        const titleEvent = { target: { value: 'New Book' } } as unknown as Event;
        component.onNewBookTitleInput(titleEvent);

        const authorEvent = { target: { value: 'New Author' } } as unknown as Event;
        component.onNewBookAuthorInput(authorEvent);

        component.toggleAddBookForm();
        component.addNewBook();

        expect(bookService.addBook).toHaveBeenCalledWith('New Book', 'New Author', 2024);
        expect(component.isBookSelected('3')).toBe(true);
        expect(component['showAddBookForm']()).toBe(false);
    });

    it('should not add book if form is invalid', () => {
        component.addNewBook();
        expect(bookService.addBook).not.toHaveBeenCalled();
    });

    it('should create list', () => {
        const nameEvent = { target: { value: 'Test List' } } as unknown as Event;
        component.onListNameInput(nameEvent);

        const descEvent = { target: { value: 'Test Description' } } as unknown as Event;
        component.onListDescriptionInput(descEvent);

        component.toggleBook('1');

        const createdSpy = jest.fn();
        const closedSpy = jest.fn();
        component.created.subscribe(createdSpy);
        component.closed.subscribe(closedSpy);

        component.createList();

        expect(bookService.createBookList).toHaveBeenCalledWith('Test List', 'Test Description', ['1']);
        expect(createdSpy).toHaveBeenCalled();
        expect(closedSpy).toHaveBeenCalled();
    });

    it('should not create list if form is invalid', () => {
        component.createList();
        expect(bookService.createBookList).not.toHaveBeenCalled();
    });

    it('should close dialog', () => {
        const closedSpy = jest.fn();
        component.closed.subscribe(closedSpy);

        component.close();

        expect(closedSpy).toHaveBeenCalled();
    });
});