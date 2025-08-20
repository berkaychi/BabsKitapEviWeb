import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AddressService } from '../../../../core/services/address.service';
import {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
} from '../../../../core/models/address.model';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss'],
})
export class AddressFormComponent implements OnInit {
  addressForm: FormGroup;
  loading = false;
  error: string | null = null;
  isEditMode = false;
  addressId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.addressForm = this.fb.group({
      addressName: ['', [Validators.required, Validators.minLength(2)]],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      streetAddress: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      country: ['Türkiye', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\+90\s?\d{3}\s?\d{3}\s?\d{4}$/),
        ],
      ],
      isDefault: [false],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.addressId = +params['id'];
        this.loadAddress();
      }
    });
  }

  loadAddress(): void {
    if (!this.addressId) return;

    this.loading = true;
    this.addressService.getAddress(this.addressId).subscribe({
      next: (address) => {
        this.addressForm.patchValue(address);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message ?? 'Adres yüklenemedi';
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.addressForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.addressForm.value;

    if (this.isEditMode && this.addressId) {
      const updateRequest: UpdateAddressRequest = formValue;
      this.addressService
        .updateAddress(this.addressId, updateRequest)
        .subscribe({
          next: () => {
            this.router.navigate(['/profile'], { fragment: 'addresses' });
          },
          error: (err) => {
            this.error = err?.message ?? 'Adres güncellenemedi';
            this.loading = false;
          },
        });
    } else {
      const createRequest: CreateAddressRequest = formValue;
      this.addressService.createAddress(createRequest).subscribe({
        next: () => {
          this.router.navigate(['/profile'], { fragment: 'addresses' });
        },
        error: (err) => {
          this.error = err?.message ?? 'Adres oluşturulamadı';
          this.loading = false;
        },
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.addressForm.controls).forEach((key) => {
      const control = this.addressForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.addressForm.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) return `${fieldName} zorunludur`;
      if (control.errors['minlength'])
        return `${fieldName} en az ${control.errors['minlength'].requiredLength} karakter olmalıdır`;
      if (control.errors['pattern']) {
        if (fieldName === 'zipCode')
          return 'Geçerli bir posta kodu giriniz (5 haneli)';
        if (fieldName === 'phoneNumber')
          return 'Geçerli bir telefon numarası giriniz (+90 555 123 4567)';
      }
    }
    return null;
  }
}
