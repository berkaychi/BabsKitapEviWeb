import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { User } from '../../../../core/models/user.model';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private adminUserService: AdminUserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.adminUserService
      .getAllUsers()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (response) => {
          if (
            response &&
            typeof response === 'object' &&
            'success' in response
          ) {
            if (response.success) {
              this.users = response.data || [];
            } else {
              this.error = response.message || 'Kullanıcılar yüklenemedi.';
            }
          } else {
            this.users = Array.isArray(response) ? response : [];
          }
        },
        error: (err) => {
          console.error('Users loading error:', err);
          this.error = 'Kullanıcılar yüklenemedi.';
        },
      });
  }

  deleteUser(user: User): void {
    if (
      confirm(
        `"${user.firstName} ${user.lastName}" kullanıcısını silmek istediğinizden emin misiniz?`
      )
    ) {
      this.adminUserService.deleteUser(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Kullanıcı başarıyla silindi.');
            this.loadUsers();
          } else {
            alert(response.message || 'Kullanıcı silinirken bir hata oluştu.');
          }
        },
        error: (err) => {
          console.error('User deletion error:', err);
          alert('Kullanıcı silinirken bir hata oluştu.');
        },
      });
    }
  }

  getRoleDisplayName(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Yönetici';
      case 'user':
        return 'Kullanıcı';
      default:
        return role;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('tr-TR');
  }
}
