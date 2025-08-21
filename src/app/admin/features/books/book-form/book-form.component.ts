import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Publisher } from '../../../../core/models/publisher.model';
import { Category } from '../../../../core/models/category.model';
import { AdminBookService } from '../../../core/services/admin-book.service';
import { BookService } from '../../../../core/services/book.service';
import { CategoryService } from '../../../../core/services/category.service';
import { PublisherService } from '../../../../core/services/publisher.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, Subject, timeout, catchError, of } from 'rxjs';
import {
  CreateBookRequest,
  UpdateBookRequest,
} from '../../../../core/models/book.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.scss',
})
export class BookFormComponent implements OnInit, OnDestroy {
  bookForm!: FormGroup;
  categories: Category[] = [];
  publishers: Publisher[] = [];
  selectedCategoryIds: number[] = [];
  selectedPublisherIds: number[] = [];
  isEditMode = false;
  bookId?: number;
  loading = true;
  submitting = false;
  submittingImage = false;
  selectedImageFile?: File;
  currentImageUrl?: string;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private adminBookService: AdminBookService,
    private bookService: BookService,
    private categoryService: CategoryService,
    private publisherService: PublisherService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.submitting = false; // Ensure submitting is false on init
    this.submittingImage = false; // Ensure image submitting is false on init
    this.initializeForm();
    this.bookId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.bookId;
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      author: ['', [Validators.required, Validators.maxLength(100)]],
      isbn: ['', [Validators.required]],
      publishedDate: ['', Validators.required],
      description: [''],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
    });
  }

  loadInitialData(): void {
    const dataSources = {
      categories: this.categoryService.getCategories().pipe(
        timeout(10000),
        catchError((err) => {
          console.error('Categories API error:', err);
          return of([]);
        })
      ),
      publishers: this.publisherService.getPublishers().pipe(
        timeout(10000),
        catchError((err) => {
          console.error('Publishers API error:', err);
          return of([]);
        })
      ),
    };

    forkJoin(dataSources).subscribe({
      next: (data) => {
        this.categories = data.categories;
        this.publishers = data.publishers;
        if (this.isEditMode && this.bookId) {
          this.loadBook();
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading form data:', err);
        alert('Kategoriler ve yayınevleri yüklenemedi.');
        this.loading = false;
      },
    });
  }

  loadBook(): void {
    if (!this.bookId) {
      console.error('No bookId provided for edit mode');
      this.loading = false;
      return;
    }

    this.bookService
      .getBookById(this.bookId)
      .pipe(
        timeout(10000),
        catchError((err) => {
          console.error('Book API error:', err);
          alert('Kitap bilgileri yüklenirken bir hata oluştu.');
          this.loading = false;
          this.goBack();
          return of(null);
        })
      )
      .subscribe({
        next: (book) => {
          if (book) {
            this.bookForm.patchValue({
              ...book,
              publishedDate: book.publishedDate
                ? book.publishedDate.split('T')[0]
                : '',
            });

            // Safe mapping for categories and publishers
            this.selectedCategoryIds =
              book.categories && Array.isArray(book.categories)
                ? book.categories.map((c) => c.id)
                : [];
            this.selectedPublisherIds =
              book.publishers && Array.isArray(book.publishers)
                ? book.publishers.map((p) => p.id)
                : [];
            this.currentImageUrl = book.imageUrl;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading book:', err);
          alert('Kitap bilgileri yüklenirken bir hata oluştu.');
          this.loading = false;
          this.goBack();
        },
      });
  }

  onCategoryChange(categoryId: number, event: any): void {
    if (event.target.checked) {
      this.selectedCategoryIds.push(categoryId);
    } else {
      this.selectedCategoryIds = this.selectedCategoryIds.filter(
        (id) => id !== categoryId
      );
    }
  }

  onPublisherChange(publisherId: number, event: any): void {
    if (event.target.checked) {
      this.selectedPublisherIds.push(publisherId);
    } else {
      this.selectedPublisherIds = this.selectedPublisherIds.filter(
        (id) => id !== publisherId
      );
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.currentImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    if (this.isEditMode) {
      this.updateBook();
    } else {
      this.createBook();
    }
  }

  private createBook(): void {
    const request: CreateBookRequest = {
      ...this.bookForm.value,
      categoryIds: this.selectedCategoryIds,
      publisherIds: this.selectedPublisherIds,
      imageFile: this.selectedImageFile,
    };

    this.adminBookService.createBook(request).subscribe({
      next: () => {
        this.submitting = false;
        alert('Kitap başarıyla oluşturuldu.');
        this.goBack();
      },
      error: (err) => {
        console.error('Error creating book:', err);
        alert('Kitap oluşturulurken bir hata oluştu.');
        this.submitting = false;
      },
    });
  }

  private updateBook(): void {
    if (!this.bookId) return;

    const request: UpdateBookRequest = {
      ...this.bookForm.value,
      categoryIds: this.selectedCategoryIds,
      publisherIds: this.selectedPublisherIds,
    };

    this.adminBookService.updateBook(this.bookId, request).subscribe({
      next: () => {
        this.submitting = false;
        alert('Kitap bilgileri başarıyla güncellendi.');
        this.goBack();
      },
      error: (err) => {
        console.error('Error updating book:', err);
        alert('Kitap güncellenirken bir hata oluştu.');
        this.submitting = false;
      },
    });
  }

  updateBookImage(): void {
    if (!this.bookId || !this.selectedImageFile) {
      alert('Lütfen bir resim seçin.');
      return;
    }

    this.submittingImage = true;
    this.adminBookService
      .updateBookImage(this.bookId, this.selectedImageFile)
      .subscribe({
        next: () => {
          this.submittingImage = false;
          alert('Kitap resmi başarıyla güncellendi.');
          // Reset the selected file after successful update
          this.selectedImageFile = undefined;
        },
        error: (err) => {
          console.error('Error updating book image:', err);
          alert('Kitap resmi güncellenirken bir hata oluştu.');
          this.submittingImage = false;
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/admin/books']);
  }
}
