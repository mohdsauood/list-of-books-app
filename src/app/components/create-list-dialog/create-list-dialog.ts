import { Component, inject, input, output, signal, computed, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

@Component({
    selector: 'app-create-list-dialog',
    templateUrl: './create-list-dialog.html',
    styleUrl: './create-list-dialog.scss',
})
export class CreateListDialog implements OnDestroy {
    private readonly bookService = inject(BookService);
    private readonly document = inject(DOCUMENT);

    readonly books = input.required<Book[]>();
    readonly closed = output<void>();
    readonly created = output<void>();

    // Signal-based form state
    protected readonly listName = signal('');
    protected readonly newBookTitle = signal('');
    protected readonly newBookAuthor = signal('');
    protected readonly selectedBookIds = signal(new Set<string>());
    protected readonly showBookPicker = signal(false);
    protected readonly showAddBookForm = signal(false);

    // Computed validation
    protected readonly isFormValid = computed(() => {
        return this.listName().trim().length > 0;
    });

    protected readonly isNewBookValid = computed(() => {
        return this.newBookTitle().trim().length > 0 && this.newBookAuthor().trim().length > 0;
    });

    protected readonly newBookYear = signal(new Date().getFullYear());
    protected readonly listDescription = signal('');

    constructor() {
        this.document.body.classList.add('dialog-open');
    }

    ngOnDestroy(): void {
        this.document.body.classList.remove('dialog-open');
    }

    onListNameInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.listName.set(input.value);
    }

    onListDescriptionInput(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement;
        this.listDescription.set(textarea.value);
    }

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

    isBookSelected(bookId: string): boolean {
        return this.selectedBookIds().has(bookId);
    }

    toggleBook(bookId: string): void {
        this.selectedBookIds.update(ids => {
            const newIds = new Set(ids);
            if (newIds.has(bookId)) {
                newIds.delete(bookId);
            } else {
                newIds.add(bookId);
            }
            return newIds;
        });
    }

    getSelectedBooks(): Book[] {
        return this.books().filter(b => this.selectedBookIds().has(b.id));
    }

    removeSelectedBook(bookId: string): void {
        this.selectedBookIds.update(ids => {
            const newIds = new Set(ids);
            newIds.delete(bookId);
            return newIds;
        });
    }

    toggleBookPicker(): void {
        this.showBookPicker.update(show => !show);
    }

    toggleAddBookForm(): void {
        this.showAddBookForm.update(show => !show);
        if (!this.showAddBookForm()) {
            this.newBookTitle.set('');
            this.newBookAuthor.set('');
            this.newBookYear.set(new Date().getFullYear());
        }
    }

    addNewBook(): void {
        if (!this.isNewBookValid()) return;

        this.bookService.addBook(this.newBookTitle(), this.newBookAuthor(), this.newBookYear())
            .subscribe(book => {
                this.selectedBookIds.update(ids => {
                    const newIds = new Set(ids);
                    newIds.add(book.id);
                    return newIds;
                });
                this.showAddBookForm.set(false);
                this.newBookTitle.set('');
                this.newBookAuthor.set('');
                this.newBookYear.set(new Date().getFullYear());
            });
    }

    createList(): void {
        if (!this.isFormValid()) return;

        this.bookService.createBookList(
            this.listName(),
            this.listDescription(),
            [...this.selectedBookIds()]
        );

        this.created.emit();
        this.closed.emit();
    }

    close(): void {
        this.closed.emit();
    }
}
