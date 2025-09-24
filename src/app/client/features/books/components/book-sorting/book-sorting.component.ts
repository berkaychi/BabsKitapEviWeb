import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { BookFilterService } from '../../../../../core/services/book-filter.service';
import {
  BookFilterState,
  BookFilterOptions,
} from '../../../../../core/models/book-filter.interface';
import {
  BookSortBy,
  SortDirection,
} from '../../../../../core/models/book.model';

@Component({
  selector: 'app-book-sorting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-sorting.component.html',
  styleUrls: ['./book-sorting.component.scss'],
})
export class BookSortingComponent implements OnInit, OnDestroy {
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

  onSortByChange(sortBy: BookSortBy): void {
    if (this.filterState) {
      this.filterService.updateSorting(sortBy, this.filterState.sortDirection);
    }
  }

  onSortDirectionChange(direction: SortDirection): void {
    if (this.filterState) {
      this.filterService.updateSorting(this.filterState.sortBy, direction);
    }
  }

  onPageSizeChange(pageSize: number): void {
    this.filterService.updatePageSize(pageSize);
  }
}
