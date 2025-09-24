import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import {
  OrderFilterState,
  OrderFilterOptions,
  FilterChangeEvent,
  OrderSearchQuery,
} from '../models/order-filter.interface';
import { OrderSortBy, SortDirection } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderFilterService {
  private readonly initialState: OrderFilterState = {
    searchTerm: null,
    status: null,
    userId: null,
    minAmount: null,
    maxAmount: null,
    startDate: null,
    endDate: null,
    sortBy: OrderSortBy.ORDER_DATE,
    sortDirection: SortDirection.DESC,
    pageNumber: 1,
    pageSize: 10,
  };

  private filterState$ = new BehaviorSubject<OrderFilterState>(
    this.initialState
  );

  private filterOptions$ = new BehaviorSubject<OrderFilterOptions>({
    sortOptions: [],
    sortDirectionOptions: [],
    statusOptions: [],
  });

  constructor(private router: Router) {
    this.initializeFilterOptions();
  }

  get state$(): Observable<OrderFilterState> {
    return this.filterState$.asObservable();
  }

  get options$(): Observable<OrderFilterOptions> {
    return this.filterOptions$.asObservable();
  }

  get searchQuery$(): Observable<OrderSearchQuery> {
    return this.filterState$.pipe(
      map((state) => this.buildSearchQuery(state)),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );
  }

  get currentState(): OrderFilterState {
    return this.filterState$.value;
  }

  initializeFromRoute(route: ActivatedRoute): void {
    combineLatest([route.paramMap, route.queryParams]).subscribe(
      ([params, queryParams]) => {
        const state = { ...this.initialState };

        if (queryParams['searchTerm'])
          state.searchTerm = queryParams['searchTerm'];
        if (queryParams['status']) state.status = +queryParams['status'];
        if (queryParams['userId']) state.userId = queryParams['userId'];
        if (queryParams['minAmount'])
          state.minAmount = +queryParams['minAmount'];
        if (queryParams['maxAmount'])
          state.maxAmount = +queryParams['maxAmount'];
        if (queryParams['startDate'])
          state.startDate = queryParams['startDate'];
        if (queryParams['endDate']) state.endDate = queryParams['endDate'];
        if (queryParams['sortBy'])
          state.sortBy = queryParams['sortBy'] as OrderSortBy;
        if (queryParams['sortDirection'])
          state.sortDirection = queryParams['sortDirection'] as SortDirection;
        if (queryParams['page']) state.pageNumber = +queryParams['page'];
        if (queryParams['pageSize']) state.pageSize = +queryParams['pageSize'];

        this.filterState$.next(state);
      }
    );
  }

  updateSearchTerm(searchTerm: string): void {
    this.updateState({ searchTerm, pageNumber: 1 });
  }

  updateStatus(status: number | null): void {
    this.updateState({ status, pageNumber: 1 });
  }

  updateUserId(userId: string | null): void {
    this.updateState({ userId, pageNumber: 1 });
  }

  updateAmountRange(minAmount: number | null, maxAmount: number | null): void {
    this.updateState({ minAmount, maxAmount, pageNumber: 1 });
  }

  updateDateRange(startDate: string | null, endDate: string | null): void {
    this.updateState({ startDate, endDate, pageNumber: 1 });
  }

  updateSorting(sortBy: OrderSortBy, sortDirection: SortDirection): void {
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
    this.updateState({ minAmount: null, maxAmount: null, pageNumber: 1 });
    this.updateUrl();
  }

  updateUrl(): void {
    const state = this.currentState;
    const queryParams: any = {};

    queryParams.searchTerm = state.searchTerm || null;
    queryParams.status = state.status;
    queryParams.userId = state.userId || null;
    queryParams.minAmount = state.minAmount;
    queryParams.maxAmount = state.maxAmount;
    queryParams.startDate = state.startDate || null;
    queryParams.endDate = state.endDate || null;

    if (state.sortBy !== OrderSortBy.ORDER_DATE)
      queryParams.sortBy = state.sortBy;
    if (state.sortDirection !== SortDirection.DESC)
      queryParams.sortDirection = state.sortDirection;
    if (state.pageNumber > 1) queryParams.page = state.pageNumber;
    if (state.pageSize !== 10) queryParams.pageSize = state.pageSize;

    Object.keys(queryParams).forEach((key) => {
      if (queryParams[key] === null) {
        delete queryParams[key];
      }
    });

    this.router.navigate(['/admin/orders'], {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  private updateState(partialState: Partial<OrderFilterState>): void {
    const newState = { ...this.currentState, ...partialState };
    this.filterState$.next(newState);
    this.updateUrl();
  }

  private buildSearchQuery(state: OrderFilterState): OrderSearchQuery {
    return {
      searchTerm: state.searchTerm || undefined,
      status: state.status || undefined,
      userId: state.userId || undefined,
      minAmount: state.minAmount || undefined,
      maxAmount: state.maxAmount || undefined,
      startDate: state.startDate || undefined,
      endDate: state.endDate || undefined,
      sortBy: state.sortBy,
      sortDirection: state.sortDirection,
      pageNumber: state.pageNumber,
      pageSize: state.pageSize,
    };
  }

  private initializeFilterOptions(): void {
    const sortOptions: Array<{ value: OrderSortBy; label: string }> = [
      { value: OrderSortBy.ORDER_DATE, label: 'Sipariş Tarihi' },
      { value: OrderSortBy.TOTAL_AMOUNT, label: 'Toplam Tutar' },
      { value: OrderSortBy.STATUS, label: 'Durum' },
      { value: OrderSortBy.USER_ID, label: 'Kullanıcı ID' },
      { value: OrderSortBy.SHIPPING_FULL_NAME, label: 'Müşteri Adı' },
    ];

    const sortDirectionOptions: Array<{ value: SortDirection; label: string }> =
      [
        { value: SortDirection.ASC, label: 'Artan' },
        { value: SortDirection.DESC, label: 'Azalan' },
      ];

    const statusOptions: Array<{ value: number; label: string }> = [
      { value: 0, label: 'Beklemede' },
      { value: 1, label: 'Hazırlanıyor' },
      { value: 2, label: 'Kargoda' },
      { value: 3, label: 'Teslim Edildi' },
      { value: 4, label: 'İptal Edildi' },
      { value: 5, label: 'İade Edildi' },
      { value: 6, label: 'Ödeme Başarısız' },
    ];

    this.filterOptions$.next({
      sortOptions,
      sortDirectionOptions,
      statusOptions,
    });
  }
}
