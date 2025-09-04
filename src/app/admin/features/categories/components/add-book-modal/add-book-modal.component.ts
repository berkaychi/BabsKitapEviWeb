import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Book } from '../../../../../core/models/book.model';
import { BookService } from '../../../../../core/services/book.service';
import { AdminBookService } from '../../../../core/services/admin-book.service';
import { SearchBookQuery } from '../../../../../core/models/book.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-add-book-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-book-modal.component.html',
  styleUrls: ['./add-book-modal.component.scss'],
})
export class AddBookModalComponent implements OnInit {
  @Input() categoryId: number = 0;
  @Input() categoryName: string = '';

  books: Book[] = [];
  selectedBooks: Set<number> = new Set();
  loading = false;
  error: string | null = null;

  searchQuery: SearchBookQuery = {
    pageNumber: 1,
    pageSize: 20,
    searchTerm: '',
  };

  constructor(
    public activeModal: NgbActiveModal,
    private bookService: BookService,
    private adminBookService: AdminBookService
  ) {}

  ngOnInit(): void {
    this.searchBooks();
  }

  searchBooks(): void {
    this.loading = true;
    this.error = null;

    this.bookService
      .searchBooks(this.searchQuery)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.books = response.items.filter(
            (book) => !book.categories.some((cat) => cat.id === this.categoryId)
          );
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

    const selectedBookIds = Array.from(this.selectedBooks);
    let completedCount = 0;
    let errorCount = 0;

    selectedBookIds.forEach((bookId) => {
      const book = this.books.find((b) => b.id === bookId);
      if (book) {
        const updatedCategoryIds = [
          ...book.categories.map((c) => c.id),
          this.categoryId,
        ];

        this.adminBookService
          .updateBook(book.id, {
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            publishedDate: book.publishedDate,
            description: book.description,
            stockQuantity: book.stockQuantity,
            price: book.price,
            categoryIds: updatedCategoryIds,
          })
          .subscribe({
            next: () => {
              completedCount++;
              if (completedCount + errorCount === selectedBookIds.length) {
                this.showResultMessage(completedCount, errorCount);
                if (errorCount === 0) {
                  this.activeModal.close(true);
                }
              }
            },
            error: (err) => {
              console.error(`Kitap ${book.title} eklenirken hata:`, err);
              errorCount++;
              if (completedCount + errorCount === selectedBookIds.length) {
                this.showResultMessage(completedCount, errorCount);
                if (completedCount > 0) {
                  this.activeModal.close(true);
                }
              }
            },
          });
      }
    });
  }

  private showResultMessage(successCount: number, errorCount: number): void {
    if (errorCount === 0) {
      alert(`${successCount} kitap başarıyla kategoriye eklendi.`);
    } else if (successCount === 0) {
      alert('Kitaplar eklenirken hata oluştu.');
    } else {
      alert(
        `${successCount} kitap başarıyla eklendi, ${errorCount} kitap eklenemedi.`
      );
    }
  }

  cancel(): void {
    this.activeModal.dismiss(false);
  }

  getCategoryNames(book: Book): string {
    if (!book.categories || book.categories.length === 0) {
      return 'Kategorisiz';
    }
    return book.categories.map((c) => c.name).join(', ');
  }
}
