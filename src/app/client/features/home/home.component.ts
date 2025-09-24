import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookService } from '../../../core/services/book.service';
import { Book } from '../../../core/models/book.model';
import { BookCardComponent } from '../books/components/book-card/book-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BookCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  loading = false;
  error: string | null = null;
  featuredBooks: Book[] = [];

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadFeaturedBooks();
  }

  private loadFeaturedBooks(): void {
    this.loading = true;
    this.error = null;
    this.bookService.getBooks({ pageNumber: 1, pageSize: 8 }).subscribe({
      next: (books) => {
        this.featuredBooks = books;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message ?? 'Öne çıkan kitaplar yüklenemedi';
        this.loading = false;
      },
    });
  }
}
