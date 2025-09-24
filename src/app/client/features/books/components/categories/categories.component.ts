import { Component, OnInit } from '@angular/core';
import { Category } from '../../../../../core/models/category.model';
import { CategoryService } from '../../../../../core/services/category.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  isLoading = false;
  categories: Category[] = [];
  error: string | null = null;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.error = null;
    this.categoryService
      .getCategories()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.categories = data;
        },
        error: (err) => {
          this.error = 'Kategoriler yüklenirken bir hata oluştu.';
          console.error('Kategoriler yüklenemedi:', err);
        },
      });
  }

  trackByCategoryId(index: number, category: Category): number {
    return category.id;
  }
}
