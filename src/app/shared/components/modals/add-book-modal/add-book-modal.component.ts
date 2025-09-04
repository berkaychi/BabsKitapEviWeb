import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Book, SearchBookQuery } from '../../../../core/models/book.model';
import {
  AssignmentConfig,
  AssignmentFilter,
  BookAssignmentResult,
} from './models/assignment-config.interface';
import { BookAssignmentService } from './services/book-assignment.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-add-book-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-book-modal.component.html',
  styleUrls: ['./add-book-modal.component.scss'],
})
export class AddBookModalComponent implements OnInit {
  @Input() config!: AssignmentConfig;

  books: Book[] = [];
  selectedBooks: Set<number> = new Set();
  loading = false;
  assigning = false;
  error: string | null = null;

  searchQuery: SearchBookQuery = {
    pageNumber: 1,
    pageSize: 20,
    searchTerm: '',
  };

  constructor(
    public activeModal: NgbActiveModal,
    private bookAssignmentService: BookAssignmentService
  ) {}

  ngOnInit(): void {
    this.searchBooks();
  }

  searchBooks(): void {
    this.loading = true;
    this.error = null;

    const filter: AssignmentFilter = {
      excludeAssignedToTarget: true,
      searchTerm: this.searchQuery.searchTerm,
    };

    this.bookAssignmentService
      .searchBooks(this.config, filter)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (books) => {
          this.books = books;
        },
        error: (err) => {
          console.error('Kitaplar aranırken hata oluştu:', err);
          this.error = 'Kitaplar yüklenirken bir hata oluştu.';
        },
      });
  }

  onSearchTermChange(): void {
    this.searchQuery.pageNumber = 1;
    this.searchBooks();
  }

  toggleBookSelection(book: Book): void {
    if (this.selectedBooks.has(book.id)) {
      this.selectedBooks.delete(book.id);
    } else {
      this.selectedBooks.add(book.id);
    }
  }

  isBookSelected(book: Book): boolean {
    return this.selectedBooks.has(book.id);
  }

  addSelectedBooks(): void {
    if (this.selectedBooks.size === 0) {
      alert('Lütfen en az bir kitap seçin.');
      return;
    }

    this.assigning = true;
    const selectedBookIds = Array.from(this.selectedBooks);

    this.bookAssignmentService
      .assignBooksToTarget(selectedBookIds, this.config)
      .subscribe({
        next: (results: BookAssignmentResult[]) => {
          const successCount = results.filter((r) => r.success).length;
          const errorCount = results.filter((r) => !r.success).length;

          this.showResultMessage(successCount, errorCount);

          if (successCount > 0) {
            this.activeModal.close(true);
          }
        },
        error: (err) => {
          console.error('Kitap atama hatası:', err);
          alert('Kitaplar atanırken beklenmedik bir hata oluştu.');
        },
        complete: () => {
          this.assigning = false;
        },
      });
  }

  private showResultMessage(successCount: number, errorCount: number): void {
    if (errorCount === 0) {
      alert(
        this.config.successMessage.replace('{count}', successCount.toString())
      );
    } else if (successCount === 0) {
      alert('Kitaplar atanırken hata oluştu.');
    } else {
      alert(
        `${successCount} kitap başarıyla atandı, ${errorCount} kitap atanamadı.`
      );
    }
  }

  cancel(): void {
    this.activeModal.dismiss(false);
  }

  getTargetNames(book: Book): string {
    switch (this.config.type) {
      case 'category':
        if (!book.categories || book.categories.length === 0) {
          return 'Kategorisiz';
        }
        return book.categories.map((c) => c.name).join(', ');
      case 'publisher':
        if (!book.publishers || book.publishers.length === 0) {
          return 'Yayınevisiz';
        }
        return book.publishers.map((p) => p.name).join(', ');
      default:
        return '';
    }
  }
}
