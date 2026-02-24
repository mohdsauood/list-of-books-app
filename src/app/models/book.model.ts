export interface Book {
    id: string;
    title: string;
    author: string;
    year: number;
    createdAt: string;
}

export interface BookList {
    id: string;
    name: string;
    description: string;
    bookIds: string[];
    bookCount: number;
    createdAt: string;
}
