import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../../core/services/auth.service';
import { LoadingService } from '../../../../../core/services/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  errorMessage: string = '';
  showPassword = false;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      if (
        this.authService.getCurrentUser()?.role === 'Admin' ||
        this.authService.getCurrentUser()?.role === 'admin'
      ) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/books']);
      }
    }
    this.setupLoadingSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupLoadingSubscription(): void {
    this.loadingService.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.isLoading = loading;
      });
  }

  private createForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      this.loadingService.startLoading('login');
      const credentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.loadingService.stopLoading('login');
          if (
            response.user.role === 'Admin' ||
            response.user.role === 'admin'
          ) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/books']);
          }
        },
        error: (error) => {
          this.errorMessage =
            error.message || 'Login failed. Please try again.';
          this.loadingService.stopLoading('login');
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} zorunludur.`;
      }
      if (field.errors['email']) {
        return 'Geçerli bir email adresi giriniz.';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} en az ${
          field.errors['minlength'].requiredLength
        } karakter olmalıdır.`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      password: 'Şifre',
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}
