import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AdminOrderService } from '../../../../core/services/admin-order.service';
import { OrderFilterService } from '../../../../../core/services/order-filter.service';
import { ToastService } from '../../../../../core/services/toast.service';

import {
  Order,
  PagedResponse,
  getOrderStatusInfo,
} from '../../../../../core/models/order.model';
import {
  OrderFilterState,
  OrderFilterOptions,
} from '../../../../../core/models/order-filter.interface';

@Component({
  selector: 'app-order-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-search.component.html',
})
export class OrderSearchComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  pagedResponse: PagedResponse<Order> | null = null;
  loading = false;
  error: string | null = null;

  filterState: OrderFilterState | null = null;
  filterOptions: OrderFilterOptions | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private adminOrderService: AdminOrderService,
    private orderFilterService: OrderFilterService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.orderFilterService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.filterState = state;
      });

    this.orderFilterService.options$
      .pipe(takeUntil(this.destroy$))
      .subscribe((options) => {
        this.filterOptions = options;
      });

    this.orderFilterService.searchQuery$
      .pipe(takeUntil(this.destroy$))
      .subscribe((query) => {
        this.loadOrders(query);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchTermChange(event: any): void {
    this.orderFilterService.updateSearchTerm(event.target.value);
  }

  onStatusChange(event: any): void {
    const statusValue = event.target.value
      ? parseInt(event.target.value)
      : null;
    this.orderFilterService.updateStatus(statusValue);
  }

  onStartDateChange(event: any): void {
    const startDate = event.target.value || null;
    const endDate = this.filterState?.endDate || null;
    this.orderFilterService.updateDateRange(startDate, endDate);
  }

  onEndDateChange(event: any): void {
    const startDate = this.filterState?.startDate || null;
    const endDate = event.target.value || null;
    this.orderFilterService.updateDateRange(startDate, endDate);
  }

  onClearFilters(): void {
    this.orderFilterService.resetFilters();
  }

  refreshOrders(): void {
    const currentQuery = this.orderFilterService.currentState;
    this.loadOrders(currentQuery);
  }

  private loadOrders(query: any): void {
    this.loading = true;
    this.error = null;

    this.adminOrderService
      .searchOrders(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pagedResponse: PagedResponse<Order>) => {
          this.pagedResponse = pagedResponse;
          this.orders = pagedResponse.items;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Orders loading error:', error);
          this.error = error.message || 'Siparişler yüklenirken hata oluştu.';
          this.loading = false;
          if (this.error) {
            this.toastService.error(this.error);
          }
        },
      });
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/admin/orders', orderId]);
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

  getOrderStatusInfo(status: string) {
    return getOrderStatusInfo(status);
  }

  getStatusBadgeClass(status: string): string {
    const statusInfo = getOrderStatusInfo(status);
    switch (statusInfo.value) {
      case 'Pending':
        return 'bg-warning';
      case 'Processing':
        return 'bg-info';
      case 'Shipped':
        return 'bg-primary';
      case 'Delivered':
        return 'bg-success';
      case 'Cancelled':
        return 'bg-danger';
      case 'Refunded':
        return 'bg-secondary';
      case 'PaymentFailed':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}
