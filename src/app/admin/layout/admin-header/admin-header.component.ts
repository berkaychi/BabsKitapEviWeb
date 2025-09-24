import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss'],
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
