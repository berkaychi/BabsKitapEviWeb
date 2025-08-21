import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  Category,
  CreateCategoryRequest,
} from '../../../core/models/category.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminCategoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/categories`;
  constructor(private http: HttpClient) {}

  createCategory(request: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}`, request);
  }

  updateCategory(request: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${request.id}`, request);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
