import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, switchMap, tap } from 'rxjs';
import { Book, BookList } from '../models/book.model';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class BookService {
    private readonly http = inject(HttpClient);

    private readonly _books = signal<Book[]>([]);
    private readonly _bookLists = signal<BookList[]>([]);
    private readonly _loading = signal(false);
    private readonly _error = signal<string | null>(null);

    readonly books = this._books.asReadonly();
    readonly bookLists = this._bookLists.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    constructor() {
        this.loadAll();
    }

    private loadAll(): void {
        this._loading.set(true);
        this._error.set(null);

        forkJoin({
            books: this.http.get<Book[]>(`${API_URL}/books/`),
            lists: this.http.get<BookList[]>(`${API_URL}/lists/`),
        }).subscribe({
            next: ({ books, lists }) => {
                this._books.set(books);
                this._bookLists.set(lists);
                this._loading.set(false);
            },
            error: () => {
                this._error.set('Failed to load data');
                this._loading.set(false);
            },
        });
    }

    // ──────────────── Book operations ────────────────

    getBookById(id: string): Book | undefined {
        return this._books().find(b => b.id === id);
    }

    /** Returns an Observable<Book> because the caller needs the server-assigned ID */
    addBook(title: string, author: string, year: number): Observable<Book> {
        return this.http.post<Book>(`${API_URL}/books/`, { title, author, year }).pipe(
            tap(book => this._books.update(books => [...books, book])),
        );
    }

    deleteBook(id: string): void {
        this.http.delete(`${API_URL}/books/${id}/`).subscribe({
            next: () => {
                this._books.update(books => books.filter(b => b.id !== id));
                this._bookLists.update(lists =>
                    lists.map(list => ({
                        ...list,
                        bookIds: list.bookIds.filter(bid => bid !== id),
                    })),
                );
            },
            error: () => this._error.set('Failed to delete book'),
        });
    }

    // ──────────────── List operations ────────────────

    getBookListById(id: string): BookList | undefined {
        return this._bookLists().find(l => l.id === id);
    }

    getBooksForList(listId: string): Book[] {
        const list = this.getBookListById(listId);
        if (!list) return [];
        return list.bookIds
            .map((id: string) => this.getBookById(id))
            .filter((b): b is Book => b !== undefined);
    }

    getBooksNotInList(listId: string): Book[] {
        const list = this.getBookListById(listId);
        if (!list) return this._books();
        return this._books().filter(b => !list.bookIds.includes(b.id));
    }

    createBookList(name: string, description: string, bookIds: string[]): void {
        this.http
            .post<BookList>(`${API_URL}/lists/`, { name, description, bookIds })
            .subscribe({
                next: (list) => this._bookLists.update(lists => [...lists, list]),
                error: () => this._error.set('Failed to create list'),
            });
    }

    updateBookList(id: string, name: string, description: string): void {
        this.http
            .put<BookList>(`${API_URL}/lists/${id}/`, { name, description })
            .subscribe({
                next: (updated) =>
                    this._bookLists.update(lists =>
                        lists.map(l => (l.id === id ? updated : l)),
                    ),
                error: () => this._error.set('Failed to update list'),
            });
    }

    deleteBookList(id: string): void {
        this.http.delete(`${API_URL}/lists/${id}/`).pipe(
            switchMap(() => this.http.get<Book[]>(`${API_URL}/books/`)),
        ).subscribe({
            next: (books) => {
                this._bookLists.update(lists => lists.filter(l => l.id !== id));
                this._books.set(books);
            },
            error: () => this._error.set('Failed to delete list'),
        });
    }

    addBookToList(listId: string, bookId: string): void {
        this.http
            .post(`${API_URL}/lists/${listId}/books/`, { bookId })
            .subscribe({
                next: () =>
                    this._bookLists.update(lists =>
                        lists.map(list =>
                            list.id === listId && !list.bookIds.includes(bookId)
                                ? { ...list, bookIds: [...list.bookIds, bookId] }
                                : list,
                        ),
                    ),
                error: () => this._error.set('Failed to add book to list'),
            });
    }

    removeBookFromList(listId: string, bookId: string): void {
        this.http.delete(`${API_URL}/lists/${listId}/books/${bookId}/`).pipe(
            switchMap(() => this.http.get<Book[]>(`${API_URL}/books/`)),
        ).subscribe({
            next: (books) => {
                this._bookLists.update(lists =>
                    lists.map(list =>
                        list.id === listId
                            ? { ...list, bookIds: list.bookIds.filter(bid => bid !== bookId) }
                            : list,
                    ),
                );
                this._books.set(books);
            },
            error: () => this._error.set('Failed to remove book from list'),
        });
    }
}
