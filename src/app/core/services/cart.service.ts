import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Cart,
  AddCartItemRequest,
  UpdateCartItemRequest,
} from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/api/Carts/me`;

  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public readonly cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchCart() {
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap((cart) => {
        this.cartSubject.next(cart);
      })
    );
  }

  addItem(payload: AddCartItemRequest) {
    return this.http.post<void>(`${this.apiUrl}/items`, payload).pipe(
      tap(() => {
        this.fetchCart().subscribe();
      })
    );
  }

  updateItem(bookId: number, payload: UpdateCartItemRequest) {
    return this.http.put<void>(`${this.apiUrl}/items/${bookId}`, payload).pipe(
      tap(() => {
        this.fetchCart().subscribe();
      })
    );
  }

  removeAllItems() {}

  removeItem(bookId: number) {
    return this.http.delete<void>(`${this.apiUrl}/items/${bookId}`).pipe(
      tap(() => {
        this.fetchCart().subscribe();
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
