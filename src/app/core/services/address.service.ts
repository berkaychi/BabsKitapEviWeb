import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  Address,
  AddressResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
} from '../models/address.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private readonly apiUrl = `${environment.apiUrl}/api/address`;

  constructor(private http: HttpClient) {}

  getMyAddresses(): Observable<Address[]> {
    return this.http.get<ApiResponse<Address[]>>(`${this.apiUrl}/me`).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(response.errors?.join(', ') || 'Adresler alınamadı.');
      })
    );
  }

  getAddress(id: number): Observable<Address> {
    return this.http.get<ApiResponse<Address>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(
          response.errors?.join(', ') || 'Adres detayı alınamadı.'
        );
      })
    );
  }

  createAddress(request: CreateAddressRequest): Observable<Address> {
    return this.http.post<ApiResponse<Address>>(`${this.apiUrl}`, request).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(response.errors?.join(', ') || 'Adres oluşturulamadı.');
      })
    );
  }

  updateAddress(
    id: number,
    request: UpdateAddressRequest
  ): Observable<Address> {
    return this.http
      .put<ApiResponse<Address>>(`${this.apiUrl}/${id}`, request)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Adres güncellenemedi.'
          );
        })
      );
  }

  deleteAddress(id: number): Observable<AddressResponse> {
    return this.http
      .delete<ApiResponse<AddressResponse>>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(response.errors?.join(', ') || 'Adres silinemedi.');
        })
      );
  }

  setDefaultAddress(id: number): Observable<AddressResponse> {
    return this.http
      .post<ApiResponse<AddressResponse>>(
        `${this.apiUrl}/${id}/set-default`,
        {}
      )
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Varsayılan adres ayarlanamadı.'
          );
        })
      );
  }
}
