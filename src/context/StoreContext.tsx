import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CustomerAccount,
  Order,
  LedgerTransaction,
  CartItem,
  OrderStatus,
  PaymentMethod,
  PaymentChannel
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS
} from '../data/mockData';

interface StoreContextType {
  // Mode & Tabs
  viewMode: 'customer' | 'store_manager';
  setViewMode: (mode: 'customer' | 'store_manager') => void;
  activeCustomerTab: 'browse' | 'orders';
  setActiveCustomerTab: (tab: 'browse' | 'orders') => void;
  activeManagerTab: 'khata' | 'orders' | 'inventory' | 'analytics';
  setActiveManagerTab: (tab: 'khata' | 'orders' | 'inventory' | 'analytics') => void;

  // Active Customer Profile (for browsing/ordering)
  activeCustomer: CustomerAccount;
  setActiveCustomer: (customer: CustomerAccount) => void;
  customers: CustomerAccount[];

  // Inventory
  products: Product[];
  updateProductStock: (productId: string, newStock: number, newPrice?: number) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  addNewProduct: (product: Omit<Product, 'id'>) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Orders
  orders: Order[];
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;
  placeOrder: (params: {
    deliveryAddress: string;
    deliverySlot: string;
    deliveryNotes?: string;
    paymentMethod: PaymentMethod;
  }) => { success: boolean; orderId?: string; error?: string };
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  advanceOrderStatusDemo: (orderId: string) => void;

  // Khata & Balance Ledger
  ledgerTransactions: LedgerTransaction[];
  recordCustomerPayment: (params: {
    customerId: string;
    amount: number;
    paymentChannel: PaymentChannel;
    referenceNote?: string;
  }) => void;
  addManualCustomerCharge: (params: {
    customerId: string;
    amount: number;
    description: string;
  }) => void;
  addNewCustomer: (customer: Omit<CustomerAccount, 'id' | 'currentBalance' | 'status' | 'createdAt'>) => void;
  updateCustomerCreditLimit: (customerId: string, newLimit: number) => void;

  // Toast / Feedback
  toastMessage: string | null;
  showToast: (msg: string) => void;
  resetDemoData: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage keys
  const PRODUCTS_KEY = 'freshmart_products_v1';
  const CUSTOMERS_KEY = 'freshmart_customers_v1';
  const ORDERS_KEY = 'freshmart_orders_v1';
  const TRANSACTIONS_KEY = 'freshmart_ledger_v1';

  // Navigation State
  const [viewMode, setViewMode] = useState<'customer' | 'store_manager'>('customer');
  const [activeCustomerTab, setActiveCustomerTab] = useState<'browse' | 'orders'>('browse');
  const [activeManagerTab, setActiveManagerTab] = useState<'khata' | 'orders' | 'inventory' | 'analytics'>('khata');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<CustomerAccount[]>(() => {
    const saved = localStorage.getItem(CUSTOMERS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [activeCustomer, setActiveCustomerState] = useState<CustomerAccount>(() => {
    return customers[0] || INITIAL_CUSTOMERS[0];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(ORDERS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [ledgerTransactions, setLedgerTransactions] = useState<LedgerTransaction[]>(() => {
    const saved = localStorage.getItem(TRANSACTIONS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [cart, setCart] = useState<CartItem[]>([]);

  // Synchronize with local storage
  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(ledgerTransactions));
  }, [ledgerTransactions]);

  // Keep active customer synced with customers list
  const setActiveCustomer = (cust: CustomerAccount) => {
    setActiveCustomerState(cust);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Cart operations
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          showToast(`Only ${product.stock} ${product.unit} available in stock!`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        if (quantity > product.stock) {
          showToast(`Only ${product.stock} ${product.unit} available in stock!`);
          return prev;
        }
        return [...prev, { product, quantity }];
      }
    });
    showToast(`Added ${product.name} to cart`);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          if (quantity > item.product.stock) {
            showToast(`Maximum ${item.product.stock} available`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Place Order & Balance integration
  const placeOrder = ({
    deliveryAddress,
    deliverySlot,
    deliveryNotes,
    paymentMethod,
  }: {
    deliveryAddress: string;
    deliverySlot: string;
    deliveryNotes?: string;
    paymentMethod: PaymentMethod;
  }) => {
    if (cart.length === 0) {
      return { success: false, error: 'Your cart is empty' };
    }

    const deliveryFee = cartSubtotal >= 300 ? 0 : 30;
    const total = cartSubtotal + deliveryFee;

    // Check store credit balance rule if choosing Khata
    if (paymentMethod === 'store_balance') {
      const remainingCredit = activeCustomer.creditLimit - activeCustomer.currentBalance;
      if (total > remainingCredit) {
        return {
          success: false,
          error: `Order total ₹${total} exceeds your remaining Khata credit limit of ₹${remainingCredit.toLocaleString('en-IN')}. Please pay online or reduce order.`
        };
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${randomSuffix}`;
    const nowIso = new Date().toISOString();
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      unit: item.product.unit,
      emoji: item.product.imageEmoji,
      imageUrl: item.product.imageUrl,
    }));

    const newOrder: Order = {
      id: orderId,
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      customerPhone: activeCustomer.phone,
      deliveryAddress: deliveryAddress || activeCustomer.address,
      deliverySlot,
      deliveryNotes,
      items: orderItems,
      subtotal: cartSubtotal,
      deliveryFee,
      discount: 0,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'online_paid' ? 'paid' : paymentMethod === 'store_balance' ? 'added_to_khata' : 'unpaid',
      orderStatus: 'placed',
      createdAt: nowIso,
      estimatedDeliveryTime: 'Within 45-60 mins',
      timeline: [
        {
          status: 'placed',
          label: 'Order Placed',
          timestamp: timeFormatted,
          note: paymentMethod === 'store_balance'
            ? 'Order confirmed. ₹' + total + ' added to store credit balance.'
            : paymentMethod === 'online_paid'
            ? 'Payment verified online. Preparing basket.'
            : 'Cash on delivery selected. Payment due upon arrival.',
        },
      ],
    };

    // 1. Deduct Product Stocks
    setProducts((prev) =>
      prev.map((prod) => {
        const orderedItem = cart.find((ci) => ci.product.id === prod.id);
        if (orderedItem) {
          const updatedStock = Math.max(0, prod.stock - orderedItem.quantity);
          return {
            ...prod,
            stock: updatedStock,
            inStock: updatedStock > 0,
          };
        }
        return prod;
      })
    );

    // 2. If Store Balance, Update Customer Ledger
    if (paymentMethod === 'store_balance') {
      const newCustomerBalance = activeCustomer.currentBalance + total;
      const updatedCustomerStatus = newCustomerBalance >= activeCustomer.creditLimit * 0.8 ? 'warning' : 'active';

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === activeCustomer.id
            ? { ...c, currentBalance: newCustomerBalance, status: updatedCustomerStatus }
            : c
        )
      );

      setActiveCustomerState((prev) => ({
        ...prev,
        currentBalance: newCustomerBalance,
        status: updatedCustomerStatus,
      }));

      const newTxn: LedgerTransaction = {
        id: `TXN-${Date.now().toString().slice(-4)}`,
        customerId: activeCustomer.id,
        customerName: activeCustomer.name,
        type: 'purchase_charge',
        amount: total,
        balanceAfter: newCustomerBalance,
        date: nowIso,
        orderId,
        referenceNote: `Order ${orderId} charged to Khata balance`,
        recordedBy: 'Store System',
      };

      setLedgerTransactions((prev) => [newTxn, ...prev]);
    }

    // 3. Save Order
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setIsCartOpen(false);
    setActiveTrackingOrder(newOrder);
    setActiveCustomerTab('orders');

    showToast(`Order ${orderId} placed successfully!`);
    return { success: true, orderId };
  };

  // Order status management
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let note = '';
    let label = '';

    if (status === 'packed') {
      label = 'Packed & Quality Checked';
      note = 'Groceries verified against store inventory and safely bagged.';
    } else if (status === 'out_for_delivery') {
      label = 'Out for Delivery';
      note = 'Handed over to delivery associate Ramesh. On the way!';
    } else if (status === 'delivered') {
      label = 'Delivered';
      note = 'Package successfully handed to recipient at doorstep.';
    } else if (status === 'cancelled') {
      label = 'Cancelled';
      note = 'Order was cancelled by store manager.';
    }

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedTimeline = [
            ...order.timeline,
            { status, label, timestamp: timeFormatted, note },
          ];
          const updatedOrder = {
            ...order,
            orderStatus: status,
            paymentStatus: status === 'delivered' && order.paymentMethod === 'cash_on_delivery' ? ('paid' as const) : order.paymentStatus,
            timeline: updatedTimeline,
          };
          if (activeTrackingOrder?.id === orderId) {
            setActiveTrackingOrder(updatedOrder);
          }
          return updatedOrder;
        }
        return order;
      })
    );

    showToast(`Order ${orderId} status updated to ${status}`);
  };

  // Advance Order status for testing/demo simulation
  const advanceOrderStatusDemo = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const orderCycle: OrderStatus[] = ['placed', 'packed', 'out_for_delivery', 'delivered'];
    const currentIndex = orderCycle.indexOf(targetOrder.orderStatus);
    if (currentIndex < orderCycle.length - 1) {
      const nextStatus = orderCycle[currentIndex + 1];
      updateOrderStatus(orderId, nextStatus);
    } else {
      showToast('Order is already marked as Delivered!');
    }
  };

  // Store Management: Record a payment received from customer (reduces balance)
  const recordCustomerPayment = ({
    customerId,
    amount,
    paymentChannel,
    referenceNote,
  }: {
    customerId: string;
    amount: number;
    paymentChannel: PaymentChannel;
    referenceNote?: string;
  }) => {
    const targetCustomer = customers.find((c) => c.id === customerId);
    if (!targetCustomer) return;

    const newBalance = Math.max(0, targetCustomer.currentBalance - amount);
    const newStatus = newBalance === 0 ? 'settled' : newBalance >= targetCustomer.creditLimit * 0.8 ? 'warning' : 'active';

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, currentBalance: newBalance, status: newStatus }
          : c
      )
    );

    if (activeCustomer.id === customerId) {
      setActiveCustomerState((prev) => ({
        ...prev,
        currentBalance: newBalance,
        status: newStatus,
      }));
    }

    const nowIso = new Date().toISOString();
    const newTxn: LedgerTransaction = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      customerId,
      customerName: targetCustomer.name,
      type: 'payment_received',
      amount,
      balanceAfter: newBalance,
      date: nowIso,
      paymentChannel,
      referenceNote: referenceNote || `Payment of ₹${amount.toLocaleString('en-IN')} received via ${paymentChannel.toUpperCase()}`,
      recordedBy: 'Store Manager',
    };

    setLedgerTransactions((prev) => [newTxn, ...prev]);
    showToast(`Recorded payment of ₹${amount.toLocaleString('en-IN')} for ${targetCustomer.name}. New Balance: ₹${newBalance.toLocaleString('en-IN')}`);
  };

  // Store Management: Add manual charge / in-store shopping to customer balance
  const addManualCustomerCharge = ({
    customerId,
    amount,
    description,
  }: {
    customerId: string;
    amount: number;
    description: string;
  }) => {
    const targetCustomer = customers.find((c) => c.id === customerId);
    if (!targetCustomer) return;

    const newBalance = targetCustomer.currentBalance + amount;
    const newStatus = newBalance >= targetCustomer.creditLimit * 0.8 ? 'warning' : 'active';

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, currentBalance: newBalance, status: newStatus }
          : c
      )
    );

    if (activeCustomer.id === customerId) {
      setActiveCustomerState((prev) => ({
        ...prev,
        currentBalance: newBalance,
        status: newStatus,
      }));
    }

    const nowIso = new Date().toISOString();
    const newTxn: LedgerTransaction = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      customerId,
      customerName: targetCustomer.name,
      type: 'purchase_charge',
      amount,
      balanceAfter: newBalance,
      date: nowIso,
      referenceNote: description || 'In-store balance purchase charge',
      recordedBy: 'Store Manager',
    };

    setLedgerTransactions((prev) => [newTxn, ...prev]);
    showToast(`Added charge of ₹${amount} to ${targetCustomer.name}'s account.`);
  };

  const addNewCustomer = (customerData: Omit<CustomerAccount, 'id' | 'currentBalance' | 'status' | 'createdAt'>) => {
    const newId = `cust-${Date.now().toString().slice(-4)}`;
    const newCust: CustomerAccount = {
      ...customerData,
      id: newId,
      currentBalance: 0,
      status: 'settled',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [...prev, newCust]);
    showToast(`New customer account created for ${newCust.name}!`);
  };

  const updateCustomerCreditLimit = (customerId: string, newLimit: number) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, creditLimit: newLimit } : c))
    );
    if (activeCustomer.id === customerId) {
      setActiveCustomerState((prev) => ({ ...prev, creditLimit: newLimit }));
    }
    showToast('Customer credit limit updated');
  };

  // Inventory modifications
  const updateProductStock = (productId: string, newStock: number, newPrice?: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            stock: newStock,
            inStock: newStock > 0,
            price: newPrice !== undefined ? newPrice : p.price,
          };
        }
        return p;
      })
    );
    showToast('Inventory updated successfully');
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = { ...p, ...updates };
          if (updates.stock !== undefined) {
            updated.inStock = updates.stock > 0;
          }
          return updated;
        }
        return p;
      })
    );
    // Sync cart with updated rate or image if present in cart
    setCart((prev) =>
      prev.map((ci) => {
        if (ci.product.id === productId) {
          return {
            ...ci,
            product: { ...ci.product, ...updates },
          };
        }
        return ci;
      })
    );
    showToast('Product details & rate updated');
  };

  const addNewProduct = (productData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now().toString().slice(-4)}`,
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Added ${newProd.name} to store inventory`);
  };

  const resetDemoData = () => {
    localStorage.removeItem(PRODUCTS_KEY);
    localStorage.removeItem(CUSTOMERS_KEY);
    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem(TRANSACTIONS_KEY);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setActiveCustomerState(INITIAL_CUSTOMERS[0]);
    setOrders(INITIAL_ORDERS);
    setLedgerTransactions(INITIAL_TRANSACTIONS);
    setCart([]);
    showToast('Store data reset to initial demo values');
  };

  return (
    <StoreContext.Provider
      value={{
        viewMode,
        setViewMode,
        activeCustomerTab,
        setActiveCustomerTab,
        activeManagerTab,
        setActiveManagerTab,
        activeCustomer,
        setActiveCustomer,
        customers,
        products,
        updateProductStock,
        updateProduct,
        addNewProduct,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        orders,
        activeTrackingOrder,
        setActiveTrackingOrder,
        placeOrder,
        updateOrderStatus,
        advanceOrderStatusDemo,
        ledgerTransactions,
        recordCustomerPayment,
        addManualCustomerCharge,
        addNewCustomer,
        updateCustomerCreditLimit,
        toastMessage,
        showToast,
        resetDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
