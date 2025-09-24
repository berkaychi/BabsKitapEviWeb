import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  Order,
  getOrderStatusInfo,
} from '../../../../../core/models/order.model';
import { AdminOrderService } from '../../../../core/services/admin-order.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { LoadingService } from '../../../../../core/services/loading.service';
import { BookService } from '../../../../../core/services/book.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-order-row',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-row.component.html',
  styleUrls: ['./order-row.component.scss'],
})
export class OrderRowComponent {
  @Input() order!: Order;
  @Input() bookImages: Record<number, string> = {};

  @Output() orderUpdated = new EventEmitter<Order>();

  private destroy$ = new Subject<void>();

  constructor(
    private adminOrderService: AdminOrderService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private router: Router,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    this.loadBookImages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookImages(): void {
    if (!this.order || this.order.orderItems.length === 0) return;

    const bookIds = this.order.orderItems.map((item) => item.bookId);
    bookIds.forEach((bookId) => {
      if (!this.bookImages[bookId]) {
        this.bookImages[bookId] =
          'https://via.placeholder.com/40x50?text=Book+' + bookId;
      }
    });
  }

  getOrderStatusInfo(status: string) {
    return getOrderStatusInfo(status);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getBookImage(bookId: number): string {
    return (
      this.bookImages[bookId] ||
      'https://via.placeholder.com/40x50?text=No+Image'
    );
  }

  getTotalItemsCount(order: Order): number {
    return order.orderItems.reduce((total, item) => total + item.quantity, 0);
  }

  canUpdateStatus(order: Order): boolean {
    return order.status !== 'Delivered' && order.status !== 'Cancelled';
  }

  getNextStatusOptions(currentStatus: string): string[] {
    const statusFlow: Record<string, string[]> = {
      Pending: ['Processing'],
      Processing: ['Shipped', 'Cancelled'],
      Shipped: ['Delivered'],
      Delivered: [],
      Cancelled: [],
      Returned: [],
      PaymentFailed: ['Pending'],
    };
    return statusFlow[currentStatus] || [];
  }

  getNextStatus(currentStatus: string): string[] {
    const statusFlow: Record<string, string[]> = {
      Pending: ['Processing'],
      Processing: ['Shipped', 'Cancelled'],
      Shipped: ['Delivered'],
      Delivered: [],
      Cancelled: [],
      Returned: [],
      PaymentFailed: ['Pending'],
    };
    return statusFlow[currentStatus] || [];
  }

  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/admin/orders', orderId]);
  }
}
