import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { BookFilterService } from '../../../../../core/services/book-filter.service';
import {
  BookFilterState,
  BookFilterOptions,
} from '../../../../../core/models/book-filter.interface';

@Component({
  selector: 'app-book-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-filters.component.html',
  styleUrls: ['./book-filters.component.scss'],
})
export class BookFiltersComponent implements OnInit, OnDestroy {
  filterState: BookFilterState | null = null;
  filterOptions: BookFilterOptions | null = null;
  private destroy$ = new Subject<void>();

  constructor(private filterService: BookFilterService) {}

  ngOnInit(): void {
    this.filterService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => (this.filterState = state));

    this.filterService.options$
      .pipe(takeUntil(this.destroy$))
      .subscribe((options) => (this.filterOptions = options));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCategoryChange(categoryId: number | null): void {
    this.filterService.updateCategory(categoryId);
  }

  onPublisherChange(publisherId: number | null): void {
    this.filterService.updatePublisher(publisherId);
  }

  onMinPriceChange(value: string): void {
    const minPrice = value ? parseFloat(value) : null;
    this.filterService.updatePriceRange(
      minPrice,
      this.filterState?.maxPrice || null
    );
  }

  onMaxPriceChange(value: string): void {
    const maxPrice = value ? parseFloat(value) : null;
    this.filterService.updatePriceRange(
      this.filterState?.minPrice || null,
      maxPrice
    );
  }

  clearFilters(): void {
    this.filterService.resetFilters();
  }

  clearPriceFilter(): void {
    this.filterService.clearPriceFilter();
  }

  get hasActiveFilters(): boolean {
    if (!this.filterState) return false;
    return !!(
      this.filterState.searchTerm ||
      this.filterState.categoryId ||
      this.filterState.publisherId ||
      this.filterState.minPrice ||
      this.filterState.maxPrice
    );
  }

  get selectedCategoryName(): string {
    if (!this.filterState?.categoryId || !this.filterOptions?.categories)
      return '';
    const category = this.filterOptions.categories.find(
      (c) => c.id === this.filterState!.categoryId
    );
    return category?.name || '';
  }

  get selectedPublisherName(): string {
    if (!this.filterState?.publisherId || !this.filterOptions?.publishers)
      return '';
    const publisher = this.filterOptions.publishers.find(
      (p) => p.id === this.filterState!.publisherId
    );
    return publisher?.name || '';
  }
}
