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
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss'],
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
    { label: 'Yayınevleri', icon: 'bi-house', route: '/admin/publishers' },
    { label: 'Raporlar', icon: 'bi-graph-up', route: '/admin/reports' },
  ];
}
