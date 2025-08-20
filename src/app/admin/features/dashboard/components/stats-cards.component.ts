import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  newUsersToday: number;
  ordersToday: number;
  lowStockBooks: number;
  pendingOrders: number;
}

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-cards">
      <div class="row">
        <div class="col-xl-3 col-lg-6 col-md-6" *ngFor="let card of statCards">
          <div class="card stats-card" [class]="'stats-card--' + card.color">
            <div class="card-body">
              <div class="stats-content">
                <div class="stats-icon">
                  <i [class]="'bi ' + card.icon"></i>
                </div>
                <div class="stats-info">
                  <h3>{{ card.value }}</h3>
                  <p>{{ card.title }}</p>
                  <div class="stats-trend" *ngIf="card.trend">
                    <i
                      [class]="
                        card.trend.isPositive
                          ? 'bi bi-arrow-up text-success'
                          : 'bi bi-arrow-down text-danger'
                      "
                    ></i>
                    <span
                      [class]="
                        card.trend.isPositive ? 'text-success' : 'text-danger'
                      "
                    >
                      {{ card.trend.value }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./stats-cards.component.scss'],
})
export class StatsCardsComponent {
  @Input() stats!: DashboardStats;

  get statCards(): StatCard[] {
    return [
      {
        title: 'Toplam Kitap',
        value: this.stats.totalBooks,
        icon: 'bi-book',
        color: 'primary',
        trend: { value: 5.2, isPositive: true },
      },
      {
        title: 'Toplam Kullanıcı',
        value: this.stats.totalUsers,
        icon: 'bi-people',
        color: 'success',
        trend: { value: 12.3, isPositive: true },
      },
      {
        title: 'Toplam Sipariş',
        value: this.stats.totalOrders,
        icon: 'bi-cart',
        color: 'warning',
        trend: { value: 3.1, isPositive: false },
      },
      {
        title: 'Toplam Gelir',
        value: `₺${this.stats.totalRevenue.toLocaleString()}`,
        icon: 'bi-currency-dollar',
        color: 'info',
        trend: { value: 8.7, isPositive: true },
      },
    ];
  }
}
