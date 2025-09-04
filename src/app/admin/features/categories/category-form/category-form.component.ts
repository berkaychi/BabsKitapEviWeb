import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../../../core/services/category.service';
import { AdminCategoryService } from '../../../core/services/admin-category.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { CreateCategoryRequest } from '../../../../core/models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent implements OnInit, OnDestroy {
  categoryForm!: FormGroup;
  isEditMode = false;
  categoryId?: number;
  loading = false;
  submitting = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private adminCategoryService: AdminCategoryService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  checkEditMode(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.categoryId = +id;
        this.loadCategory();
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
          this.categoryForm.patchValue({ name: category.name });
        },
        error: (err) => {
          this.error = 'Kategori yüklenemedi: ' + err.message;
          this.goBack();
        },
      });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;
    this.submitting = true;
    if (this.isEditMode) {
      const updateCategory = {
        id: this.categoryId!,
        ...this.categoryForm.value,
      };
      this.adminCategoryService
        .updateCategory(updateCategory)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => ((this.submitting = false), (this.loading = false)))
        )
        .subscribe({
          next: () => {
            alert('Kategori başarıyla güncellendi.');
            this.goBack();
          },
          error: (err) => {
            alert('Kategori güncellenemedi');
            this.error = 'Kategori güncellenemedi: ' + err.message;
          },
        });
    } else {
      const newCategory: CreateCategoryRequest = this.categoryForm.value;
      this.adminCategoryService
        .createCategory(newCategory)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.submitting = false))
        )
        .subscribe({
          next: () => {
            alert('Kategori başarıyla oluşturuldu.');
            this.goBack();
          },
          error: (err) => {
            alert('Kategori oluşturulamadı');
            this.error = 'Kategori oluşturulamadı: ' + err.message;
          },
        });
    }
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
