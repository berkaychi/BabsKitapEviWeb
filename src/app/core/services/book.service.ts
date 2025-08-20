import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Book,
  BookQuery,
  BookSortBy,
  PagedResponse,
  SearchBookQuery,
  SortDirection,
} from '../models/book.model';

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
    return this.http.get<Book[]>(this.apiUrl, { params });
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  getBooksByCategory(categoryId: number, query: BookQuery): Observable<Book[]> {
    const params = new HttpParams()
      .set('categoryId', categoryId)
      .set('pageNumber', query.pageNumber)
      .set('pageSize', query.pageSize);
    return this.http.get<Book[]>(`${this.apiUrl}/category/${categoryId}`, {
      params,
    });
  }

  getBooksByPublisher(publisherId: number, query: BookQuery): Observable<Book[]>{
    const params = new HttpParams()
      .set('publisherId', publisherId)
      .set('pageNumber', query.pageNumber)
      .set('pageSize', query.pageSize);
    return this.http.get<Book[]>(`${this.apiUrl}/publisher/${publisherId}`, {
      params,
    });
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

    return this.http.get<PagedResponse<Book>>(`${this.apiUrl}/search`, {
      params,
    });
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
}
