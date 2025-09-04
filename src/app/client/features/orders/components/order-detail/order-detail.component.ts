import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  orderId!: number;
  loading = false;
  error: string | null = null;
  bookImages: Record<number, string> = {};

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private bookService: BookService,
    private toastService: ToastService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.orderId = +params['id'];
      if (this.orderId) {
        this.loadOrderDetail();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrderDetail(): void {
    this.loading = true;
    this.loadingService.startLoading('order-detail');
    this.error = null;

    this.orderService
      .getOrderById(this.orderId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.loadingService.stopLoading('order-detail');
        })
      )
      .subscribe({
        next: (order: Order) => {
          this.order = order;
          this.loadBookImages();
        },
        error: (error: any) => {
          console.error('Order detail loading error:', error);
          this.error =
            error.message || 'Sipariş detayı yüklenirken hata oluştu.';
          this.toastService.error(this.error!);
        },
      });
  }

  loadBookImages(): void {
    if (
      !this.order ||
      !this.order.orderItems ||
      this.order.orderItems.length === 0
    )
      return;

    const bookIds = this.order.orderItems.map((item: OrderItem) => item.bookId);
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
          this.order?.orderItems.forEach((item: OrderItem) => {
            this.bookImages[item.bookId] =
              'https://via.placeholder.com/80x100?text=No+Image';
          });
        },
      });
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

  canCancelOrder(): boolean {
    return this.order?.status === 'Pending';
  }

  cancelOrder(): void {
    if (!this.order || !this.canCancelOrder()) {
      this.toastService.warning('Bu sipariş iptal edilemez.');
      return;
    }

    if (
      confirm(
        `#${this.order.id} numaralı siparişi iptal etmek istediğinizden emin misiniz?`
      )
    ) {
      this.loadingService.startLoading('cancel-order');

      this.orderService
        .cancelOrder(this.order.id)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.loadingService.stopLoading('cancel-order'))
        )
        .subscribe({
          next: () => {
            this.toastService.success('Sipariş başarıyla iptal edildi.');
            this.loadOrderDetail();
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

  goBackToOrders(): void {
    this.router.navigate(['/orders']);
  }

  printOrder(): void {
    window.print();
  }

  getBookImage(bookId: number): string {
    return (
      this.bookImages[bookId] ||
      'https://via.placeholder.com/80x100?text=No+Image'
    );
  }
}
