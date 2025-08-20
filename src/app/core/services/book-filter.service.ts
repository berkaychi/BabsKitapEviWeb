import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BookFilterState,
  BookFilterOptions,
  FilterChangeEvent,
} from '../models/book-filter.interface';
import {
  BookSortBy,
  SortDirection,
  SearchBookQuery,
} from '../models/book.model';
import { CategoryService } from './category.service';
import { PublisherService } from './publisher.service';
import { BookService } from './book.service';

@Injectable({
  providedIn: 'root',
})
export class BookFilterService {
  private readonly initialState: BookFilterState = {
    searchTerm: null,
    categoryId: null,
    publisherId: null,
    minPrice: null,
    maxPrice: null,
    sortBy: BookSortBy.PUBLISHED_DATE,
    sortDirection: SortDirection.DESC,
    pageNumber: 1,
    pageSize: 12,
  };

  private filterState$ = new BehaviorSubject<BookFilterState>(
    this.initialState
  );

  private filterOptions$ = new BehaviorSubject<BookFilterOptions>({
    categories: [],
    publishers: [],
    sortOptions: [],
    sortDirectionOptions: [],
  });

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private publisherService: PublisherService,
    private bookService: BookService
  ) {
    this.loadFilterOptions();
  }

  get state$(): Observable<BookFilterState> {
    return this.filterState$.asObservable();
  }

  get options$(): Observable<BookFilterOptions> {
    return this.filterOptions$.asObservable();
  }

  get searchQuery$(): Observable<SearchBookQuery> {
    return this.filterState$.pipe(
      map((state) => this.buildSearchQuery(state)),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );
  }

  get currentState(): BookFilterState {
    return this.filterState$.value;
  }

  initializeFromRoute(route: ActivatedRoute): void {
    combineLatest([route.paramMap, route.queryParams]).subscribe(
      ([params, queryParams]) => {
        const state = { ...this.initialState };

        const categoryId = params.get('categoryId');
        const publisherId = params.get('publisherId');

        if (categoryId) state.categoryId = +categoryId;
        if (publisherId) state.publisherId = +publisherId;

        if (queryParams['search']) state.searchTerm = queryParams['search'];
        if (queryParams['minPrice']) state.minPrice = +queryParams['minPrice'];
        if (queryParams['maxPrice']) state.maxPrice = +queryParams['maxPrice'];
        if (queryParams['sortBy']) state.sortBy = queryParams['sortBy'];
        if (queryParams['sortDirection'])
          state.sortDirection = queryParams['sortDirection'];
        if (queryParams['page']) state.pageNumber = +queryParams['page'];
        if (queryParams['pageSize']) state.pageSize = +queryParams['pageSize'];

        this.filterState$.next(state);
      }
    );
  }

  updateSearchTerm(searchTerm: string): void {
    this.updateState({ searchTerm, pageNumber: 1 });
  }

  updateCategory(categoryId: number | null): void {
    this.updateState({ categoryId, pageNumber: 1 });
  }

  updatePublisher(publisherId: number | null): void {
    this.updateState({ publisherId, pageNumber: 1 });
  }

  updatePriceRange(minPrice: number | null, maxPrice: number | null): void {
    this.updateState({ minPrice, maxPrice, pageNumber: 1 });
  }

  updateSorting(sortBy: BookSortBy, sortDirection: SortDirection): void {
    this.updateState({ sortBy, sortDirection, pageNumber: 1 });
  }

  updatePageNumber(pageNumber: number): void {
    this.updateState({ pageNumber });
  }

  updatePageSize(pageSize: number): void {
    this.updateState({ pageSize, pageNumber: 1 });
  }

  resetFilters(): void {
    const resetState = {
      ...this.initialState,
      pageSize: this.currentState.pageSize,
    };
    this.filterState$.next(resetState);
    this.updateUrl();
  }

  clearPriceFilter(): void {
    this.updateState({ minPrice: null, maxPrice: null, pageNumber: 1 });
    this.updateUrl();
  }

  updateUrl(): void {
    const state = this.currentState;
    const queryParams: any = {};

    queryParams.search = state.searchTerm || null;
    queryParams.minPrice = state.minPrice;
    queryParams.maxPrice = state.maxPrice;
    if (state.sortBy !== BookSortBy.PUBLISHED_DATE)
      queryParams.sortBy = state.sortBy;
    if (state.sortDirection !== SortDirection.DESC)
      queryParams.sortDirection = state.sortDirection;
    if (state.pageNumber > 1) queryParams.page = state.pageNumber;
    if (state.pageSize !== 12) queryParams.pageSize = state.pageSize;

    let navigationPath: any[] = ['/books'];
    if (state.categoryId) {
      navigationPath = ['/books/category', state.categoryId];
    } else if (state.publisherId) {
      navigationPath = ['/books/publisher', state.publisherId];
    }

    this.router.navigate(navigationPath, {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  private updateState(partialState: Partial<BookFilterState>): void {
    const newState = { ...this.currentState, ...partialState };
    this.filterState$.next(newState);
    this.updateUrl();
  }

  private buildSearchQuery(state: BookFilterState): SearchBookQuery {
    return {
      searchTerm: state.searchTerm || undefined,
      categoryId: state.categoryId || undefined,
      publisherId: state.publisherId || undefined,
      minPrice: state.minPrice || undefined,
      maxPrice: state.maxPrice || undefined,
      sortBy: state.sortBy,
      sortDirection: state.sortDirection,
      pageNumber: state.pageNumber,
      pageSize: state.pageSize,
    };
  }

  private loadFilterOptions(): void {
    combineLatest([
      this.categoryService.getCategories(),
      this.publisherService.getPublishers(),
    ]).subscribe(([categories, publishers]) => {
      this.filterOptions$.next({
        categories,
        publishers,
        sortOptions: this.bookService.getSortOptions(),
        sortDirectionOptions: this.bookService.getSortDirectionOptions(),
      });
    });
  }
}
