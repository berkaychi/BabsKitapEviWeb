import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Category } from '../../../../core/models/category.model';
import { Book } from '../../../../core/models/book.model';
import { CategoryService } from '../../../../core/services/category.service';
import { BookService } from '../../../../core/services/book.service';
import { AdminBookService } from '../../../core/services/admin-book.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogComponent } from '../../../../shared/components/modals/confirm-dialog/confirm-dialog.component';
import { AddBookModalComponent } from '../../../../shared/components/modals/add-book-modal/add-book-modal.component';
import { AssignmentConfigs } from '../../../../shared/components/modals/add-book-modal/models/assignment-config.interface';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss'],
})
export class CategoryDetailComponent implements OnInit, OnDestroy {
  category: Category | null = null;
  books: Book[] = [];
  loading = false;
  booksLoading = false;
  error: string | null = null;
  booksError: string | null = null;
  private categoryId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private bookService: BookService,
    private adminBookService: AdminBookService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.categoryId = +id;
        this.loadCategory();
        this.loadBooks();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategory(): void {
    if (!this.categoryId) return;

    this.loading = true;
    this.error = null;

    this.categoryService
      .getCategoryById(this.categoryId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (category) => {
          this.category = category;
        },
        error: (err) => {
          console.error('Kategori yüklenemedi:', err);
          this.error = 'Kategori bulunamadı.';
        },
      });
  }

  loadBooks(): void {
    if (!this.categoryId) return;

    this.booksLoading = true;
    this.booksError = null;

    this.bookService
      .getBooksByCategory(this.categoryId, { pageNumber: 1, pageSize: 1000 })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.booksLoading = false))
      )
      .subscribe({
        next: (books) => {
          this.books = books;
        },
        error: (err) => {
          console.error('Kategori kitapları yüklenemedi:', err);
          this.booksError = 'Kitaplar yüklenirken bir hata oluştu.';
        },
      });
  }

  removeBookFromCategory(book: Book): void {
    const modalRef = this.modalService.open(ConfirmDialogComponent);
    modalRef.componentInstance.title = 'Kitabı Kategoriden Çıkar';
    modalRef.componentInstance.message = `"${book.title}" kitabını "${this.category?.name}" kategorisinden çıkarmak istediğinizden emin misiniz?`;
    modalRef.componentInstance.confirmText = 'Çıkar';
    modalRef.componentInstance.cancelText = 'Vazgeç';

    modalRef.result.then(
      (result) => {
        if (result && this.categoryId) {
          this.removeBook(book);
        }
      },
      () => {}
    );
  }

  private removeBook(book: Book): void {
    if (!this.categoryId) return;

    const updatedCategoryIds = book.categories
      .filter((cat) => cat.id !== this.categoryId)
      .map((cat) => cat.id);

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
          this.loadBooks();
        },
        error: (err) => {
          console.error('Kitap kategoriden çıkarılamadı:', err);
          alert('Kitap kategoriden çıkarılamadı.');
        },
      });
  }

  addBooks(): void {
    if (!this.category) return;

    const config = AssignmentConfigs.category(
      this.category.id,
      this.category.name
    );

    const modalRef = this.modalService.open(AddBookModalComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.componentInstance.config = config;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadBooks();
        }
      },
      () => {}
    );
  }
}
