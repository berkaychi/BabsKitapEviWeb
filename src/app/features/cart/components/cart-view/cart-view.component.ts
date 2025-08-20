import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { Cart } from '../../../../core/models/cart.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogComponent } from '../../../../shared/components/modals/confirm-dialog/confirm-dialog.component';
import { BookService } from '../../../../core/services/book.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-cart-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.scss'],
})
export class CartViewComponent implements OnInit {
  loading = false;
  error: string | null = null;
  cart: Cart | null = null;

  imageCache: Record<number, string> = {};

  constructor(
    private cartService: CartService,
    private modal: NgbModal,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.cartService.fetchCart().subscribe({
      next: () => {
        this.cartService.cart$.subscribe((c) => {
          this.cart = c;
          this.loadItemImages();
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message ?? 'Sepet bilgisi alınamadı';
        this.loading = false;
      },
    });
  }

  private loadItemImages(): void {
    if (!this.cart || this.cart.items.length === 0) return;
    const missingIds = this.cart.items
      .filter((i) => !this.imageCache[i.bookId])
      .map((i) => i.bookId);
    if (missingIds.length === 0) return;
    forkJoin(missingIds.map((id) => this.bookService.getBookById(id))).subscribe({
      next: (books) => {
        for (const b of books) {
          this.imageCache[b.id] = b.imageUrl || 'https://via.placeholder.com/56x72?text=No+Image';
        }
      },
    });
  }

  increase(bookId: number): void {
    if (!this.cart) return;
    const item = this.cart.items.find((i) => i.bookId === bookId);
    if (!item) return;
    this.cartService
      .updateItem(bookId, { quantity: item.quantity + 1 })
      .subscribe();
  }

  decrease(bookId: number): void {
    if (!this.cart) return;
    const item = this.cart.items.find((i) => i.bookId === bookId);
    if (!item) return;
    const nextQty = Math.max(0, item.quantity - 1);
    if (nextQty == 0) {
      const ref = this.modal.open(ConfirmDialogComponent, { centered: true });
      ref.componentInstance.title = 'Onay';
      ref.componentInstance.message =
        'Ürünü sepetten çıkarmak istediğinize emin misiniz?';
      ref.componentInstance.confirmText = 'Evet';
      ref.componentInstance.cancelText = 'Vazgeç';
      ref.result
        .then((confirmed: boolean) => {
          if (confirmed) {
            this.cartService.removeItem(bookId).subscribe();
          }
        })
        .catch(() => {});
      return;
    }
    this.cartService.updateItem(bookId, { quantity: nextQty }).subscribe();
  }

  remove(bookId: number): void {
    const ref = this.modal.open(ConfirmDialogComponent, { centered: true });
    ref.componentInstance.title = 'Onay';
    ref.componentInstance.message =
      'Sepetten kaldırmak istediğinize emin misiniz?';
    ref.componentInstance.confirmText = 'Evet';
    ref.componentInstance.cancelText = 'Vazgeç';
    ref.result
      .then((confirmed: boolean) => {
        if (confirmed) {
          this.cartService.removeItem(bookId).subscribe();
        }
      })
      .catch(() => {});
  }

  get subtotal(): number {
    if (!this.cart) return 0;
    return this.cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  }

  isInCart(bookId: number): boolean {
    return this.cart?.items.some((i) => i.bookId === bookId) ?? false;
  }
}
