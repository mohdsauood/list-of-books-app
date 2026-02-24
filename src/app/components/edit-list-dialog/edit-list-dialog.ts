import { Component, computed, effect, inject, input, output, signal, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BookService } from '../../services/book.service';
import { Book, BookList } from '../../models/book.model';
import { BookCard } from '../book-card/book-card';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
    selector: 'app-edit-list-dialog',
    templateUrl: './edit-list-dialog.html',
    styleUrl: './edit-list-dialog.scss',
    imports: [BookCard, ConfirmDialog],
})
export class EditListDialog implements OnDestroy {
    private readonly bookService = inject(BookService);
    private readonly document = inject(DOCUMENT);

    readonly list = input.required<BookList>();
    readonly books = input.required<Book[]>();
    readonly closed = output<void>();

    // Signal-based form state
    private readonly listName = signal('');
    private readonly listDescription = signal('');
    private readonly newBookTitle = signal('');
    private readonly newBookAuthor = signal('');
    private readonly newBookYear = signal(new Date().getFullYear());

    private readonly showBookPicker = signal(false);
    private readonly showAddBookForm = signal(false);
    private readonly showDeleteBookDialog = signal(false);
    private readonly bookToRemove = signal<Book | null>(null);
    private readonly showDeleteListDialog = signal(false);

    // Initialize form values when list changes
    constructor() {
        this.document.body.classList.add('dialog-open');

        effect(() => {
            const list = this.list();
            this.listName.set(list.name);
            this.listDescription.set(list.description);
        });
    }

    ngOnDestroy(): void {
        this.document.body.classList.remove('dialog-open');
    }

    // Computed validation
    protected readonly isFormValid = computed(() => {
        return this.listName().trim().length > 0;
    });

    protected readonly isNewBookValid = computed(() => {
        return this.newBookTitle().trim().length > 0 && this.newBookAuthor().trim().length > 0;
    });

    protected readonly booksInList = computed(() => this.bookService.getBooksForList(this.list().id));
    protected readonly availableBooks = computed(() => {
        const inList = this.booksInList();
        return this.books().filter(b => !inList.some(ib => ib.id === b.id));
    });

    protected readonly showBookPickerR = this.showBookPicker.asReadonly();
    protected readonly showAddBookFormR = this.showAddBookForm.asReadonly();
    protected readonly showDeleteBookDialogR = this.showDeleteBookDialog.asReadonly();
    protected readonly showDeleteListDialogR = this.showDeleteListDialog.asReadonly();
    protected readonly bookToRemoveR = this.bookToRemove.asReadonly();

    // Expose form values as readonly signals
    protected readonly listNameR = this.listName.asReadonly();
    protected readonly listDescriptionR = this.listDescription.asReadonly();
    protected readonly newBookTitleR = this.newBookTitle.asReadonly();
    protected readonly newBookAuthorR = this.newBookAuthor.asReadonly();
    protected readonly newBookYearR = this.newBookYear.asReadonly();

    // Helper methods for template event binding
    onNewBookTitleInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.newBookTitle.set(input.value);
    }

    onNewBookAuthorInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.newBookAuthor.set(input.value);
    }

    onNewBookYearInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.newBookYear.set(parseInt(input.value, 10));
    }

    toggleBookPicker(): void {
        this.showBookPicker.update(v => !v);
    }

    addBookToList(bookId: string): void {
        this.bookService.addBookToList(this.list().id, bookId);
    }

    toggleAddBookForm(): void {
        this.showAddBookForm.update(v => !v);
        if (!this.showAddBookForm()) {
            this.newBookTitle.set('');
            this.newBookAuthor.set('');
            this.newBookYear.set(new Date().getFullYear());
        }
    }

    addNewBookAndLink(): void {
        if (!this.isNewBookValid()) return;

        this.bookService.addBook(this.newBookTitle(), this.newBookAuthor(), this.newBookYear())
            .subscribe(book => {
                this.bookService.addBookToList(this.list().id, book.id);
                this.showAddBookForm.set(false);
                this.newBookTitle.set('');
                this.newBookAuthor.set('');
                this.newBookYear.set(new Date().getFullYear());
            });
    }

    updateList(): void {
        if (!this.isFormValid()) return;

        this.bookService.updateBookList(
            this.list().id,
            this.listName(),
            this.listDescription()
        );
        this.closed.emit();
    }

    confirmRemoveBook(book: Book): void {
        this.bookToRemove.set(book);
        this.showDeleteBookDialog.set(true);
    }

    removeBook(): void {
        const book = this.bookToRemove();
        if (book) {
            this.bookService.removeBookFromList(this.list().id, book.id);
        }
        this.showDeleteBookDialog.set(false);
        this.bookToRemove.set(null);
    }

    cancelRemoveBook(): void {
        this.showDeleteBookDialog.set(false);
        this.bookToRemove.set(null);
    }

    confirmDeleteList(): void {
        this.showDeleteListDialog.set(true);
    }

    deleteList(): void {
        this.bookService.deleteBookList(this.list().id);
        this.showDeleteListDialog.set(false);
        this.closed.emit();
    }

    cancelDeleteList(): void {
        this.showDeleteListDialog.set(false);
    }

    close(): void {
        this.closed.emit();
    }
}
