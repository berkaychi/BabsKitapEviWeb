import { Publisher } from './publisher.model';

export interface BookCategory {
  id: number;
  name: string;
}

export interface BookPublisher {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publishedDate: string;
  description: string;
  imageUrl: string;
  stockQuantity: number;
  price: number;
  categories: BookCategory[];
  publishers: BookPublisher[];
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string | null;
  data: T[];
  errors: { [key: string]: string[] } | null;
}

export interface ApiItemResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  errors: { [key: string]: string[] } | null;
}

export interface BookQuery {
  pageNumber: number;
  pageSize: number;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SearchBookQuery {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: BookSortBy;
  sortDirection?: SortDirection;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  publisherId?: number;
}

export enum BookSortBy {
  TITLE = 'Title',
  PRICE = 'Price',
  PUBLISHED_DATE = 'PublishedDate',
  AUTHOR = 'Author',
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface CreateBookRequest {
  title: string;
  author: string;
  isbn: string;
  publishedDate: string;
  description?: string;
  stockQuantity: number;
  price: number;
  categoryIds?: number[];
  publisherIds?: number[];
  imageFile?: File;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  isbn?: string;
  publishedDate?: string;
  description?: string;
  stockQuantity?: number;
  price?: number;
  categoryIds?: number[];
  publisherIds?: number[];
}
