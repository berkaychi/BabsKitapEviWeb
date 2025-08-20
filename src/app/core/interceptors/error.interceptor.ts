import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const backendErrors = error.error?.errors;

        const normalizedMessage =
          Array.isArray(backendErrors) && backendErrors.length > 0
            ? backendErrors.join(', ')
            : error.message;

        return throwError(() => new Error(normalizedMessage));
      }

      return throwError(() => new Error('Beklenmedik bir hata oluştu.'));
    })
  );
};
