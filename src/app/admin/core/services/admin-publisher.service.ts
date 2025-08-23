import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreatePublisherRequest,
  Publisher,
} from '../../../core/models/publisher.model';

@Injectable({
  providedIn: 'root',
})
export class AdminPublisherService {
  private readonly apiUrl = `${environment.apiUrl}/api/publishers`;
  constructor(private http: HttpClient) {}

  createPublisher(request: CreatePublisherRequest): Observable<Publisher> {
    return this.http.post<Publisher>(`${this.apiUrl}`, request);
  }

  updatePublisher(request: Publisher): Observable<Publisher> {
    return this.http.put<Publisher>(`${this.apiUrl}/${request.id}`, {
      name: request.name,
    });
  }

  deletePublisher(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
