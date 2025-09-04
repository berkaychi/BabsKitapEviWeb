import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Publisher } from '../models/publisher.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class PublisherService {
  private readonly apiUrl = `${environment.apiUrl}/api/Publishers`;

  constructor(private http: HttpClient) {}

  getPublishers(): Observable<Publisher[]> {
    return this.http.get<ApiResponse<Publisher[]>>(`${this.apiUrl}`).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(
          response.errors?.join(', ') || 'Yayınevleri alınamadı.'
        );
      })
    );
  }

  getPublisherById(id: number): Observable<Publisher> {
    return this.http.get<ApiResponse<Publisher>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(
          response.errors?.join(', ') || 'Yayınevi detayı alınamadı.'
        );
      })
    );
  }
}
