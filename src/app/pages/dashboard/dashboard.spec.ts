import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { Dashboard } from './dashboard';
import { BookService } from '../../services/book.service';
import { Book, BookList } from '../../models/book.model';

describe('Dashboard', () => {
    let component: Dashboard;
    let fixture: ComponentFixture<Dashboard>;
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

    const mockBookLists: BookList[] = [
        {
            id: '1',
            name: 'Test List 1',
            description: 'Test Description 1',
            bookIds: ['1'],
            bookCount: 1,
            createdAt: '2024-02-23'
        },
        {
            id: '2',
            name: 'Test List 2',
            description: 'Test Description 2',
            bookIds: ['1', '2'],
            bookCount: 2,
            createdAt: '2024-02-23'
        }
    ];

    beforeEach(async () => {
        const bookServiceMock = {
            books: signal(mockBooks).asReadonly(),
            bookLists: signal(mockBookLists).asReadonly(),
            loading: signal(false).asReadonly(),
            error: signal(null).asReadonly(),
            getBooksForList: jest.fn().mockImplementation((listId: string) => {
                const list = mockBookLists.find(l => l.id === listId);
                if (!list) return [];
                return list.bookIds.map(id => mockBooks.find(b => b.id === id)).filter(Boolean);
            })
        };

        await TestBed.configureTestingModule({
            imports: [Dashboard],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideZonelessChangeDetection(),
                { provide: BookService, useValue: bookServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(Dashboard);
        component = fixture.componentInstance;
        bookService = TestBed.inject(BookService) as jest.Mocked<BookService>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display books from service', () => {
        expect(component['books']()).toEqual(mockBooks);
    });

    it('should display book lists from service', () => {
        expect(component['bookLists']()).toEqual(mockBookLists);
    });

    it('should display loading state from service', () => {
        expect(component['loading']()).toBe(false);
    });

    it('should display error state from service', () => {
        expect(component['error']()).toBeNull();
    });

    it('should open create dialog', () => {
        expect(component['showCreateDialog']()).toBe(false);

        component.openCreateDialog();

        expect(component['showCreateDialog']()).toBe(true);
    });

    it('should close create dialog', () => {
        component.openCreateDialog();
        expect(component['showCreateDialog']()).toBe(true);

        component.closeCreateDialog();

        expect(component['showCreateDialog']()).toBe(false);
    });

    it('should open list dialog with selected list', () => {
        expect(component['selectedList']()).toBeNull();

        component.openListDialog(mockBookLists[0]);

        expect(component['selectedList']()).toBe(mockBookLists[0]);
    });

    it('should close list dialog', () => {
        component.openListDialog(mockBookLists[0]);
        expect(component['selectedList']()).toBe(mockBookLists[0]);

        component.closeListDialog();

        expect(component['selectedList']()).toBeNull();
    });

    it('should get book count for a list', () => {
        const count1 = component.getBookCount('1');
        expect(count1).toBe(1);
        expect(bookService.getBooksForList).toHaveBeenCalledWith('1');

        const count2 = component.getBookCount('2');
        expect(count2).toBe(2);
        expect(bookService.getBooksForList).toHaveBeenCalledWith('2');
    });

    it('should return 0 book count for non-existent list', () => {
        bookService.getBooksForList.mockReturnValueOnce([]);

        const count = component.getBookCount('999');
        expect(count).toBe(0);
    });

    it('should display book lists in template', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Test List 1');
        expect(compiled.textContent).toContain('Test List 2');
    });

    it('should display loading state in template', async () => {
        const loadingSignal = signal(true);
        const errorSignal = signal<string | null>(null);

        await TestBed.resetTestingModule();
        await TestBed.configureTestingModule({
            imports: [Dashboard],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideZonelessChangeDetection(),
                {
                    provide: BookService,
                    useValue: {
                        books: signal(mockBooks).asReadonly(),
                        bookLists: signal(mockBookLists).asReadonly(),
                        loading: loadingSignal.asReadonly(),
                        error: errorSignal.asReadonly(),
                        getBooksForList: jest.fn().mockReturnValue([]),
                    },
                },
            ],
        }).compileComponents();

        const loadingFixture = TestBed.createComponent(Dashboard);
        loadingFixture.detectChanges();

        const compiled = loadingFixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Loading');
    });

    it('should display error state in template', async () => {
        const loadingSignal = signal(false);
        const errorSignal = signal<string | null>('Test error message');

        await TestBed.resetTestingModule();
        await TestBed.configureTestingModule({
            imports: [Dashboard],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideZonelessChangeDetection(),
                {
                    provide: BookService,
                    useValue: {
                        books: signal(mockBooks).asReadonly(),
                        bookLists: signal(mockBookLists).asReadonly(),
                        loading: loadingSignal.asReadonly(),
                        error: errorSignal.asReadonly(),
                        getBooksForList: jest.fn().mockReturnValue([]),
                    },
                },
            ],
        }).compileComponents();

        const errorFixture = TestBed.createComponent(Dashboard);
        errorFixture.detectChanges();

        const compiled = errorFixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Test error message');
    });
});