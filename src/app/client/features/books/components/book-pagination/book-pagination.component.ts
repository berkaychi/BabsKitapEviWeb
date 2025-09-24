import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { BookFilterService } from '../../../../../core/services/book-filter.service';
import { BookFilterState } from '../../../../../core/models/book-filter.interface';
import { PagedResponse } from '../../../../../core/models/book.model';

@Component({
  selector: 'app-book-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-pagination.component.html',
  styleUrls: ['./book-pagination.component.scss'],
})
export class BookPaginationComponent implements OnInit, OnDestroy {
  @Input() pagedResponse: PagedResponse<any> | null = null;

  filterState: BookFilterState | null = null;
  private destroy$ = new Subject<void>();

  constructor(private filterService: BookFilterService) {}

  ngOnInit(): void {
    this.filterService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => (this.filterState = state));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageChange(page: number): void {
    if (page < 1) return;
    this.filterService.updatePageNumber(page);
  }

  get currentPage(): number {
    return this.filterState?.pageNumber || 1;
  }

  get hasNextPage(): boolean {
    return this.pagedResponse?.hasNextPage || false;
  }

  get hasPreviousPage(): boolean {
    return this.pagedResponse?.hasPreviousPage || false;
  }

  get totalPages(): number {
    return this.pagedResponse?.totalPages || 0;
  }

  get pageNumbers(): number[] {
    if (!this.pagedResponse) return [];

    const current = this.currentPage;
    const total = this.totalPages;
    const pages: number[] = [];

    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  get showFirstLastButtons(): boolean {
    return this.totalPages > 5;
  }
}
