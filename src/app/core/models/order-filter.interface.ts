import { OrderSortBy, SortDirection } from './order.model';

export interface OrderFilterState {
  searchTerm: string | null;
  status: number | null;
  userId: string | null;
  minAmount: number | null;
  maxAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  sortBy: OrderSortBy;
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
}

export interface OrderFilterOptions {
  sortOptions: Array<{ value: OrderSortBy; label: string }>;
  sortDirectionOptions: Array<{ value: SortDirection; label: string }>;
  statusOptions: Array<{ value: number; label: string }>;
}

export interface OrderSearchQuery {
  searchTerm?: string;
  status?: number;
  userId?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: OrderSortBy;
  sortDirection?: SortDirection;
  pageNumber?: number;
  pageSize?: number;
}

export interface FilterChangeEvent {
  filterState: OrderFilterState;
  resetPagination?: boolean;
}
