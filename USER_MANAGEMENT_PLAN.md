# User Management Integration Plan

## Current Architecture Analysis

### Existing Structure
- **Books Management**: Well-organized with separate services for admin and client operations
- **User Management**: Basic user operations exist but no admin-specific functionality
- **Pattern**: Admin features use dedicated services and follow consistent structure

### Current User-Related Files
- `src/app/core/services/user.service.ts` - Basic user operations
- `src/app/core/services/auth.service.ts` - Authentication
- `src/app/core/models/user.model.ts` - User interfaces

## Proposed User Management Architecture

### 1. Enhanced User Service (`src/app/core/services/user.service.ts`)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChangePasswordRequest,
  UpdateUserRequest,
  User,
  UserQuery,
  PagedResponse,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  // Existing methods
  me(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateProfile(request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, request);
  }

  deleteProfile(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/me`);
  }

  changePassword(
    request: ChangePasswordRequest
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/change-password`,
      request
    );
  }

  // NEW: User listing for client-side operations
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  updateUserProfile(request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, request);
  }
}
```

### 2. Admin User Service (`src/app/admin/core/services/admin-user.service.ts`)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserQuery,
  PagedResponse,
} from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  private readonly apiUrl = `${environment.apiUrl}/api/admin/users`;

  constructor(private http: HttpClient) {}

  // Get all users with pagination and filtering
  getUsers(query: UserQuery): Observable<PagedResponse<User>> {
    let params = new HttpParams();
    params = params.set('pageNumber', (query.pageNumber || 1).toString());
    params = params.set('pageSize', (query.pageSize || 10).toString());

    if (query.searchTerm) {
      params = params.set('searchTerm', query.searchTerm);
    }
    if (query.role) {
      params = params.set('role', query.role);
    }
    if (query.isActive !== undefined) {
      params = params.set('isActive', query.isActive.toString());
    }

    return this.http.get<PagedResponse<User>>(this.apiUrl, { params });
  }

  // Get single user by ID
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Create new user
  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, request);
  }

  // Update user
  updateUser(id: string, request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, request);
  }

  // Delete user
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Change user role
  changeUserRole(id: string, role: 'user' | 'admin'): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/role`, { role });
  }

  // Activate/Deactivate user
  toggleUserStatus(id: string, isActive: boolean): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/status`, { isActive });
  }

  // Reset user password (admin action)
  resetUserPassword(id: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reset-password`, { newPassword });
  }

  // Get user statistics
  getUserStats(): Observable<{
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    newUsersThisMonth: number;
  }> {
    return this.http.get<{
      totalUsers: number;
      activeUsers: number;
      adminUsers: number;
      newUsersThisMonth: number;
    }>(`${this.apiUrl}/stats`);
  }
}
```

### 3. Enhanced User Models (`src/app/core/models/user.model.ts`)

```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'User' | 'Admin';
  createdAt: string;
  isActive?: boolean;
  lastLoginAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
}

export interface UserQuery {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface UserResponse {
  user: User;
}
```

### 4. Admin User List Component (`src/app/admin/features/users/user-list/user-list.component.ts`)

```typescript
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { User, PagedResponse, UserQuery } from '../../../../core/models/user.model';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading = false;
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  selectedRole = '';
  selectedStatus = '';
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private adminUserService: AdminUserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers() {
    this.loading = true;
    const query: UserQuery = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      role: this.selectedRole || undefined,
      isActive: this.selectedStatus ? this.selectedStatus === 'active' : undefined,
    };

    this.adminUserService.getUsers(query).subscribe({
      next: (response: PagedResponse<User>) => {
        this.users = response.items;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

