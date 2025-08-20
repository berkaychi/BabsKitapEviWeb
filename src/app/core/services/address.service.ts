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

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private readonly apiUrl = `${environment.apiUrl}/api/address`;

  constructor(private http: HttpClient) {}

  getMyAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/me`);
  }

  getAddress(id: number): Observable<Address> {
    return this.http.get<Address>(`${this.apiUrl}/${id}`);
  }

  createAddress(request: CreateAddressRequest): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}`, request);
  }

  updateAddress(
    id: number,
    request: UpdateAddressRequest
  ): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/${id}`, request);
  }

  deleteAddress(id: number): Observable<AddressResponse> {
    return this.http.delete<AddressResponse>(`${this.apiUrl}/${id}`);
  }

  setDefaultAddress(id: number): Observable<AddressResponse> {
    return this.http.post<AddressResponse>(
      `${this.apiUrl}/${id}/set-default`,
      {}
    );
  }
}
