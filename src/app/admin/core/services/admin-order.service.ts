import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  Order,
  UserOrderGroup,
  PagedResponse,
  OrderSortBy,
  SortDirection,
} from '../../../core/models/order.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { OrderSearchQuery } from '../../../core/models/order-filter.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminOrderService {
  private readonly apiUrl = `${environment.apiUrl}/api/Orders`;

  constructor(private http: HttpClient) {}

  getAllOrdersGroupedByUser(): Observable<UserOrderGroup[]> {
    return this.http
      .get<ApiResponse<UserOrderGroup[]>>(`${this.apiUrl}/all`)
      .pipe(map((response) => response.data!));
  }

  getAllOrders(): Observable<Order[]> {
    return this.getAllOrdersGroupedByUser().pipe(
      map((userGroups) => {
        const allOrders: Order[] = [];
        userGroups.forEach((group) => {
          allOrders.push(...group.orders);
        });
        return allOrders.sort(
          (a, b) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
      })
    );
  }

  updateOrderStatus(orderId: number, newStatus: string): Observable<Order> {
    return this.http
      .patch<ApiResponse<Order>>(`${this.apiUrl}/${orderId}`, {
        status: newStatus,
      })
      .pipe(map((response) => response.data!));
  }

  getOrderById(orderId: number): Observable<Order> {
    return this.http
      .get<ApiResponse<Order>>(`${this.apiUrl}/${orderId}`)
      .pipe(map((response) => response.data!));
  }

  deleteOrder(orderId: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${orderId}`)
      .pipe(map(() => void 0));
  }

  searchOrders(query: OrderSearchQuery): Observable<PagedResponse<Order>> {
    let params = new HttpParams();

    params = params.set('pageNumber', (query.pageNumber || 1).toString());
    params = params.set('pageSize', (query.pageSize || 10).toString());

    if (query.searchTerm && query.searchTerm.trim()) {
      params = params.set('searchTerm', query.searchTerm.trim());
    }

    if (query.status !== undefined && query.status !== null) {
      params = params.set('status', query.status.toString());
    }

    if (query.userId && query.userId.trim()) {
      params = params.set('userId', query.userId.trim());
    }

    if (query.minAmount !== undefined && query.minAmount !== null) {
      params = params.set('minAmount', query.minAmount.toString());
    }

    if (query.maxAmount !== undefined && query.maxAmount !== null) {
      params = params.set('maxAmount', query.maxAmount.toString());
    }

    if (query.startDate && query.startDate.trim()) {
      params = params.set('startDate', query.startDate.trim());
    }

    if (query.endDate && query.endDate.trim()) {
      params = params.set('endDate', query.endDate.trim());
    }

    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }

    if (query.sortDirection) {
      params = params.set('sortDirection', query.sortDirection);
    }

    return this.http
      .get<ApiResponse<PagedResponse<Order>>>(`${this.apiUrl}/search`, {
        params,
      })
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(
            response.errors?.join(', ') || 'Sipariş arama başarısız.'
          );
        })
      );
  }

  searchOrdersLegacy(filters: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
  }): Observable<Order[]> {
    const query: OrderSearchQuery = {
      searchTerm: filters.search,
      status: filters.status ? parseInt(filters.status) : undefined,
      userId: filters.userId,
      startDate: filters.dateFrom,
      endDate: filters.dateTo,
      pageNumber: 1,
    };

    return this.searchOrders(query).pipe(
      map((pagedResponse) => pagedResponse.items)
    );
  }

  getOrderStats(): Observable<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    monthlyRevenue: number;
  }> {
    return this.http
      .get<ApiResponse<any>>(`${this.apiUrl}/stats`)
      .pipe(map((response) => response.data));
  }
}
