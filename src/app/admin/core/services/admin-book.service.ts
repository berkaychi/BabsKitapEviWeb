import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  Book,
  CreateBookRequest,
  UpdateBookRequest,
} from '../../../core/models/book.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AdminBookService {
  private readonly apiUrl = `${environment.apiUrl}/api/Books`;
  constructor(private http: HttpClient) {}

  createBook(request: CreateBookRequest): Observable<Book> {
    const formData = new FormData();

    formData.append('Title', request.title);
    formData.append('Author', request.author);
    formData.append('ISBN', request.isbn);
    formData.append('PublishedDate', request.publishedDate);
    if (request.description)
      formData.append('Description', request.description);
    formData.append('StockQuantity', request.stockQuantity.toString());
    formData.append('Price', request.price.toString());

    if (request.categoryIds) {
      request.categoryIds.forEach((id) =>
        formData.append('CategoryIds', id.toString())
      );
    }

    if (request.publisherIds) {
      request.publisherIds.forEach((id) =>
        formData.append('PublisherIds', id.toString())
      );
    }

    if (request.imageFile) {
      formData.append('ImageFile', request.imageFile);
    }

    return this.http.post<ApiResponse<Book>>(this.apiUrl, formData).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(response.errors?.join(', ') || 'Kitap oluşturulamadı.');
      })
    );
  }

  updateBook(id: number, request: UpdateBookRequest): Observable<Book> {
    return this.http
      .put<ApiResponse<Book>>(`${this.apiUrl}/${id}`, request)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Kitap güncellenemedi.'
          );
        })
      );
  }

  updateBookImage(id: number, imageFile: File): Observable<Book> {
    const formData = new FormData();
    formData.append('ImageFile', imageFile);

    return this.http
      .put<ApiResponse<Book>>(`${this.apiUrl}/${id}/image`, formData)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Kitap resmi güncellenemedi.'
          );
        })
      );
  }

  updateBookPublisher(id: number, publisherIds: number[]): Observable<Book> {
    const requestBody = {
      publisherIds: publisherIds,
    };

    return this.http
      .put<ApiResponse<Book>>(`${this.apiUrl}/${id}/publisher`, requestBody)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Kitap yayınevi güncellenemedi.'
          );
        })
      );
  }

  updateBookCategories(id: number, categoryIds: number[]): Observable<Book> {
    const requestBody = {
      categoryIds: categoryIds,
    };

    return this.http
      .put<ApiResponse<Book>>(`${this.apiUrl}/${id}/categories`, requestBody)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Kitap kategorileri güncellenemedi.'
          );
        })
      );
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response.isSuccess) {
          return;
        }
        throw new Error(response.errors?.join(', ') || 'Kitap silinemedi.');
      })
    );
  }
}
