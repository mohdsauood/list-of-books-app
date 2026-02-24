import { Component, inject, signal } from '@angular/core';
import { BookService } from '../../services/book.service';
import { BookCard } from '../../components/book-card/book-card';
import { CreateListDialog } from '../../components/create-list-dialog/create-list-dialog';
import { EditListDialog } from '../../components/edit-list-dialog/edit-list-dialog';
import { BookList } from '../../models/book.model';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss',
    imports: [BookCard, CreateListDialog, EditListDialog],
})
export class Dashboard {
    private readonly bookService = inject(BookService);

    protected readonly books = this.bookService.books;
    protected readonly bookLists = this.bookService.bookLists;
    protected readonly loading = this.bookService.loading;
    protected readonly error = this.bookService.error;

    protected readonly showCreateDialog = signal(false);
    protected readonly selectedList = signal<BookList | null>(null);

    openCreateDialog(): void {
        this.showCreateDialog.set(true);
    }

    closeCreateDialog(): void {
        this.showCreateDialog.set(false);
    }

    openListDialog(list: BookList): void {
        this.selectedList.set(list);
    }

    closeListDialog(): void {
        this.selectedList.set(null);
    }

    getBookCount(listId: string): number {
        return this.bookService.getBooksForList(listId).length;
    }
}
