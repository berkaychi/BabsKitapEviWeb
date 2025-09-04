import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AdminOrderService } from '../../../../core/services/admin-order.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { LoadingService } from '../../../../../core/services/loading.service';

import {
  Order,
  getOrderStatusInfo,
} from '../../../../../core/models/order.model';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-order-detail.component.html',
  styleUrls: ['./admin-order-detail.component.scss'],
})
export class AdminOrderDetailComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  orderId!: number;
  loading = false;
  error: string | null = null;

  selectedStatus: string = '';
  isUpdatingStatus = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminOrderService: AdminOrderService,
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
    this.loadingService.startLoading('admin-order-detail');
    this.error = null;

    this.adminOrderService
      .getOrderById(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order: Order) => {
          this.order = order;
          this.loading = false;
          this.loadingService.stopLoading('admin-order-detail');
        },
        error: (error: any) => {
          console.error('Order detail loading error:', error);
          this.error =
            error.message || 'Sipariş detayı yüklenirken hata oluştu.';
          this.loading = false;
          this.loadingService.stopLoading('admin-order-detail');
          if (this.error) {
            this.toastService.error(this.error);
          }
        },
      });
  }

  onStatusChange(selectedStatus: string): void {
    this.selectedStatus = selectedStatus;
  }

  confirmStatusUpdate(): void {
    if (
      !this.order ||
      !this.selectedStatus ||
      this.order.status === this.selectedStatus
    ) {
      return;
    }

    const currentStatusLabel = this.getOrderStatusInfo(this.order.status).label;
    const newStatusLabel = this.getOrderStatusInfo(this.selectedStatus).label;

    if (
      confirm(
        `Sipariş durumunu "${currentStatusLabel}" → "${newStatusLabel}" olarak değiştirmek istediğinizden emin misiniz?`
      )
    ) {
      this.updateOrderStatus();
    }
  }

  private updateOrderStatus(): void {
    if (!this.order || !this.selectedStatus) return;

    this.isUpdatingStatus = true;
    this.loadingService.startLoading('update-status');

    this.adminOrderService
      .updateOrderStatus(this.order.id, this.selectedStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedOrder: Order) => {
          this.order = updatedOrder;
          this.selectedStatus = '';
          this.isUpdatingStatus = false;
          this.loadingService.stopLoading('update-status');
          this.toastService.success('Sipariş durumu başarıyla güncellendi.');
        },
        error: (error: any) => {
          console.error('Status update error:', error);
          this.isUpdatingStatus = false;
          this.loadingService.stopLoading('update-status');
          this.toastService.error(
            error.message || 'Sipariş durumu güncellenemedi.'
          );
        },
      });
  }

  canConfirmStatusUpdate(): boolean {
    return !!(
      this.canUpdateStatus() &&
      this.selectedStatus &&
      this.selectedStatus !== this.order?.status &&
      !this.isUpdatingStatus
    );
  }

  getOrderStatusInfo(status: string) {
    return getOrderStatusInfo(status);
  }

  getNextStatusOptions(currentStatus: string): string[] {
    const statusFlow: Record<string, string[]> = {
      Pending: ['Processing'],
      Processing: ['Shipped', 'Cancelled'],
      Shipped: ['Delivered'],
      Delivered: [],
      Cancelled: [],
    };
    return statusFlow[currentStatus] || [];
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

  getTotalItemsCount(): number {
    if (!this.order) return 0;
    return this.order.orderItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  canUpdateStatus(): boolean {
    return (
      this.order?.status !== 'Delivered' && this.order?.status !== 'Cancelled'
    );
  }

  canDeleteOrder(): boolean {
    return (
      this.order?.status === 'Cancelled' || this.order?.status === 'Pending'
    );
  }

  goBackToOrders(): void {
    this.router.navigate(['/admin/orders']);
  }

  deleteOrder(): void {
    if (!this.order) return;

    if (
      confirm(
        `#${this.order.id} numaralı siparişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
      )
    ) {
      this.loadingService.startLoading('delete-order');

      this.adminOrderService
        .deleteOrder(this.order.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success('Sipariş başarıyla silindi.');
            this.router.navigate(['/admin/orders']);
          },
          error: (error: any) => {
            console.error('Order deletion error:', error);
            this.loadingService.stopLoading('delete-order');
            this.toastService.error(error.message || 'Sipariş silinemedi.');
          },
        });
    }
  }

  getShippingAddress(): string {
    if (!this.order) return '';
    return `${this.order.shippingAddress}, ${this.order.shippingCity}, ${this.order.shippingCountry} ${this.order.shippingZipCode}`;
  }
}
