import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { BookService } from './book.service';
import { Book, BookList } from '../models/book.model';
import { environment } from '../../environments/environment';

describe('BookService', () => {
    let service: BookService;
    let httpMock: HttpTestingController;

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

    const mockBookLists: BookList[] = [
        {
            id: '1',
            name: 'Test List 1',
            description: 'Test Description',
            bookIds: ['1'],
            bookCount: 1,
            createdAt: '2024-02-23'
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                BookService,
                provideHttpClient(),
                provideHttpClientTesting(),
                provideZonelessChangeDetection()
            ]
        });

        service = TestBed.inject(BookService);
        httpMock = TestBed.inject(HttpTestingController);

        // Handle initial loadAll() requests
        const booksReq = httpMock.expectOne(`${environment.apiUrl}/books/`);
        expect(booksReq.request.method).toBe('GET');
        booksReq.flush(mockBooks);

        const listsReq = httpMock.expectOne(`${environment.apiUrl}/lists/`);
        expect(listsReq.request.method).toBe('GET');
        listsReq.flush(mockBookLists);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should load books and lists on initialization', () => {
        expect(service.books()).toEqual(mockBooks);
        expect(service.bookLists()).toEqual(mockBookLists);
        expect(service.loading()).toBe(false);
        expect(service.error()).toBeNull();
    });

    it('should get book by id', () => {
        const book = service.getBookById('1');
        expect(book).toEqual(mockBooks[0]);
    });

    it('should return undefined for non-existent book id', () => {
        const book = service.getBookById('999');
        expect(book).toBeUndefined();
    });

    it('should add a new book', () => {
        const newBook: Book = {
            id: '3',
            title: 'New Book',
            author: 'New Author',
            year: 2024,
            createdAt: '2024-02-23'
        };

        service.addBook('New Book', 'New Author', 2024).subscribe(book => {
            expect(book).toEqual(newBook);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/books/`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ title: 'New Book', author: 'New Author', year: 2024 });
        req.flush(newBook);

        expect(service.books()).toContain(newBook);
    });

    it('should delete a book', () => {
        service.deleteBook('1');

        const req = httpMock.expectOne(`${environment.apiUrl}/books/1/`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});

        expect(service.books()).not.toContain(mockBooks[0]);
    });

    it('should get book list by id', () => {
        const list = service.getBookListById('1');
        expect(list).toEqual(mockBookLists[0]);
    });

    it('should return undefined for non-existent list id', () => {
        const list = service.getBookListById('999');
        expect(list).toBeUndefined();
    });

    it('should get books for a list', () => {
        const books = service.getBooksForList('1');
        expect(books).toEqual([mockBooks[0]]);
    });

    it('should return empty array for non-existent list', () => {
        const books = service.getBooksForList('999');
        expect(books).toEqual([]);
    });

    it('should get books not in a list', () => {
        const books = service.getBooksNotInList('1');
        expect(books).toEqual([mockBooks[1]]);
    });

    it('should create a new book list', () => {
        const newList: BookList = {
            id: '2',
            name: 'New List',
            description: 'New Description',
            bookIds: ['1', '2'],
            bookCount: 2,
            createdAt: '2024-02-23'
        };

        service.createBookList('New List', 'New Description', ['1', '2']);

        const req = httpMock.expectOne(`${environment.apiUrl}/lists/`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
            name: 'New List',
            description: 'New Description',
            bookIds: ['1', '2']
        });
        req.flush(newList);

        expect(service.bookLists()).toContain(newList);
    });

    it('should update a book list', () => {
        const updatedList: BookList = {
            ...mockBookLists[0],
            name: 'Updated List',
            description: 'Updated Description'
        };

        service.updateBookList('1', 'Updated List', 'Updated Description');

        const req = httpMock.expectOne(`${environment.apiUrl}/lists/1/`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual({
            name: 'Updated List',
            description: 'Updated Description'
        });
        req.flush(updatedList);

        expect(service.bookLists()[0]).toEqual(updatedList);
    });

    it('should delete a book list', () => {
        service.deleteBookList('1');

        const deleteReq = httpMock.expectOne(`${environment.apiUrl}/lists/1/`);
        expect(deleteReq.request.method).toBe('DELETE');
        deleteReq.flush({});

        const refreshReq = httpMock.expectOne(`${environment.apiUrl}/books/`);
        expect(refreshReq.request.method).toBe('GET');
        refreshReq.flush(mockBooks);

        expect(service.bookLists()).not.toContain(mockBookLists[0]);
    });

    it('should add book to list', () => {
        service.addBookToList('1', '2');

        const req = httpMock.expectOne(`${environment.apiUrl}/lists/1/books/`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ bookId: '2' });
        req.flush({});

        const updatedList = service.bookLists().find(l => l.id === '1');
        expect(updatedList?.bookIds).toContain('2');
    });

    it('should remove book from list', () => {
        service.removeBookFromList('1', '1');

        const deleteReq = httpMock.expectOne(`${environment.apiUrl}/lists/1/books/1/`);
        expect(deleteReq.request.method).toBe('DELETE');
        deleteReq.flush({});

        const refreshReq = httpMock.expectOne(`${environment.apiUrl}/books/`);
        expect(refreshReq.request.method).toBe('GET');
        refreshReq.flush(mockBooks);

        const updatedList = service.bookLists().find(l => l.id === '1');
        expect(updatedList?.bookIds).not.toContain('1');
    });

    it('should handle error when loading books', () => {
        // Reset TestBed for a fresh test
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [
                BookService,
                provideHttpClient(),
                provideHttpClientTesting(),
                provideZonelessChangeDetection()
            ]
        });

        const newService = TestBed.inject(BookService);
        const newHttpMock = TestBed.inject(HttpTestingController);

        const booksReq = newHttpMock.expectOne(`${environment.apiUrl}/books/`);
        booksReq.error(new ProgressEvent('error'));

        const listsReq = newHttpMock.expectOne(`${environment.apiUrl}/lists/`);
        listsReq.flush(mockBookLists);

        expect(newService.error()).toBe('Failed to load books');

        newHttpMock.verify();
    });

    it('should handle error when loading lists', () => {
        // Reset TestBed for a fresh test
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [
                BookService,
                provideHttpClient(),
                provideHttpClientTesting(),
                provideZonelessChangeDetection()
            ]
        });

        const newService = TestBed.inject(BookService);
        const newHttpMock = TestBed.inject(HttpTestingController);

        const booksReq = newHttpMock.expectOne(`${environment.apiUrl}/books/`);
        booksReq.flush(mockBooks);

        const listsReq = newHttpMock.expectOne(`${environment.apiUrl}/lists/`);
        listsReq.error(new ProgressEvent('error'));

        expect(newService.error()).toBe('Failed to load lists');
        expect(newService.loading()).toBe(false);

        newHttpMock.verify();
    });
});