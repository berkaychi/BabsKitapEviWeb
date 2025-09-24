import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  ChangePasswordRequest,
  User,
  UpdateUserRequest,
} from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { AddressService } from '../../../core/services/address.service';
import { Address } from '../../../core/models/address.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  me: User | null = null;
  addresses: Address[] = [];

  profileForm: FormGroup;
  passwordForm: FormGroup;

  activeTab: 'profile' | 'password' | 'addresses' = 'profile';
  showPasswordForm = false;

  constructor(
    private userService: UserService,
    private addressService: AddressService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.fetchMe();
    this.fetchAddresses();

    this.route.queryParams.subscribe((params) => {
      if (
        params['tab'] &&
        ['profile', 'password', 'addresses'].includes(params['tab'])
      ) {
        this.activeTab = params['tab'];
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  fetchMe(): void {
    this.loading = true;
    this.error = null;

    this.userService.me().subscribe({
      next: (user) => {
        if (user) {
          this.me = user;
          this.profileForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message ?? 'Profil bilgisi alınamadı';
        this.loading = false;
      },
    });
  }

  fetchAddresses(): void {
    this.addressService.getMyAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
      },
      error: (err) => {
        this.error = err?.message ?? 'Adresler yüklenemedi';
      },
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const request: UpdateUserRequest = this.profileForm.value;

    this.userService.updateProfile(request).subscribe({
      next: (user) => {
        this.me = user;
        this.successMessage = 'Profil başarıyla güncellendi';
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message ?? 'Profil güncellenemedi';
        this.loading = false;
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const request: ChangePasswordRequest = {
      oldPassword: this.passwordForm.value.oldPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword,
    };

    this.userService.changePassword(request).subscribe({
      next: () => {
        this.successMessage = 'Şifre başarıyla değiştirildi';
        this.passwordForm.reset();
        this.showPasswordForm = false;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message ?? 'Şifre değiştirilemedi';
        this.loading = false;
      },
    });
  }

  setActiveTab(tab: 'profile' | 'password' | 'addresses'): void {
    this.activeTab = tab;
    this.error = null;
    this.successMessage = null;
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm.reset();
    }
  }

  deleteAccount(): void {
    if (
      confirm(
        'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
      )
    ) {
      this.loading = true;
      this.userService.deleteProfile().subscribe({
        next: () => {
          alert('Hesabınız başarıyla silindi');
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error = err?.message ?? 'Hesap silinemedi';
          this.loading = false;
        },
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(form: FormGroup, fieldName: string): string | null {
    const control = form.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) return `${fieldName} zorunludur`;
      if (control.errors['email']) return 'Geçerli bir email adresi giriniz';
      if (control.errors['minlength'])
        return `${fieldName} en az ${control.errors['minlength'].requiredLength} karakter olmalıdır`;
      if (control.errors['mismatch']) return 'Şifreler eşleşmiyor';
    }
    return null;
  }

  setDefaultAddress(addressId: number): void {
    this.addressService.setDefaultAddress(addressId).subscribe({
      next: () => {
        this.fetchAddresses();
        this.successMessage = 'Varsayılan adres başarıyla ayarlandı';
      },
      error: (err) => {
        this.error = err?.message ?? 'Varsayılan adres ayarlanamadı';
      },
    });
  }

  deleteAddress(addressId: number): void {
    if (confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
      this.addressService.deleteAddress(addressId).subscribe({
        next: () => {
          this.fetchAddresses();
          this.successMessage = 'Adres başarıyla silindi';
        },
        error: (err) => {
          this.error = err?.message ?? 'Adres silinemedi';
        },
      });
    }
  }

  formatDate(value: string | Date | undefined | null): string {
    if (!value) return '';
    const asString =
      typeof value === 'string' ? value : new Date(value).toISOString();
    const normalized = asString.replace(/(\.\d{3})\d+Z$/, '$1Z');
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(d.getDate())}/${pad(
      d.getMonth() + 1
    )}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
