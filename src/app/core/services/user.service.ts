import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ChangePasswordRequest,
  UpdateUserRequest,
  User,
} from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  me(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(
          response.errors?.join(', ') || 'Kullanıcı bilgileri alınamadı.'
        );
      })
    );
  }

  updateProfile(request: UpdateUserRequest): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/me`, request).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(
          response.errors?.join(', ') || 'Profil güncellenemedi.'
        );
      })
    );
  }

  deleteProfile(): Observable<{ message: string }> {
    return this.http
      .delete<ApiResponse<{ message: string }>>(`${this.apiUrl}/me`)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(response.errors?.join(', ') || 'Profil silinemedi.');
        })
      );
  }

  changePassword(
    request: ChangePasswordRequest
  ): Observable<{ message: string }> {
    return this.http
      .post<ApiResponse<{ message: string }>>(
        `${this.apiUrl}/change-password`,
        request
      )
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Şifre değiştirilemedi.'
          );
        })
      );
  }
}
