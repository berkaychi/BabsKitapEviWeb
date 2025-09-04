import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      let errorMessage = 'Bilinmeyen bir ağ hatası oluştu.';

      if (error instanceof HttpErrorResponse) {
        const apiResponse = error.error as ApiResponse<any>;
        if (
          apiResponse &&
          apiResponse.errors &&
          apiResponse.errors.length > 0
        ) {
          errorMessage = apiResponse.errors.join('\n');
        } else {
          errorMessage = `Sunucu hatası: ${error.status} - ${error.statusText}`;
        }
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};
