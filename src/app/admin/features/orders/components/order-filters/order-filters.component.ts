import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { OrderFilterService } from '../../../../../core/services/order-filter.service';
import {
  OrderFilterState,
  OrderFilterOptions,
} from '../../../../../core/models/order-filter.interface';

@Component({
  selector: 'app-order-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-filters.component.html',
  styleUrls: ['./order-filters.component.scss'],
})
export class OrderFiltersComponent implements OnInit, OnDestroy {
  filterState: OrderFilterState | null = null;
  filterOptions: OrderFilterOptions | null = null;
  isSearching = false;

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(private orderFilterService: OrderFilterService) {}

  ngOnInit(): void {
    this.orderFilterService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.filterState = state;
      });

    this.orderFilterService.options$
      .pipe(takeUntil(this.destroy$))
      .subscribe((options) => {
        this.filterOptions = options;
      });

    this.searchSubject$
      .pipe(takeUntil(this.destroy$), debounceTime(500), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.isSearching = true;
        this.orderFilterService.updateSearchTerm(searchTerm);
        setTimeout(() => {
          this.isSearching = false;
        }, 300);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject$.complete();
  }

  onSearchTermChange(searchTerm: string): void {
    this.searchSubject$.next(searchTerm);
  }

  onStatusChange(status: string): void {
    const statusValue = status ? parseInt(status) : null;
    this.orderFilterService.updateStatus(statusValue);
  }

  onDateRangeChange(startDate: string | null, endDate: string | null): void {
    this.orderFilterService.updateDateRange(startDate, endDate);
  }

  onClearFilters(): void {
    this.orderFilterService.resetFilters();
  }

  hasActiveFilters(): boolean {
    if (!this.filterState) return false;
    return !!(
      this.filterState.searchTerm ||
      this.filterState.status !== null ||
      this.filterState.startDate ||
      this.filterState.endDate ||
      this.filterState.minAmount !== null ||
      this.filterState.maxAmount !== null ||
      this.filterState.userId
    );
  }
}
