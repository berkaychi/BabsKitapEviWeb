import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UpdateUserRequest } from '../../../core/models/user.model';
import { ApiResponse } from '../../../core/models/api-response.model';

export interface UpdateUserRoleRequest {
  role: 'Admin' | 'User';
}

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  private readonly apiUrl = `${environment.apiUrl}/api/Users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(
          response.errors?.join(', ') || 'Kullanıcılar alınamadı.'
        );
      })
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(
          response.errors?.join(', ') || 'Kullanıcı detayı alınamadı.'
        );
      })
    );
  }

  updateUser(id: string, request: UpdateUserRequest): Observable<User> {
    return this.http
      .put<ApiResponse<User>>(`${this.apiUrl}/${id}`, request)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Kullanıcı güncellenemedi.'
          );
        })
      );
  }

  updateUserRole(id: string, request: UpdateUserRoleRequest): Observable<User> {
    return this.http
      .put<ApiResponse<User>>(`${this.apiUrl}/${id}/role`, request)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Kullanıcı rolü güncellenemedi.'
          );
        })
      );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response.isSuccess) {
          return;
        }
        throw new Error(response.errors?.join(', ') || 'Kullanıcı silinemedi.');
      })
    );
  }
}
