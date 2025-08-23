import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../../core/models/user.model';
import {
  AdminUserService,
  UpdateUserRoleRequest,
} from '../../../core/services/admin-user.service';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  roleForm!: FormGroup;
  isEditMode = false;
  userId?: string;
  loading = false;
  submitting = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminUserService: AdminUserService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.checkEditMode();
  }

  initForms(): void {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.roleForm = this.fb.group({
      role: ['User', [Validators.required]],
    });
  }

  checkEditMode(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.userId = id;
        this.loadUser();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUser(): void {
    if (!this.userId) return;
    this.loading = true;
    this.error = null;

    this.adminUserService
      .getUserById(this.userId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (response) => {
          let userData: any = null;

          if (
            response &&
            typeof response === 'object' &&
            'success' in response
          ) {
            if (response.success) {
              userData = response.data;
            } else {
              this.error =
                response.message || 'Kullanıcı bilgileri yüklenemedi.';
              this.goBack();
              return;
            }
          } else {
            userData = response;
          }

          if (userData) {
            this.userForm.patchValue({
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
            });
            this.roleForm.patchValue({
              role: userData.role,
            });
          }
        },
        error: (err) => {
          console.error('User loading error:', err);
          this.error = 'Kullanıcı bilgileri yüklenemedi.';
          this.goBack();
        },
      });
  }

  onUserSubmit(): void {
    if (this.userForm.invalid) return;
    this.submitting = true;
    this.error = null;

    const userData = this.userForm.value;

    this.adminUserService
      .updateUser(this.userId!, userData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.submitting = false))
      )
      .subscribe({
        next: (response) => {
          if (
            response &&
            typeof response === 'object' &&
            'success' in response
          ) {
            if (response.success) {
              alert('Kullanıcı bilgileri başarıyla güncellendi.');
            } else {
              this.error =
                response.message || 'Kullanıcı bilgileri güncellenemedi.';
            }
          } else {
            alert('Kullanıcı bilgileri başarıyla güncellendi.');
          }
        },
        error: (err) => {
          console.error('User update error:', err);
          this.error = 'Kullanıcı bilgileri güncellenemedi.';
        },
      });
  }

  onRoleSubmit(): void {
    if (this.roleForm.invalid) return;
    this.submitting = true;
    this.error = null;

    const roleData: UpdateUserRoleRequest = this.roleForm.value;

    this.adminUserService
      .updateUserRole(this.userId!, roleData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.submitting = false))
      )
      .subscribe({
        next: (response) => {
          if (
            response &&
            typeof response === 'object' &&
            'success' in response
          ) {
            if (response.success) {
              alert('Kullanıcı rolü başarıyla güncellendi.');
            } else {
              this.error = response.message || 'Kullanıcı rolü güncellenemedi.';
            }
          } else {
            alert('Kullanıcı rolü başarıyla güncellendi.');
          }
        },
        error: (err) => {
          console.error('User role update error:', err);
          this.error = 'Kullanıcı rolü güncellenemedi.';
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  getRoleOptions(): { value: string; label: string }[] {
    return [
      { value: 'User', label: 'Kullanıcı' },
      { value: 'Admin', label: 'Yönetici' },
    ];
  }
}
