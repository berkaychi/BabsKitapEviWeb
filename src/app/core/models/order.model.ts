export interface OrderItem {
  id: number;
  orderId: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookImageUrl: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  userId: string;
  orderDate: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingFullName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingZipCode: string;
  orderItems: OrderItem[];
}

export interface UserOrderGroup {
  userId: string;
  firstName: string;
  lastName: string;
  userEmail: string;
  latestOrderDate: string;
  orders: Order[];
}

export interface CreateOrderRequest {
  addressId: number;
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

export interface OrderStatus {
  label: string;
  value: string;
  color: string;
}

export enum OrderSortBy {
  ORDER_DATE = 'OrderDate',
  TOTAL_AMOUNT = 'TotalAmount',
  STATUS = 'Status',
  USER_ID = 'UserId',
  SHIPPING_FULL_NAME = 'ShippingFullName',
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export function getOrderStatusInfo(status: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    Pending: { label: 'Beklemede', value: 'Pending', color: '#f59e0b' },
    Processing: {
      label: 'Hazırlanıyor',
      value: 'Processing',
      color: '#3b82f6',
    },
    Shipped: { label: 'Kargoda', value: 'Shipped', color: '#8b5cf6' },
    Delivered: { label: 'Teslim Edildi', value: 'Delivered', color: '#10b981' },
    Cancelled: { label: 'İptal Edildi', value: 'Cancelled', color: '#ef4444' },
  };

  return (
    statusMap[status] || { label: status, value: status, color: '#6b7280' }
  );
}
