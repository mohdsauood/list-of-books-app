import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { EditListDialog } from './edit-list-dialog';
import { BookService } from '../../services/book.service';
import { Book, BookList } from '../../models/book.model';
import { of } from 'rxjs';

describe('EditListDialog', () => {
    let component: EditListDialog;
    let fixture: ComponentFixture<EditListDialog>;
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

    const mockBookList: BookList = {
        id: '1',
        name: 'Test List',
        description: 'Test Description',
        bookIds: ['1'],
        bookCount: 1,
        createdAt: '2024-02-23'
    };

    beforeEach(async () => {
        const bookServiceMock = {
            addBook: jest.fn(),
            updateBookList: jest.fn(),
            deleteBookList: jest.fn(),
            addBookToList: jest.fn(),
            removeBookFromList: jest.fn(),
            getBooksForList: jest.fn().mockReturnValue([mockBooks[0]]),
            getBooksNotInList: jest.fn().mockReturnValue([mockBooks[1]])
        };

        await TestBed.configureTestingModule({
            imports: [EditListDialog],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideZonelessChangeDetection(),
                { provide: BookService, useValue: bookServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(EditListDialog);
        component = fixture.componentInstance;
        bookService = TestBed.inject(BookService) as jest.Mocked<BookService>;

        fixture.componentRef.setInput('list', mockBookList);
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

    it('should initialize form values from list input', () => {
        expect(component.listNameR()).toBe('Test List');
        expect(component.listDescriptionR()).toBe('Test Description');
    });

    it('should update new book title on input', () => {
        const event = { target: { value: 'New Book Title' } } as unknown as Event;
        component.onNewBookTitleInput(event);
        expect(component.newBookTitleR()).toBe('New Book Title');
    });

    it('should update new book author on input', () => {
        const event = { target: { value: 'New Author' } } as unknown as Event;
        component.onNewBookAuthorInput(event);
        expect(component.newBookAuthorR()).toBe('New Author');
    });

    it('should update new book year on input', () => {
        const event = { target: { value: '2025' } } as unknown as Event;
        component.onNewBookYearInput(event);
        expect(component.newBookYearR()).toBe(2025);
    });

    it('should validate form correctly', () => {
        expect(component.isFormValid()).toBe(true); // initialized with valid data
    });

    it('should validate new book form correctly', () => {
        expect(component.isNewBookValid()).toBe(false);

        const titleEvent = { target: { value: 'Test Book' } } as unknown as Event;
        component.onNewBookTitleInput(titleEvent);

        const authorEvent = { target: { value: 'Test Author' } } as unknown as Event;
        component.onNewBookAuthorInput(authorEvent);

        expect(component.isNewBookValid()).toBe(true);
    });

    it('should get books in list', () => {
        const booksInList = component.booksInList();
        expect(booksInList).toEqual([mockBooks[0]]);
        expect(bookService.getBooksForList).toHaveBeenCalledWith('1');
    });

    it('should get available books (not in list)', () => {
        const availableBooks = component.availableBooks();
        expect(availableBooks).toEqual([mockBooks[1]]);
    });

    it('should toggle book picker', () => {
        expect(component.showBookPickerR()).toBe(false);
        component.toggleBookPicker();
        expect(component.showBookPickerR()).toBe(true);
    });

    it('should toggle add book form', () => {
        expect(component.showAddBookFormR()).toBe(false);
        component.toggleAddBookForm();
        expect(component.showAddBookFormR()).toBe(true);

        // Should reset form when closing
        const titleEvent = { target: { value: 'Test' } } as unknown as Event;
        component.onNewBookTitleInput(titleEvent);
        component.toggleAddBookForm();

        expect(component.showAddBookFormR()).toBe(false);
        expect(component.newBookTitleR()).toBe('');
    });

    it('should add book to list', () => {
        component.addBookToList('2');
        expect(bookService.addBookToList).toHaveBeenCalledWith('1', '2');
    });

    it('should add new book and link to list', () => {
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
        component.addNewBookAndLink();

        expect(bookService.addBook).toHaveBeenCalledWith('New Book', 'New Author', 2024);
        expect(bookService.addBookToList).toHaveBeenCalledWith('1', '3');
        expect(component.showAddBookFormR()).toBe(false);
    });

    it('should not add book if form is invalid', () => {
        component.addNewBookAndLink();
        expect(bookService.addBook).not.toHaveBeenCalled();
    });

    it('should update list', () => {
        const closedSpy = jest.fn();
        component.closed.subscribe(closedSpy);

        component.updateList();

        expect(bookService.updateBookList).toHaveBeenCalledWith('1', 'Test List', 'Test Description');
        expect(closedSpy).toHaveBeenCalled();
    });

    it('should not update list if form is invalid', () => {
        // Make form invalid
        component['listName'].set('');

        component.updateList();
        expect(bookService.updateBookList).not.toHaveBeenCalled();
    });

    it('should confirm remove book', () => {
        component.confirmRemoveBook(mockBooks[0]);

        expect(component.bookToRemoveR()).toBe(mockBooks[0]);
        expect(component.showDeleteBookDialogR()).toBe(true);
    });

    it('should remove book', () => {
        component.confirmRemoveBook(mockBooks[0]);
        component.removeBook();

        expect(bookService.removeBookFromList).toHaveBeenCalledWith('1', '1');
        expect(component.showDeleteBookDialogR()).toBe(false);
        expect(component.bookToRemoveR()).toBeNull();
    });

    it('should cancel remove book', () => {
        component.confirmRemoveBook(mockBooks[0]);
        component.cancelRemoveBook();

        expect(component.showDeleteBookDialogR()).toBe(false);
        expect(component.bookToRemoveR()).toBeNull();
    });

    it('should confirm delete list', () => {
        component.confirmDeleteList();
        expect(component.showDeleteListDialogR()).toBe(true);
    });

    it('should delete list', () => {
        const closedSpy = jest.fn();
        component.closed.subscribe(closedSpy);

        component.deleteList();

        expect(bookService.deleteBookList).toHaveBeenCalledWith('1');
        expect(component.showDeleteListDialogR()).toBe(false);
        expect(closedSpy).toHaveBeenCalled();
    });

    it('should cancel delete list', () => {
        component.confirmDeleteList();
        component.cancelDeleteList();

        expect(component.showDeleteListDialogR()).toBe(false);
    });

    it('should close dialog', () => {
        const closedSpy = jest.fn();
        component.closed.subscribe(closedSpy);

        component.close();

        expect(closedSpy).toHaveBeenCalled();
    });
});