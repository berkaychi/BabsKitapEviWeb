import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Book,
  BookQuery,
  BookSortBy,
  PagedResponse,
  SearchBookQuery,
  SortDirection,
} from '../models/book.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly apiUrl = `${environment.apiUrl}/api/Books`;

  constructor(private http: HttpClient) {}

  getBooks(query: BookQuery): Observable<Book[]> {
    const params = new HttpParams()
      .set('pageNumber', query.pageNumber)
      .set('pageSize', query.pageSize);

    return this.http.get<ApiResponse<Book[]>>(this.apiUrl, { params }).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(response.errors?.join(', ') || 'Kitaplar alınamadı.');
      })
    );
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<ApiResponse<Book>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(
          response.errors?.join(', ') || 'Kitap detayı alınamadı.'
        );
      })
    );
  }

  getBookBySlug(slug: string): Observable<Book> {
    return this.http.get<ApiResponse<Book>>(`${this.apiUrl}/slug/${slug}`).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(
          response.errors?.join(', ') || 'Kitap detayı alınamadı.'
        );
      })
    );
  }

  getBooksByCategory(categoryId: number, query: BookQuery): Observable<Book[]> {
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber)
      .set('pageSize', query.pageSize);

    params = params.set('categoryId', categoryId.toString());

    return this.http
      .get<ApiResponse<PagedResponse<Book>>>(`${this.apiUrl}/search`, {
        params,
      })
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data.items;
          }
          throw new Error(
            response.errors?.join(', ') || 'Kategori kitapları alınamadı.'
          );
        })
      );
  }

  getBooksByPublisher(
    publisherId: number,
    query: BookQuery
  ): Observable<Book[]> {
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber)
      .set('pageSize', query.pageSize);

    params = params.set('publisherId', publisherId.toString());

    return this.http
      .get<ApiResponse<PagedResponse<Book>>>(`${this.apiUrl}/search`, {
        params,
      })
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data.items;
          }
          throw new Error(
            response.errors?.join(', ') || 'Yayınevi kitapları alınamadı.'
          );
        })
      );
  }

  searchBooks(query: SearchBookQuery): Observable<PagedResponse<Book>> {
    let params = new HttpParams();
    params = params.set('pageNumber', (query.pageNumber || 1).toString());
    params = params.set('pageSize', (query.pageSize || 12).toString());

    if (query.searchTerm && query.searchTerm.trim()) {
      params = params.set('searchTerm', query.searchTerm.trim().toLowerCase());
    }

    if (query.categoryId) {
      params = params.set('categoryId', query.categoryId.toString());
    }
    if (query.publisherId) {
      params = params.set('publisherId', query.publisherId.toString());
    }

    if (query.maxPrice) {
      params = params.set('maxPrice', query.maxPrice.toString());
    }

    if (query.minPrice) {
      params = params.set('minPrice', (query.minPrice || 0).toString());
    }

    if (query.sortBy) {
      params = params.set(
        'sortBy',
        (query.sortBy || BookSortBy.PUBLISHED_DATE).toString()
      );
    }

    if (query.sortDirection) {
      params = params.set(
        'sortDirection',
        (query.sortDirection || SortDirection.DESC).toString()
      );
    }

    return this.http
      .get<ApiResponse<PagedResponse<Book>>>(`${this.apiUrl}/search`, {
        params,
      })
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Arama sonucu alınamadı.'
          );
        })
      );
  }

  getSortOptions(): Array<{ value: BookSortBy; label: string }> {
    return [
      { value: BookSortBy.TITLE, label: 'Kitap Adı' },
      { value: BookSortBy.AUTHOR, label: 'Yazar' },
      { value: BookSortBy.PUBLISHED_DATE, label: 'Yayın Tarihi' },
      { value: BookSortBy.PRICE, label: 'Fiyat' },
    ];
  }

  getSortDirectionOptions(): Array<{ value: SortDirection; label: string }> {
    return [
      { value: SortDirection.ASC, label: 'Artan' },
      { value: SortDirection.DESC, label: 'Azalan' },
    ];
  }

  uploadBookImage(bookId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http
      .post<ApiResponse<string>>(
        `${this.apiUrl}/admin/books/${bookId}/image`,
        formData
      )
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(response.errors?.join(', ') || 'Resim yüklenemedi.');
        })
      );
  }

  getLowStockBooks(): Observable<Book[]> {
    return this.http
      .get<ApiResponse<Book[]>>(`${this.apiUrl}/admin/books/low-stock`)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Düşük stok kitapları alınamadı.'
          );
        })
      );
  }

  loadBookImages(bookIds: number[]): Observable<Record<number, string>> {
    if (!bookIds || bookIds.length === 0) {
      return new Observable((subscriber) => {
        subscriber.next({});
        subscriber.complete();
      });
    }

    const uniqueBookIds = [...new Set(bookIds)];

    const requests = uniqueBookIds.map((bookId) =>
      this.getBookById(bookId).pipe(
        map((book) => ({
          bookId,
          imageUrl:
            book.imageUrl || 'https://via.placeholder.com/40x50?text=No+Image',
        })),
        map((data) => data),
        catchError(
          () =>
            new Observable((subscriber) => {
              subscriber.next({
                bookId,
                imageUrl: 'https://via.placeholder.com/40x50?text=No+Image',
              });
              subscriber.complete();
            })
        )
      )
    );

    return forkJoin(requests).pipe(
      map((results: any) => {
        const imageMap: Record<number, string> = {};
        results.forEach((result: any) => {
          imageMap[result.bookId] = result.imageUrl;
        });
        return imageMap;
      })
    );
  }

  loadBookImagesFromItems<T extends { bookId: number }>(
    items: T[]
  ): Observable<Record<number, string>> {
    if (!items || items.length === 0) {
      return new Observable((subscriber) => {
        subscriber.next({});
        subscriber.complete();
      });
    }

    const bookIds = items.map((item) => item.bookId);
    return this.loadBookImages(bookIds);
  }
}
