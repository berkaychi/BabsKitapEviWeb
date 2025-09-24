import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Cart,
  AddCartItemRequest,
  UpdateCartItemRequest,
} from '../models/cart.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/api/Carts/me`;

  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public readonly cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchCart() {
    return this.http.get<ApiResponse<Cart>>(this.apiUrl).pipe(
      map((response) => {
        if (response.isSuccess && response.data) {
          this.cartSubject.next(response.data);
          return response.data;
        }
        throw new Error(
          response.errors?.join(', ') || 'Sepet bilgileri alınamadı.'
        );
      })
    );
  }

  addItem(payload: AddCartItemRequest): Observable<void> {
    return this.http
      .post<ApiResponse<null>>(`${this.apiUrl}/items`, payload)
      .pipe(
        map((response) => {
          if (response.isSuccess) {
            this.fetchCart().subscribe();
            return;
          }
          throw new Error(
            response.errors?.join(', ') || 'Ürün sepete eklenemedi.'
          );
        })
      );
  }

  updateItem(bookId: number, payload: UpdateCartItemRequest): Observable<void> {
    return this.http
      .put<ApiResponse<null>>(`${this.apiUrl}/items/${bookId}`, payload)
      .pipe(
        map((response) => {
          if (response.isSuccess) {
            this.fetchCart().subscribe();
            return;
          }
          throw new Error(
            response.errors?.join(', ') || 'Sepet güncellenemedi.'
          );
        })
      );
  }

  removeAllItems() {}

  removeItem(bookId: number): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.apiUrl}/items/${bookId}`)
      .pipe(
        map((response) => {
          if (response.isSuccess) {
            this.fetchCart().subscribe();
            return;
          }
          throw new Error(
            response.errors?.join(', ') || 'Ürün sepetten çıkarılamadı.'
          );
        })
      );
  }

  getTotalQuantity(): number {
    const cart = this.cartSubject.value;
    if (!cart) return 0;

    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  getDifferentBooksCount(): number {
    const cart = this.cartSubject.value;
    if (!cart) return 0;

    return new Set(cart.items.map((item) => item.bookId)).size;
  }

  public clearLocalCart(): void {
    this.cartSubject.next(null);
  }
}
