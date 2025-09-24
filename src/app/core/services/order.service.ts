import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Order, CreateOrderRequest } from '../models/order.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/api/Orders`;

  constructor(private http: HttpClient) {}

  createOrder(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<ApiResponse<Order>>(this.apiUrl, request).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(
          response.errors?.join(', ') ||
            response.message ||
            'Sipariş oluşturulamadı.'
        );
      })
    );
  }

  getUserOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/user`).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(
          response.errors?.join(', ') ||
            response.message ||
            'Siparişler alınamadı.'
        );
      })
    );
  }

  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${orderId}`).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          return response.data;
        }
        throw new Error(
          response.errors?.join(', ') ||
            response.message ||
            'Sipariş detayı alınamadı.'
        );
      })
    );
  }

  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http
      .put<ApiResponse<Order>>(`${this.apiUrl}/${orderId}/status`, { status })
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') ||
              response.message ||
              'Sipariş durumu güncellenemedi.'
          );
        })
      );
  }

  cancelOrder(orderId: number): Observable<void> {
    return this.http
      .put<ApiResponse<null>>(`${this.apiUrl}/${orderId}/cancel`, {})
      .pipe(
        map((response) => {
          if (response.isSuccess) {
            return;
          }
          throw new Error(
            response.errors?.join(', ') ||
              response.message ||
              'Sipariş iptal edilemedi.'
          );
        })
      );
  }
}
