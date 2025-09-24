import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, finalize, forkJoin } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { AddressService } from '../../../core/services/address.service';
import { OrderService } from '../../../core/services/order.service';
import { BookService } from '../../../core/services/book.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';

import { Cart } from '../../../core/models/cart.model';
import { Address } from '../../../core/models/address.model';
import { CreateOrderRequest } from '../../../core/models/order.model';
import { Book } from '../../../core/models/book.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  addresses: Address[] = [];
  selectedAddressId: number | null = null;
  bookImages: Record<number, string> = {};

  checkoutForm: FormGroup;
  loading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  paymentMethods = [
    { id: 'credit-card', name: 'Kredi Kartı', icon: 'fas fa-credit-card' },
    { id: 'debit-card', name: 'Banka Kartı', icon: 'fas fa-money-check-alt' },
    { id: 'paypal', name: 'PayPal', icon: 'fab fa-paypal' },
  ];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private addressService: AddressService,
    private orderService: OrderService,
    private bookService: BookService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      selectedAddress: ['', Validators.required],
      paymentMethod: ['credit-card'],
      cardNumber: [''],
      cardHolder: [''],
      expiryMonth: [''],
      expiryYear: [''],
      cvv: [''],
      agreeTerms: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    this.loadCart();
    this.loadAddresses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCart(): void {
    this.cartService
      .fetchCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cart: Cart) => {
          this.cart = cart;
          if (!cart || cart.items.length === 0) {
            this.toastService.warning('Sepetiniz boş. Önce ürün ekleyin.');
            this.router.navigate(['/cart']);
          } else {
            this.loadBookImages();
          }
        },
        error: (error: any) => {
          console.error('Cart loading error:', error);
          this.error = 'Sepet bilgileri alınamadı.';
        },
      });
  }

  loadBookImages(): void {
    if (!this.cart || this.cart.items.length === 0) return;

    const bookIds = this.cart.items.map((item) => item.bookId);
    const bookRequests = bookIds.map((id) => this.bookService.getBookById(id));

    forkJoin(bookRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (books: Book[]) => {
          books.forEach((book) => {
            this.bookImages[book.id] =
              book.imageUrl ||
              'https://via.placeholder.com/80x100?text=No+Image';
          });
        },
        error: (error: any) => {
          console.error('Book images loading error:', error);
          this.cart?.items.forEach((item) => {
            this.bookImages[item.bookId] =
              'https://via.placeholder.com/80x100?text=No+Image';
          });
        },
      });
  }

  loadAddresses(): void {
    this.addressService
      .getMyAddresses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (addresses: Address[]) => {
          this.addresses = addresses;
          if (addresses.length === 0) {
            this.toastService.info('Önce teslimat adresi eklemeniz gerekiyor.');
            this.router.navigate(['/profile/addresses']);
          }
        },
        error: (error: any) => {
          console.error('Addresses loading error:', error);
          this.error = 'Adres bilgileri alınamadı.';
        },
      });
  }

  onAddressSelect(addressId: number): void {
    this.selectedAddressId = addressId;
    this.checkoutForm.patchValue({ selectedAddress: addressId });
  }

  getSelectedAddress(): Address | null {
    if (!this.selectedAddressId) return null;
    return (
      this.addresses.find((addr) => addr.id === this.selectedAddressId) || null
    );
  }

  getTotalAmount(): number {
    if (!this.cart) return 0;
    return this.cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  getShippingCost(): number {
    const total = this.getTotalAmount();
    return total > 100 ? 0 : 15;
  }

  getFinalTotal(): number {
    return this.getTotalAmount() + this.getShippingCost();
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid || !this.selectedAddressId) {
      this.toastService.error('Lütfen tüm gerekli alanları doldurun.');
      return;
    }

    if (!this.cart || this.cart.items.length === 0) {
      this.toastService.error('Sepetiniz boş.');
      return;
    }

    this.loading = true;
    this.loadingService.startLoading('checkout');

    const orderRequest: CreateOrderRequest = {
      addressId: this.selectedAddressId,
    };

    this.orderService
      .createOrder(orderRequest)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.loadingService.stopLoading('checkout');
        })
      )
      .subscribe({
        next: (order) => {
          this.toastService.success('Siparişiniz başarıyla oluşturuldu!');
          this.router.navigate(['/orders', order.id]);
        },
        error: (error) => {
          console.error('Order creation error:', error);
          this.toastService.error(error.message || 'Sipariş oluşturulamadı.');
        },
      });
  }

  goToBooks(): void {
    this.router.navigate(['/books']);
  }

  goToAddresses(): void {
    this.router.navigate(['/addresses']);
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }

  getBookImage(bookId: number): string {
    return (
      this.bookImages[bookId] ||
      'https://via.placeholder.com/80x100?text=No+Image'
    );
  }
}
