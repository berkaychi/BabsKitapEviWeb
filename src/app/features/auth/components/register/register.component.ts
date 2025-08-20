import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { AuthService } from '../../../../core/services/auth.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/books']);
    }
  }

  private createForm(): void {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        termsAccepted: [false, [Validators.requiredTrue]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.errorMessage = '';
      this.isLoading = true;
      const userData = this.registerForm.value;

      const { confirmPassword, ...registerData } = userData;

      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('Register successful:', response);
          this.isLoading = false;
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.isLoading = false;
          console.error('Register error:', error);
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} zorunludur.`;
      }
      if (field.errors['requiredTrue']) {
        return 'Kullanım şartlarını kabul etmelisiniz.';
      }
      if (field.errors['email']) {
        return 'Geçerli bir email adresi giriniz.';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} en az ${
          field.errors['minlength'].requiredLength
        } karakter olmalıdır.`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Şifreler eşleşmiyor.';
      }
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'Ad',
      lastName: 'Soyad',
      email: 'Email',
      password: 'Şifre',
      confirmPassword: 'Şifre Tekrarı',
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  getPasswordStrength(): string {
    const password = this.registerForm.get('password')?.value || '';

    if (password.length === 0) return '';
    if (password.length < 6) return 'Zayıf';
    if (password.length < 8) return 'Orta';

    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 2) return 'Zayıf';
    if (score < 4) return 'Orta';
    return 'Güçlü';
  }

  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'Zayıf':
        return 'text-danger';
      case 'Orta':
        return 'text-warning';
      case 'Güçlü':
        return 'text-success';
      default:
        return '';
    }
  }
}
