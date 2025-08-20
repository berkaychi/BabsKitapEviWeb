import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Book } from '../../../../core/models/book.model';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
})
export class BookCardComponent {
  @Input() book!: Book;

  constructor(private cartService: CartService) {}

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.cartService.addItem({ bookId: this.book.id, quantity: 1 }).subscribe();
  }
}
