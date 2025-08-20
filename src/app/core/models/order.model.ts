export interface Order {
  id: number;
  userId: string;
  bookId: number;
  quantity: number;
  status: 'pending' | 'shipped' | 'delivered';
  createdAt: string;
  updatedAt: string;
}
