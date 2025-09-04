import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  filter,
  Observable,
  of,
  switchMap,
  take,
  tap,
  Subject,
  finalize,
  map,
} from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';
import { AuthResponse, UserInfo } from '../models/auth-response.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private isRefreshing = false;
  private refreshSubject = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {
    this.checkedStoredToken();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.loadingSubject.next(true);

    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            this.handleAuthSuccess(response.data);
            return response.data;
          }
          throw new Error(response.errors?.join(', ') || 'Giriş yapılamadı.');
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  register(userData: RegisterRequest): Observable<any> {
    this.loadingSubject.next(true);

    return this.http
      .post<ApiResponse<any>>(`${this.apiUrl}/register`, userData)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Kayıt işlemi başarısız.'
          );
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('accessToken');
    const user = this.currentUserSubject.value;
    return !!token && !!user;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  checkedStoredToken(): void {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUserSubject.next(user);
      } catch {
        this.logout();
      }
    }
  }

  private handleAuthSuccess(response: AuthResponse): void {
    const { user, accessToken, refreshToken } = response;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user as UserInfo));

    this.currentUserSubject.next(user as unknown as User);
  }

  refreshAccessToken(): Observable<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return of(false);
    }

    if (this.isRefreshing) {
      return this.refreshSubject.pipe(
        filter((v) => v !== undefined),
        take(1)
      );
    }

    this.isRefreshing = true;

    return this.http
      .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
        `${this.apiUrl}/refresh`,
        { refreshToken }
      )
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            const { accessToken, refreshToken: newRefreshToken } =
              response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            this.refreshSubject.next(true);
            return true;
          } else {
            this.refreshSubject.next(false);
            this.logout();
            return false;
          }
        }),
        catchError(() => {
          this.refreshSubject.next(false);
          this.logout();
          return of(false);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return !!(user && (user.role === 'admin' || user.role === 'Admin'));
  }

  canAccessAdmin(): boolean {
    return this.isLoggedIn() && this.isAdmin();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return !!(user && user.role.toLowerCase() === role.toLowerCase());
  }
}
