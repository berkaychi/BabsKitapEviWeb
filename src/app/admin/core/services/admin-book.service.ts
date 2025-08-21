import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  Book,
  CreateBookRequest,
  UpdateBookRequest,
} from '../../../core/models/book.model';
import { Observable } from 'rxjs';

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

    return this.http.post<Book>(this.apiUrl, formData);
  }

  updateBook(id: number, request: UpdateBookRequest): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, request);
  }

  updateBookImage(id: number, imageFile: File): Observable<Book> {
    const formData = new FormData();
    formData.append('ImageFile', imageFile);

    return this.http.put<Book>(`${this.apiUrl}/${id}/image`, formData);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
