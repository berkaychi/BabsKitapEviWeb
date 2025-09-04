import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Publisher } from '../../../../core/models/publisher.model';
import { Book } from '../../../../core/models/book.model';
import { PublisherService } from '../../../../core/services/publisher.service';
import { BookAssignmentService } from '../../../../shared/components/modals/add-book-modal/services/book-assignment.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogComponent } from '../../../../shared/components/modals/confirm-dialog/confirm-dialog.component';
import { AddBookModalComponent } from '../../../../shared/components/modals/add-book-modal/add-book-modal.component';
import { AssignmentConfigs } from '../../../../shared/components/modals/add-book-modal/models/assignment-config.interface';

@Component({
  selector: 'app-publisher-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './publisher-detail.component.html',
  styleUrls: ['./publisher-detail.component.scss'],
})
export class PublisherDetailComponent implements OnInit, OnDestroy {
  publisher: Publisher | null = null;
  books: Book[] = [];
  loading = false;
  booksLoading = false;
  error: string | null = null;
  booksError: string | null = null;
  private publisherId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private publisherService: PublisherService,
    private bookAssignmentService: BookAssignmentService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.publisherId = +id;
        this.loadPublisher();
        this.loadBooks();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPublisher(): void {
    if (!this.publisherId) return;

    this.loading = true;
    this.error = null;

    this.publisherService
      .getPublisherById(this.publisherId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (publisher) => {
          this.publisher = publisher;
        },
        error: (err) => {
          console.error('Yayınevi yüklenemedi:', err);
          this.error = 'Yayınevi bulunamadı.';
        },
      });
  }

  loadBooks(): void {
    if (!this.publisherId) return;

    this.booksLoading = true;
    this.booksError = null;

    this.bookAssignmentService
      .getBooksByTarget(this.publisherId, 'publisher', {
        pageNumber: 1,
        pageSize: 1000,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.booksLoading = false))
      )
      .subscribe({
        next: (books) => {
          this.books = books;
        },
        error: (err) => {
          console.error('Yayınevi kitapları yüklenemedi:', err);
          this.booksError = 'Kitaplar yüklenirken bir hata oluştu.';
        },
      });
  }

  removeBookFromPublisher(book: Book): void {
    const modalRef = this.modalService.open(ConfirmDialogComponent);
    modalRef.componentInstance.title = 'Kitabı Yayınevinden Çıkar';
    modalRef.componentInstance.message = `"${book.title}" kitabını "${this.publisher?.name}" yayınevinden çıkarmak istediğinizden emin misiniz?`;
    modalRef.componentInstance.confirmText = 'Çıkar';
    modalRef.componentInstance.cancelText = 'Vazgeç';

    modalRef.result.then((result) => {
      if (result && this.publisherId) {
        this.removeBook(book);
      }
    });
  }

  private removeBook(book: Book): void {
    if (!this.publisher) return;

    const config = AssignmentConfigs.publisher(
      this.publisher.id,
      this.publisher.name
    );

    this.bookAssignmentService.removeBookFromTarget(book, config).subscribe({
      next: (result) => {
        if (result.success) {
          this.loadBooks();
        } else {
          alert(result.message || 'Kitap yayınevinden çıkarılamadı.');
        }
      },
      error: (err) => {
        console.error('Kitap çıkarma hatası:', err);
        alert('Kitap yayınevinden çıkarılamadı.');
      },
    });
  }

  addBooks(): void {
    if (!this.publisher) return;

    const config = AssignmentConfigs.publisher(
      this.publisher.id,
      this.publisher.name
    );

    const modalRef = this.modalService.open(AddBookModalComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.componentInstance.config = config;

    modalRef.result.then((result) => {
      if (result) {
        this.loadBooks();
      }
    });
  }
}
