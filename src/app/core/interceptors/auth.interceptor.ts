import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  const isRefreshCall = req.url.includes('/api/auth/refresh');
  const isRetried = req.headers.has('X-Retried-Once');

  let authReq = req;
  const token = authService.getAccessToken();
  if (token && !isRefreshCall) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isRefreshCall &&
        !isRetried
      ) {
        return authService.refreshAccessToken().pipe(
          switchMap((ok) => {
            if (!ok) {
              authService.logout();
              return throwError(() => error);
            }
            const newToken = authService.getAccessToken();
            const retried = newToken
              ? authReq.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`,
                    'X-Retried-Once': 'true',
                  },
                })
              : authReq.clone({
                  setHeaders: { 'X-Retried-Once': 'true' },
                });

            return next(retried);
          }),
          catchError((refreshErr) => {
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
