import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AddressService } from '../../../../core/services/address.service';
import { Address } from '../../../../core/models/address.model';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.scss'],
})
export class AddressListComponent implements OnInit {
  addresses: Address[] = [];
  loading = false;
  error: string | null = null;

  constructor(private addressService: AddressService, private router: Router) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.loading = true;
    this.error = null;

    this.addressService.getMyAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message ?? 'Adresler yüklenemedi';
        this.loading = false;
      },
    });
  }

  setDefaultAddress(addressId: number): void {
    this.addressService.setDefaultAddress(addressId).subscribe({
      next: () => {
        this.loadAddresses();
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
          this.loadAddresses();
        },
        error: (err) => {
          this.error = err?.message ?? 'Adres silinemedi';
        },
      });
    }
  }
}
