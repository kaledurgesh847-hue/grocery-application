import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import { ReceiptModal } from './ReceiptModal';
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Receipt,
  RotateCcw,
  Phone,
  MapPin,
  ChevronRight,
  AlertCircle,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export const OrderHistoryView: React.FC = () => {
  const {
    orders,
    activeCustomer,
    activeTrackingOrder,
    setActiveTrackingOrder,
    advanceOrderStatusDemo,
    addToCart,
    products,
    setIsCartOpen,
    setActiveCustomerTab,
    showToast,
  } = useStore();

  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Filter orders for the active customer
  const customerOrders = orders.filter((o) => o.customerId === activeCustomer.id);

  // If active tracking order is set, display it at top
  const currentTracking = activeTrackingOrder || customerOrders[0] || null;

  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return 0;
      case 'packed':
        return 1;
      case 'out_for_delivery':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const steps = [
    { key: 'placed', label: 'Order Placed', desc: 'Received & verified by store' },
    { key: 'packed', label: 'Packed & Bagged', desc: 'Freshness verified and sealed' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'On electric scooter with rider' },
    { key: 'delivered', label: 'Delivered', desc: 'Safely handed at doorstep' },
  ];

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod && prod.stock > 0) {
        addToCart(prod, item.quantity);
      }
    });
    setIsCartOpen(true);
    showToast(`Items from order ${order.id} added to basket!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-700" />
            Order History & Delivery Tracking
          </h1>
          <p className="text-xs text-stone-500">
            Real-time status updates for {activeCustomer.name} ({customerOrders.length} total orders)
          </p>
        </div>

        <button
          onClick={() => setActiveCustomerTab('browse')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Groceries</span>
        </button>
      </div>

      {/* Active Live Tracking Card (if there is an order) */}
      {currentTracking ? (
        <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-md space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
            Live Order Tracking
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                  {currentTracking.id}
                </span>
                <span className="text-xs text-stone-400">•</span>
                <span className="text-xs text-stone-500">
                  Placed on {new Date(currentTracking.createdAt).toLocaleDateString()} at{' '}
                  {new Date(currentTracking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 mt-1">
                {currentTracking.orderStatus === 'delivered'
                  ? 'Package Delivered Successfully'
                  : currentTracking.orderStatus === 'out_for_delivery'
                  ? 'Rider is on the way to your address!'
                  : currentTracking.orderStatus === 'packed'
                  ? 'Your items are packed and ready for dispatch'
                  : 'Order received at store counter'}
              </h2>
              <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                Slot: <strong className="text-stone-700">{currentTracking.deliverySlot}</strong>
              </p>
            </div>

            {/* Quick action buttons for this order */}
            <div className="flex items-center gap-2 flex-wrap">
              {currentTracking.orderStatus !== 'delivered' && (
                <button
                  id="simulate-advance-step-btn"
                  onClick={() => advanceOrderStatusDemo(currentTracking.id)}
                  title="Simulate the next step in the delivery process"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Next Stage →</span>
                </button>
              )}

              <button
                onClick={() => setReceiptOrder(currentTracking)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>View Bill / Receipt</span>
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="py-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {steps.map((step, idx) => {
                const currentIdx = getStatusStepIndex(currentTracking.orderStatus);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div
                    key={step.key}
                    className={`flex flex-col p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : isPassed
                        ? 'border-stone-200 bg-stone-50/50'
                        : 'border-dashed border-stone-200 bg-white opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {isPassed ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-emerald-950' : isPassed ? 'text-stone-800' : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-2">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Rider & Address Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Delivery address & Instructions */}
            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80 space-y-1.5 text-xs">
              <span className="font-semibold text-stone-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Delivery Address
              </span>
              <p className="font-medium text-stone-800">{currentTracking.customerName}</p>
              <p className="text-stone-600">{currentTracking.deliveryAddress}</p>
              {currentTracking.deliveryNotes && (
                <p className="text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200/60 text-[11px]">
                  Note: {currentTracking.deliveryNotes}
                </p>
              )}
            </div>

            {/* Rider Card if out for delivery or packed */}
            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg">
                  🛵
                </div>
                <div>
                  <span className="font-semibold text-stone-400 uppercase tracking-wider text-[10px]">
                    Delivery Associate
                  </span>
                  <p className="font-bold text-stone-800">Ramesh Kumar</p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Verified EV Courier • Masked Delivery
                  </p>
                </div>
              </div>

              <button
                onClick={() => showToast('Calling Delivery Partner Ramesh Kumar (+91 98765 00000)...')}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call</span>
              </button>
            </div>
          </div>

          {/* Ordered Items Summary in this Order */}
          <div className="border-t border-stone-100 pt-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Basket Items ({currentTracking.items.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {currentTracking.items.map((item, i) => (
                <div
                  key={i}
                  className="bg-stone-50 p-2.5 rounded-lg border border-stone-200/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-md bg-white border border-stone-200 flex items-center justify-center shrink-0 overflow-hidden text-lg">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        item.emoji
                      )}
                    </span>
                    <div>
                      <p className="font-semibold text-stone-800 line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-stone-500">
                        {item.quantity} × ₹{item.price} ({item.unit})
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Total and Payment Method line */}
            <div className="flex flex-wrap items-center justify-between pt-3 text-xs bg-stone-100/60 p-3 rounded-xl border border-stone-200/60">
              <div>
                <span className="text-stone-500">Payment: </span>
                <span className="font-bold text-stone-800">
                  {currentTracking.paymentMethod === 'store_balance'
                    ? 'Store Khata Credit (Added to balance)'
                    : currentTracking.paymentMethod === 'online_paid'
                    ? 'Prepaid Online'
                    : 'Cash on Delivery'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-600">Total Amount:</span>
                <span className="text-sm font-extrabold text-emerald-800">
                  ₹{currentTracking.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-2xl mx-auto">
            🛒
          </div>
          <h3 className="text-base font-bold text-stone-800">No orders placed yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Add groceries to your basket and choose between Pay Now, Cash on Delivery, or Store Khata credit.
          </p>
          <button
            onClick={() => setActiveCustomerTab('browse')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
          >
            Start Shopping
          </button>
        </div>
      )}

      {/* Past Orders Archive */}
      {customerOrders.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-stone-500" />
            Previous Orders History
          </h3>

          <div className="space-y-3">
            {customerOrders
              .filter((o) => o.id !== currentTracking?.id)
              .map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-xs transition-shadow"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-stone-800">
                        {order.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          order.orderStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-stone-400">•</span>
                      <span className="text-xs text-stone-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-1">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>

                    <p className="text-[11px] text-stone-400">
                      Payment: {order.paymentMethod === 'store_balance' ? 'Khata Store Credit' : order.paymentMethod} • Total: ₹{order.total}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => setActiveTrackingOrder(order)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 cursor-pointer"
                    >
                      Track Order
                    </button>
                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 cursor-pointer"
                    >
                      Reorder All
                    </button>
                    <button
                      onClick={() => setReceiptOrder(order)}
                      className="px-2 py-1.5 text-xs text-stone-500 hover:text-stone-800"
                      title="View Bill"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
    </div>
  );
};
