import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  newUsersToday: number;
  ordersToday: number;
  lowStockBooks: number;
  pendingOrders: number;
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    // Geçici mock data - gerçek API'ye bağlandığında bu kısım değişecek
    const mockStats: DashboardStats = {
      totalBooks: 1250,
      totalUsers: 850,
      totalOrders: 320,
      totalRevenue: 45200,
      newUsersToday: 12,
      ordersToday: 8,
      lowStockBooks: 15,
      pendingOrders: 5,
    };

    return of(mockStats);
    // Gerçek API için:
    // return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }

  getSalesData(days: number = 30): Observable<SalesData[]> {
    return this.http.get<SalesData[]>(
      `${this.apiUrl}/dashboard/sales-data?days=${days}`
    );
  }

  getRecentOrders(limit: number = 10): Observable<RecentOrder[]> {
    return this.http.get<RecentOrder[]>(
      `${this.apiUrl}/dashboard/recent-orders?limit=${limit}`
    );
  }

  getTopSellingBooks(limit: number = 5): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/dashboard/top-books?limit=${limit}`
    );
  }
}
