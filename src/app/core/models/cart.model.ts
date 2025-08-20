export interface CartItem {
  bookId: number;
  bookTitle: string;
  quantity: number;
  price: number;
}

export interface Cart {
  id: number;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  updatedAt?: string;
}

export interface AddCartItemRequest {
  bookId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
