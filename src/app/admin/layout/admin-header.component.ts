import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule],
  template: `
    <header class="admin-header">
      <div class="header-left">
        <button
          class="sidebar-toggle btn btn-link"
          (click)="toggleSidebar.emit()"
        >
          <i class="bi bi-list"></i>
        </button>

        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">Admin</li>
            <li class="breadcrumb-item active">Dashboard</li>
          </ol>
        </nav>
      </div>

      <div class="header-right">
        <!-- Bildirimler -->
        <div class="notifications">
          <button class="btn btn-link">
            <i class="bi bi-bell"></i>
            <span class="badge bg-danger">3</span>
          </button>
        </div>

        <!-- Kullanıcı Menüsü -->
        <div class="user-menu" ngbDropdown>
          <button class="btn btn-link user-dropdown" ngbDropdownToggle>
            <img
              src="assets/images/default-avatar.png"
              alt="Avatar"
              class="user-avatar"
            />
            <span>{{ getUserDisplayName() }}</span>
            <i class="bi bi-chevron-down"></i>
          </button>

          <div ngbDropdownMenu>
            <a class="dropdown-item" href="#">
              <i class="bi bi-person"></i> Profil
            </a>
            <a class="dropdown-item" href="#">
              <i class="bi bi-gear"></i> Ayarlar
            </a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="#" (click)="onLogout()">
              <i class="bi bi-box-arrow-right"></i> Çıkış
            </a>
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminHeaderComponent {
  @Input() user: User | null = null;
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  getUserDisplayName(): string {
    if (this.user) {
      return `${this.user.firstName} ${this.user.lastName}`;
    }
    return 'Admin';
  }

  onLogout(): void {
    this.authService.logout();
  }
}
