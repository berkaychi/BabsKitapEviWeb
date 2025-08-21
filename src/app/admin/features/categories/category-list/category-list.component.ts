import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Category } from '../../../../core/models/category.model';
import { HttpClient } from '@angular/common/http';
import { AdminCategoryService } from '../../../core/services/admin-category.service';
import { CategoryService } from '../../../../core/services/category.service';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
})
export class CategoryListComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private adminCategoryService: AdminCategoryService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = null;
    this.categoryService
      .getCategories()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (data) => {
          this.categories = data;
        },
        error: (err) => {
          this.error = 'Kategoriler yüklenemedi.';
        },
      });
  }

  deleteCategory(category: Category): void {
    if (
      confirm(
        `"${category.name}" kategorisini silmek istediğinizden emin misiniz?`
      )
    ) {
      this.adminCategoryService.deleteCategory(category.id).subscribe({
        next: () => {
          alert('Kategori başarıyla silindi.');
          this.loadCategories();
        },
        error: (err) => {
          alert('Kategori silinirken bir hata oluştu.');
          console.error(err);
        },
      });
    }
  }
}
