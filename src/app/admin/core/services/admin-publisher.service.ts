import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CreatePublisherRequest,
  Publisher,
} from '../../../core/models/publisher.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AdminPublisherService {
  private readonly apiUrl = `${environment.apiUrl}/api/publishers`;
  constructor(private http: HttpClient) {}

  createPublisher(request: CreatePublisherRequest): Observable<Publisher> {
    return this.http
      .post<ApiResponse<Publisher>>(`${this.apiUrl}`, request)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Yayınevi oluşturulamadı.'
          );
        })
      );
  }

  updatePublisher(request: Publisher): Observable<Publisher> {
    return this.http
      .put<ApiResponse<Publisher>>(`${this.apiUrl}/${request.id}`, {
        name: request.name,
      })
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Yayınevi güncellenemedi.'
          );
        })
      );
  }

  deletePublisher(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response.isSuccess) {
          return;
        }
        throw new Error(response.errors?.join(', ') || 'Yayınevi silinemedi.');
      })
    );
  }
}
