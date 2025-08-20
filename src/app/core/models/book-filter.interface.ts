import { BookSortBy, SortDirection } from './book.model';
import { Category } from './category.model';
import { Publisher } from './publisher.model';

export interface BookFilterState {
  searchTerm: string | null;
  categoryId: number | null;
  publisherId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: BookSortBy;
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
}

export interface BookFilterOptions {
  categories: Category[];
  publishers: Publisher[];
  sortOptions: Array<{ value: BookSortBy; label: string }>;
  sortDirectionOptions: Array<{ value: SortDirection; label: string }>;
}

export interface FilterChangeEvent {
  filterState: BookFilterState;
  resetPagination?: boolean;
}
