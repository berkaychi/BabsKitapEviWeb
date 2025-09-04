import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AdminOrderService } from '../../../../core/services/admin-order.service';
import { OrderFilterService } from '../../../../../core/services/order-filter.service';
import { BookService } from '../../../../../core/services/book.service';

import { Order, PagedResponse } from '../../../../../core/models/order.model';
import { OrderFilterState } from '../../../../../core/models/order-filter.interface';
import { OrderFiltersComponent } from '../order-filters/order-filters.component';
import { OrderPaginationComponent } from '../order-pagination/order-pagination.component';
import { OrderRowComponent } from '../order-row/order-row.component';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';

@Component({
  selector: 'app-admin-order-list',
  standalone: true,
  imports: [
    CommonModule,
    OrderFiltersComponent,
    OrderPaginationComponent,
    OrderRowComponent,
    OrderSummaryComponent,
  ],
  templateUrl: './admin-order-list.component.html',
  styleUrls: ['./admin-order-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminOrderListComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  pagedResponse: PagedResponse<Order> | null = null;
  loading = false;
  error: string | null = null;
  bookImages: Record<number, string> = {};

  filterState: OrderFilterState | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private adminOrderService: AdminOrderService,
    private orderFilterService: OrderFilterService,
    private bookService: BookService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.orderFilterService.initializeFromRoute(this.route);

    this.orderFilterService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.filterState = state;
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
          this.loadBookImages();
        },
        error: (error: any) => {
          console.error('Orders loading error:', error);
          this.error = error.message || 'Siparişler yüklenirken hata oluştu.';
          this.loading = false;
          this.orders = [];
          this.pagedResponse = null;
        },
      });
  }

  loadBookImages(): void {
    if (!this.orders || this.orders.length === 0) return;

    this.bookService
      .loadBookImagesFromItems(this.orders.flatMap((order) => order.orderItems))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (imageMap: Record<number, string>) => {
          this.bookImages = imageMap;
        },
        error: (error: any) => {
          console.error('Book images loading error:', error);
        },
      });
  }

  onPageChange(page: number): void {
    this.orderFilterService.updatePageNumber(page);
  }

  onClearFilters(): void {
    this.orderFilterService.resetFilters();
  }

  refreshOrders(): void {
    this.orderFilterService.searchQuery$
      .pipe(takeUntil(this.destroy$))
      .subscribe((query) => {
        this.loadOrders(query);
      });
  }

  hasActiveFilters(): boolean {
    if (!this.filterState) return false;
    return !!(
      this.filterState.searchTerm ||
      this.filterState.status !== null ||
      this.filterState.startDate ||
      this.filterState.endDate ||
      this.filterState.minAmount !== null ||
      this.filterState.maxAmount !== null ||
      this.filterState.userId
    );
  }

  onOrderUpdated(updatedOrder: Order): void {
    const index = this.orders.findIndex(
      (order) => order.id === updatedOrder.id
    );
    if (index !== -1) {
      this.orders[index] = updatedOrder;
    }
  }

  get totalCount(): number {
    return this.pagedResponse?.totalCount || 0;
  }

  get currentPage(): number {
    return this.filterState?.pageNumber || 1;
  }

  get totalPages(): number {
    return this.pagedResponse?.totalPages || 0;
  }

  get hasPreviousPage(): boolean {
    return this.pagedResponse?.hasPreviousPage || false;
  }

  get hasNextPage(): boolean {
    return this.pagedResponse?.hasNextPage || false;
  }

  trackByOrderId(index: number, order: Order): number {
    return order.id;
  }
}
