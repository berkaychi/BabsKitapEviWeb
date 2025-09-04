import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AdminBookService } from '../../../../../admin/core/services/admin-book.service';
import { BookService } from '../../../../../core/services/book.service';
import {
  AssignmentConfig,
  AssignmentType,
  BookAssignmentResult,
  AssignmentFilter,
} from '../models/assignment-config.interface';
import {
  Book,
  SearchBookQuery,
  PagedResponse,
} from '../../../../../core/models/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookAssignmentService {
  constructor(
    private adminBookService: AdminBookService,
    private bookService: BookService
  ) {}

  searchBooks(
    config: AssignmentConfig,
    filter: AssignmentFilter
  ): Observable<Book[]> {
    const query: SearchBookQuery = {
      pageNumber: 1,
      pageSize: 20,
      searchTerm: filter.searchTerm,
    };

    return this.bookService.searchBooks(query).pipe(
      map((response: PagedResponse<Book>) => {
        let books = response.items;

        if (filter.excludeAssignedToTarget) {
          if (config.type === 'publisher') {
            books = books.filter((book: Book) => {
              return !book.publishers || book.publishers.length === 0;
            });
          } else {
            books = books.filter((book: Book) => {
              return !this.isBookAssignedToTarget(book, config);
            });
          }
        }

        return books;
      }),
      catchError((error) => {
        console.error('Kitap arama hatası:', error);
        return of([]);
      })
    );
  }

  assignBooksToTarget(
    bookIds: number[],
    config: AssignmentConfig
  ): Observable<BookAssignmentResult[]> {
    console.log(
      `assignBooksToTarget called with bookIds:`,
      bookIds,
      `config:`,
      config
    );

    if (bookIds.length === 0) {
      console.log('No book IDs provided, returning empty array');
      return of([]);
    }

    const assignmentRequests = bookIds.map((bookId) =>
      this.assignSingleBookToTarget(bookId, config)
    );

    console.log(`Created ${assignmentRequests.length} assignment requests`);
    return forkJoin(assignmentRequests);
  }

  private assignSingleBookToTarget(
    bookId: number,
    config: AssignmentConfig
  ): Observable<BookAssignmentResult> {
    console.log(
      `Starting book assignment for book ${bookId} to ${config.type} ${config.targetId}`
    );

    return this.bookService.getBookById(bookId).pipe(
      switchMap((book: Book) => {
        console.log(`Retrieved book ${bookId}:`, book);
        const updatedIds = this.getUpdatedIds(book, config);
        console.log(`Updated IDs for ${config.type}:`, updatedIds);

        const requestBody = {
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          publishedDate: book.publishedDate,
          description: book.description,
          stockQuantity: book.stockQuantity,
          price: book.price,
          categoryIds:
            config.type === 'category'
              ? updatedIds
              : book.categories?.map((c: any) => c.id) || [],
          publisherIds:
            config.type === 'publisher'
              ? updatedIds
              : book.publishers?.map((p: any) => p.id) || [],
        };

        let assignmentRequest: Observable<Book>;

        if (config.type === 'publisher') {
          console.log(`Using specific publisher endpoint for book ${bookId}`);
          assignmentRequest = this.adminBookService.updateBookPublisher(
            book.id,
            updatedIds
          );
        } else if (config.type === 'category') {
          console.log(`Using specific category endpoint for book ${bookId}`);
          assignmentRequest = this.adminBookService.updateBookCategories(
            book.id,
            updatedIds
          );
        } else {
          console.log(`Using generic update endpoint for book ${bookId}`);
          assignmentRequest = this.adminBookService.updateBook(
            book.id,
            requestBody
          );
        }

        return assignmentRequest.pipe(
          map((updatedBook) => {
            console.log(`Successfully updated book ${bookId}:`, updatedBook);
            return {
              bookId: book.id,
              assignmentType: config.type,
              targetId: config.targetId,
              success: true,
            };
          }),
          catchError((error) => {
            console.error(`Kitap atama hatası (${bookId}):`, error);
            return of({
              bookId: book.id,
              assignmentType: config.type,
              targetId: config.targetId,
              success: false,
              message: error.message || 'Kitap atama başarısız',
            });
          })
        );
      }),
      catchError((error) => {
        console.error(`Kitap bilgisi alınamadı (${bookId}):`, error);
        return of({
          bookId: bookId,
          assignmentType: config.type,
          targetId: config.targetId,
          success: false,
          message: 'Kitap bilgisi alınamadı',
        });
      })
    );
  }

  removeBookFromTarget(
    book: Book,
    config: AssignmentConfig
  ): Observable<BookAssignmentResult> {
    const updatedIds = this.getRemovedIds(book, config);

    let removalRequest: Observable<Book>;

    if (config.type === 'publisher') {
      console.log(
        `Using specific publisher endpoint to remove book ${book.id}`
      );
      removalRequest = this.adminBookService.updateBookPublisher(
        book.id,
        updatedIds
      );
    } else if (config.type === 'category') {
      console.log(`Using specific category endpoint to remove book ${book.id}`);
      removalRequest = this.adminBookService.updateBookCategories(
        book.id,
        updatedIds
      );
    } else {
      console.log(`Using generic update endpoint to remove book ${book.id}`);
      removalRequest = this.adminBookService.updateBook(book.id, {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publishedDate: book.publishedDate,
        description: book.description,
        stockQuantity: book.stockQuantity,
        price: book.price,
        categoryIds:
          config.type === 'category'
            ? updatedIds
            : book.categories?.map((c: any) => c.id) || [],
        publisherIds:
          config.type === 'publisher'
            ? updatedIds
            : book.publishers?.map((p: any) => p.id) || [],
      });
    }

    return removalRequest.pipe(
      map((updatedBook) => ({
        bookId: book.id,
        assignmentType: config.type,
        targetId: config.targetId,
        success: true,
      })),
      catchError((error) => {
        console.error(`Kitap çıkarma hatası (${book.id}):`, error);
        return of({
          bookId: book.id,
          assignmentType: config.type,
          targetId: config.targetId,
          success: false,
          message: error.message || 'Kitap çıkarma başarısız',
        });
      })
    );
  }

  private isBookAssignedToTarget(
    book: Book,
    config: AssignmentConfig
  ): boolean {
    switch (config.type) {
      case 'category':
        return book.categories.some((cat: any) => cat.id === config.targetId);
      case 'publisher':
        return book.publishers.some((pub: any) => pub.id === config.targetId);
      default:
        return false;
    }
  }

  private getUpdatedIds(book: Book, config: AssignmentConfig): number[] {
    switch (config.type) {
      case 'category':
        const currentCategoryIds = book.categories?.map((c: any) => c.id) || [];
        if (!currentCategoryIds.includes(config.targetId)) {
          return [...currentCategoryIds, config.targetId];
        }
        return currentCategoryIds;
      case 'publisher':
        const currentPublisherIds =
          book.publishers?.map((p: any) => p.id) || [];
        if (!currentPublisherIds.includes(config.targetId)) {
          return [...currentPublisherIds, config.targetId];
        }
        return currentPublisherIds;
      default:
        return [];
    }
  }

  private getRemovedIds(book: Book, config: AssignmentConfig): number[] {
    switch (config.type) {
      case 'category':
        return (book.categories || [])
          .filter((cat: any) => cat.id !== config.targetId)
          .map((cat: any) => cat.id);
      case 'publisher':
        return (book.publishers || [])
          .filter((pub: any) => pub.id !== config.targetId)
          .map((pub: any) => pub.id);
      default:
        return [];
    }
  }

  getBooksByTarget(
    targetId: number,
    type: AssignmentType,
    query: { pageNumber: number; pageSize: number }
  ): Observable<Book[]> {
    switch (type) {
      case 'category':
        return this.bookService.getBooksByCategory(targetId, query);
      case 'publisher':
        return this.bookService.getBooksByPublisher(targetId, query);
      default:
        return of([]);
    }
  }
}
