import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category } from '../models/category.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/categories`;
  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}`).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(
          response.errors?.join(', ') || 'Kategoriler alınamadı.'
        );
      })
    );
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<ApiResponse<Category>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(
          response.errors?.join(', ') || 'Kategori detayı alınamadı.'
        );
      })
    );
  }
}
