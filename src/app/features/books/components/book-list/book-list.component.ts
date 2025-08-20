import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, switchMap, finalize } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Book, PagedResponse } from '../../../../core/models/book.model';
import { BookService } from '../../../../core/services/book.service';
import { BookCardComponent } from '../book-card/book-card.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { BookFiltersComponent } from '../book-filters/book-filters.component';
import { BookSortingComponent } from '../book-sorting/book-sorting.component';
import { BookPaginationComponent } from '../book-pagination/book-pagination.component';
import { BookFilterService } from '../../../../core/services/book-filter.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    BookCardComponent,
    LoadingComponent,
    BookFiltersComponent,
    BookSortingComponent,
    BookPaginationComponent,
  ],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss'],
})
export class BookListComponent implements OnInit, OnDestroy {
  books: Book[] = [];
  pagedResponse: PagedResponse<Book> | null = null;
  loading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private bookService: BookService,
    private filterService: BookFilterService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.filterService.initializeFromRoute(this.route);
    this.setupBookSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupBookSubscription(): void {
    this.filterService.searchQuery$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((query) => {
          this.loading = true;
          this.error = null;
          return this.bookService.searchBooks(query).pipe(
            finalize(() => {
              this.loading = false;
            })
          );
        })
      )
      .subscribe({
        next: (response) => {
          this.pagedResponse = response;
          this.books = response.items;
        },
        error: (err) => {
          this.error = err?.message ?? 'Kitaplar yüklenemedi';
          this.books = [];
          this.pagedResponse = null;
        },
      });
  }

  get totalCount(): number {
    return this.pagedResponse?.totalCount || 0;
  }
}
