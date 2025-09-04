export interface ApiResponse<T> {
  data: T | null;
  isSuccess: boolean;
  errors: string[] | null;
  message: string | null;
}
