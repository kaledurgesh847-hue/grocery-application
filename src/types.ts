export type ProductCategory =
  | 'All'
  | 'Fresh Produce'
  | 'Dairy & Eggs'
  | 'Bakery & Grains'
  | 'Pantry & Spices'
  | 'Snacks & Drinks'
  | 'Personal & Home';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  unit: string; // e.g., '1 kg', '500 g', '1 pack', '1 L'
  stock: number;
  inStock: boolean;
  imageEmoji: string;
  imageUrl?: string; // custom image uploaded from store owner computer
  badge?: string; // 'Fresh', 'Organic', 'Best Seller', 'Offer'
  description: string;
  origin?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'placed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash_on_delivery' | 'online_paid' | 'store_balance';
export type PaymentStatus = 'paid' | 'unpaid' | 'added_to_khata';

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  emoji: string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliverySlot: string;
  deliveryNotes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  estimatedDeliveryTime: string;
  timeline: OrderTimelineEvent[];
}

export interface CustomerAccount {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  currentBalance: number; // positive = customer owes money to store; negative = advance paid
  creditLimit: number;
  status: 'active' | 'warning' | 'settled';
  createdAt: string;
  notes?: string;
}

export type LedgerTransactionType = 'purchase_charge' | 'payment_received' | 'adjustment';
export type PaymentChannel = 'cash' | 'upi' | 'bank_transfer' | 'cheque';

export interface LedgerTransaction {
  id: string;
  customerId: string;
  customerName: string;
  type: LedgerTransactionType;
  amount: number;
  balanceAfter: number;
  date: string;
  paymentChannel?: PaymentChannel;
  orderId?: string;
  referenceNote: string;
  recordedBy: string;
}
