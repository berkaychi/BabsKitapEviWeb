import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { Book } from '../../../../core/models/book.model';
import { BookService } from '../../../../core/services/book.service';
import { CartService } from '../../../../core/services/cart.service';
import { CartItem } from '../../../../core/models/cart.model';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogComponent } from '../../../../shared/components/modals/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss'],
})
export class BookDetailComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  book: Book | null = null;
  cartItem: CartItem | null = null;

  private subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private cartService: CartService,
    private router: Router,
    private modal: NgbModal
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Geçersiz kitap kimliği';
      return;
    }
    this.fetchBook(id);
  }

  private fetchBook(id: number): void {
    this.loading = true;
    this.error = null;

    const bookSub = this.bookService.getBookById(id).subscribe({
      next: (book) => {
        this.book = book;
        this.loading = false;

        const cartFetchSub = this.cartService.fetchCart().subscribe();
        this.subs.add(cartFetchSub);

        const cartSub = this.cartService.cart$.subscribe((cart) => {
          if (!this.book || !cart) {
            this.cartItem = null;
            return;
          }
          this.cartItem =
            cart.items.find((i) => i.bookId === this.book!.id) ?? null;
        });
        this.subs.add(cartSub);
      },
      error: (err) => {
        this.error = err?.message ?? 'Kitap bilgisi alınamadı';
        this.loading = false;
      },
    });

    this.subs.add(bookSub);
  }

  onAddToCart(): void {
    if (!this.book) return;
    this.cartService.addItem({ bookId: this.book.id, quantity: 1 }).subscribe();
  }

  onIncrease(): void {
    if (!this.book || !this.cartItem) return;

    const next = this.cartItem.quantity + 1;

    if (this.book.stockQuantity != null && next > this.book.stockQuantity) {
      this.error = 'Stokta yeterli kitap bulunmamaktadır';
      return;
    }

    this.cartService.updateItem(this.book.id, { quantity: next }).subscribe();
  }

  onDecrease(): void {
    if (!this.book || !this.cartItem) return;

    const next = this.cartItem.quantity - 1;
    if (next <= 0) {
      const ref = this.modal.open(ConfirmDialogComponent, { centered: true });
      ref.componentInstance.title = 'Onay';
      ref.componentInstance.message =
        'Ürünü sepetten çıkarmak istediğinize emin misiniz?';
      ref.componentInstance.confirmText = 'Evet';
      ref.componentInstance.cancelText = 'Vazgeç';

      ref.result
        .then((confirmed: boolean) => {
          if (confirmed) {
            this.cartService.removeItem(this.book!.id).subscribe();
          }
        })
        .catch(() => {});
    } else {
      this.cartService.updateItem(this.book.id, { quantity: next }).subscribe();
    }
  }

  onRemove(): void {
    if (!this.book) return;
    const ref = this.modal.open(ConfirmDialogComponent, { centered: true });
    ref.componentInstance.title = 'Onay';
    ref.componentInstance.message =
      'Ürünü sepetten çıkarmak istediğinize emin misiniz?';
    ref.componentInstance.confirmText = 'Evet';
    ref.componentInstance.cancelText = 'Vazgeç';

    ref.result
      .then((confirmed: boolean) => {
        if (confirmed) {
          this.cartService.removeItem(this.book!.id).subscribe();
        }
      })
      .catch(() => {});
  }

  onGoToCart(): void {
    this.router.navigate(['/cart']);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
