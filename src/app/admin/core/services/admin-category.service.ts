import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  Category,
  CreateCategoryRequest,
} from '../../../core/models/category.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AdminCategoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/categories`;
  constructor(private http: HttpClient) {}

  createCategory(request: CreateCategoryRequest): Observable<Category> {
    return this.http
      .post<ApiResponse<Category>>(`${this.apiUrl}`, request)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Kategori oluşturulamadı.'
          );
        })
      );
  }

  updateCategory(request: Category): Observable<Category> {
    return this.http
      .put<ApiResponse<Category>>(`${this.apiUrl}/${request.id}`, request)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Kategori güncellenemedi.'
          );
        })
      );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response.isSuccess) {
          return;
        }
        throw new Error(response.errors?.join(', ') || 'Kategori silinemedi.');
      })
    );
  }
}
