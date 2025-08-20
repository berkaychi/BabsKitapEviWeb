import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-header">
        <h5 *ngIf="!collapsed">Admin Panel</h5>
        <i *ngIf="collapsed" class="bi bi-gear-fill"></i>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li *ngFor="let item of menuItems" class="nav-item">
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-link"
            >
              <i [class]="'bi ' + item.icon"></i>
              <span *ngIf="!collapsed">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  `,
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminSidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'bi-speedometer2', route: '/admin' },
    { label: 'Kitaplar', icon: 'bi-book', route: '/admin/books' },
    { label: 'Kullanıcılar', icon: 'bi-people', route: '/admin/users' },
    { label: 'Siparişler', icon: 'bi-cart', route: '/admin/orders' },
    { label: 'Kategoriler', icon: 'bi-tags', route: '/admin/categories' },
    { label: 'Raporlar', icon: 'bi-graph-up', route: '/admin/reports' },
  ];
}
