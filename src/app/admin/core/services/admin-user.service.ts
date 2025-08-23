import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UpdateUserRequest } from '../../../core/models/user.model';

export interface UpdateUserRoleRequest {
  role: 'Admin' | 'User';
}

export interface AdminUserListResponse {
  success: boolean;
  message: string;
  data: User[];
}

export interface AdminUserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface AdminMessageResponse {
  success: boolean;
  message: string;
  data: null;
}

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  private readonly apiUrl = `${environment.apiUrl}/api/Users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<AdminUserListResponse | User[]> {
    return this.http.get<AdminUserListResponse | User[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<AdminUserResponse | User> {
    return this.http.get<AdminUserResponse | User>(`${this.apiUrl}/${id}`);
  }

  updateUser(
    id: string,
    request: UpdateUserRequest
  ): Observable<AdminUserResponse | User> {
    return this.http.put<AdminUserResponse | User>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  updateUserRole(
    id: string,
    request: UpdateUserRoleRequest
  ): Observable<AdminUserResponse | User> {
    return this.http.put<AdminUserResponse | User>(
      `${this.apiUrl}/${id}/role`,
      request
    );
  }

  deleteUser(id: string): Observable<AdminMessageResponse | any> {
    return this.http.delete<AdminMessageResponse | any>(`${this.apiUrl}/${id}`);
  }
}
