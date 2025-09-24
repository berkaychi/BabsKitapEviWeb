import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, finalize, forkJoin } from 'rxjs';

import { OrderService } from '../../../../../core/services/order.service';
import { BookService } from '../../../../../core/services/book.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { LoadingService } from '../../../../../core/services/loading.service';

import {
  Order,
  OrderItem,
  getOrderStatusInfo,
} from '../../../../../core/models/order.model';
import { Book } from '../../../../../core/models/book.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;
  bookImages: Record<number, string> = {};

  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private bookService: BookService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    this.loading = true;
    this.loadingService.startLoading('orders');
    this.error = null;

    this.orderService
      .getUserOrders()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.loadingService.stopLoading('orders');
        })
      )
      .subscribe({
        next: (orders: Order[]) => {
          this.orders = orders.sort(
            (a, b) =>
              new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          );
          this.loadBookImages();
        },
        error: (error: any) => {
          console.error('Orders loading error:', error);
          this.error = error.message || 'Siparişler yüklenirken hata oluştu.';
          this.toastService.error(this.error!);
        },
      });
  }

  loadBookImages(): void {
    if (!this.orders || this.orders.length === 0) return;

    this.bookService
      .loadBookImagesFromItems(this.orders.flatMap((order) => order.orderItems))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (imageMap) => {
          this.bookImages = imageMap;
        },
        error: (error) => {
          console.error('Book images loading error:', error);
        },
      });
  }

  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }

  getStatusInfo(status: string) {
    return getOrderStatusInfo(status);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  canCancelOrder(order: Order): boolean {
    return order.status === 'Pending';
  }

  cancelOrder(order: Order): void {
    if (!this.canCancelOrder(order)) {
      this.toastService.warning('Bu sipariş iptal edilemez.');
      return;
    }

    if (
      confirm(
        `#${order.id} numaralı siparişi iptal etmek istediğinizden emin misiniz?`
      )
    ) {
      this.loadingService.startLoading('cancel-order');

      this.orderService
        .cancelOrder(order.id)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.loadingService.stopLoading('cancel-order'))
        )
        .subscribe({
          next: () => {
            this.toastService.success('Sipariş başarıyla iptal edildi.');
            this.loadOrders();
          },
          error: (error: any) => {
            console.error('Order cancellation error:', error);
            this.toastService.error(
              error.message || 'Sipariş iptal edilemedi.'
            );
          },
        });
    }
  }

  goToBooks(): void {
    this.router.navigate(['/books']);
  }

  getBookImage(bookId: number): string {
    return (
      this.bookImages[bookId] ||
      'https://via.placeholder.com/60x80?text=No+Image'
    );
  }
}
