import { Component, computed, input, output } from '@angular/core';
import { Book } from '../../models/book.model';

@Component({
    selector: 'app-book-card',
    templateUrl: './book-card.html',
    styleUrl: './book-card.scss',
})
export class BookCard {
    readonly book = input.required<Book>();
    readonly showRemoveButton = input(false);
    readonly removeClick = output<void>();

    protected readonly avatarColor = computed(() => {
        const colors = ['#4390EE', '#38A169', '#805AD5', '#DD6B20', '#E53E3E', '#2D9CDB'];
        const charCode = this.book().title.charCodeAt(0);
        return colors[charCode % colors.length];
    });

    protected readonly initial = computed(() => this.book().title.charAt(0).toUpperCase());

    onRemoveClick(): void {
        this.removeClick.emit();
    }
}
