import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Book,
  PagedResponse,
  SearchBookQuery,
} from '../../../../core/models/book.model';
import { Subject } from 'rxjs';
import { BookService } from '../../../../core/services/book.service';
import { AdminBookService } from '../../../core/services/admin-book.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
})
export class BookListComponent implements OnInit, OnDestroy {
  books: Book[] = [];
  loading = false;
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private bookService: BookService,
    private adminBookService: AdminBookService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBooks() {
    this.loading = true;
    const query: SearchBookQuery = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
    };

    this.bookService.searchBooks(query).subscribe({
      next: (response: PagedResponse<Book>) => {
        this.books = response.items;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadBooks();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadBooks();
  }

  deleteBook(book: Book): void {
    if (
      confirm(`"${book.title}" kitabını silmek istediğinizden emin misiniz?`)
    ) {
      this.adminBookService.deleteBook(book.id).subscribe({
        next: () => {
          alert('Kitap başarıyla silindi.');
          this.loadBooks();
        },
        error: (error) => {
          console.error('Error deleting book:', error);
          alert('Kitap silinirken bir hata oluştu.');
        },
      });
    }
  }

  getStockClass(quantity: number): string {
    if (quantity === 0) return 'text-danger fw-bold';
    if (quantity < 10) return 'text-warning fw-bold';
    return 'text-success';
  }
}
