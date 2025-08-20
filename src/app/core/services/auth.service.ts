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
} from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';
import { AuthResponse, UserInfo } from '../models/auth-response.model';

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
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.handleAuthSuccess(response);
        }),
        catchError((err) => {
          throw err;
        }),
        tap(() => this.loadingSubject.next(false))
      );
  }

  register(userData: RegisterRequest): Observable<any> {
    this.loadingSubject.next(true);

    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      catchError((err) => {
        throw err;
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
      .post<{ accessToken: string; refreshToken: string }>(
        `${this.apiUrl}/refresh`,
        { refreshToken }
      )
      .pipe(
        tap({
          next: (res) => {
            if (res?.accessToken && res?.refreshToken) {
              localStorage.setItem('accessToken', res.accessToken);
              localStorage.setItem('refreshToken', res.refreshToken);
              this.refreshSubject.next(true);
            } else {
              this.refreshSubject.next(false);
              this.logout();
            }
          },
          error: () => {
            this.refreshSubject.next(false);
            this.logout();
          },
        }),
        switchMap((res) => of(!!res?.accessToken)),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
  }
}
