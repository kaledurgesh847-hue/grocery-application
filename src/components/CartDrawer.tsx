import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod } from '../types';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Clock,
  Wallet,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    activeCustomer,
    placeOrder,
    showToast,
  } = useStore();

  const [deliveryAddress, setDeliveryAddress] = useState(activeCustomer.address);
  const [deliverySlot, setDeliverySlot] = useState('⚡ Express Delivery (Next 45 Mins)');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('store_balance');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync address when active customer changes
  React.useEffect(() => {
    setDeliveryAddress(activeCustomer.address);
  }, [activeCustomer]);

  if (!isCartOpen) return null;

  const deliveryFee = cartSubtotal >= 300 ? 0 : 30;
  const orderTotal = cartSubtotal + deliveryFee;

  const remainingCredit = Math.max(0, activeCustomer.creditLimit - activeCustomer.currentBalance);
  const canUseKhata = orderTotal <= remainingCredit;

  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty!');
      return;
    }
    if (!deliveryAddress.trim()) {
      showToast('Please provide a delivery address.');
      return;
    }

    if (paymentMethod === 'store_balance' && !canUseKhata) {
      showToast('Order total exceeds your remaining Khata credit limit.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = placeOrder({
        deliveryAddress,
        deliverySlot,
        deliveryNotes,
        paymentMethod,
      });

      setIsSubmitting(false);
      if (!res.success && res.error) {
        showToast(res.error);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-stone-200">
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-bold text-stone-900">Your Fresh Basket</h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  title="Clear basket"
                  className="text-xs text-stone-400 hover:text-rose-600 transition-colors px-2 py-1"
                >
                  Clear
                </button>
              )}
              <button
                id="close-cart-drawer-btn"
                onClick={() => setIsCartOpen(false)}
                className="text-stone-400 hover:text-stone-800 p-1.5 rounded-lg hover:bg-stone-200 transition-colors"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-3xl mx-auto text-stone-400">
                  🧺
                </div>
                <h3 className="text-base font-bold text-stone-800">Your basket is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Explore fresh vegetables, dairy, grains, and kitchen essentials to start your grocery order.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700"
                >
                  Browse Store Inventory
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Selected Items
                  </h3>
                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-stone-200">
                            {item.product.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              item.product.imageEmoji
                            )}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                              {item.product.name}
                            </h4>
                            <p className="text-[11px] text-stone-500">
                              ₹{item.product.price} / {item.product.unit}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Stepper */}
                          <div className="flex items-center bg-stone-100 rounded-lg border border-stone-200">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-1 text-stone-600 hover:text-stone-950 hover:bg-stone-200 rounded-l transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 py-0.5 text-xs font-bold text-stone-900 min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-1 text-stone-600 hover:text-stone-950 hover:bg-stone-200 rounded-r transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-stone-900 min-w-[45px] text-right">
                            ₹{item.product.price * item.quantity}
                          </span>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-stone-400 hover:text-rose-600 p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Delivery Destination
                  </h3>
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter flat / house number, building name, street..."
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600 text-stone-800"
                    />
                  </div>

                  {/* Delivery Slot */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-stone-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      Select Delivery Slot
                    </label>
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600 text-stone-800"
                    >
                      <option value="⚡ Express Delivery (Next 45 Mins)">
                        ⚡ Express Delivery (Next 45 Mins)
                      </option>
                      <option value="🌆 Today Evening (5:00 PM - 7:00 PM)">
                        🌆 Today Evening (5:00 PM - 7:00 PM)
                      </option>
                      <option value="🌅 Tomorrow Morning (8:00 AM - 10:00 AM)">
                        🌅 Tomorrow Morning (8:00 AM - 10:00 AM)
                      </option>
                      <option value="☀️ Tomorrow Afternoon (12:00 PM - 2:00 PM)">
                        ☀️ Tomorrow Afternoon (12:00 PM - 2:00 PM)
                      </option>
                    </select>
                  </div>

                  {/* Delivery Notes */}
                  <div>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Delivery instructions (e.g. Ring bell, leave with security)"
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600 text-stone-800 placeholder:text-stone-400"
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center justify-between">
                    <span>Payment Method</span>
                    <span className="text-[11px] font-normal text-emerald-700">
                      Store Khata Supported
                    </span>
                  </h3>

                  <div className="space-y-2">
                    {/* 1. Store Khata Balance Option */}
                    <label
                      className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'store_balance'
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'store_balance'}
                          onChange={() => setPaymentMethod('store_balance')}
                          className="mt-1 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                              <Wallet className="w-4 h-4 text-amber-500" />
                              Store Khata (Monthly Ledger Balance)
                            </span>
                            <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                              Pay Later
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600">
                            Add to your customer balance account and settle at month-end.
                          </p>

                          {/* Customer balance status preview */}
                          <div className="mt-2 pt-2 border-t border-stone-200/80 text-[11px] flex items-center justify-between">
                            <span className="text-stone-500">
                              Current Balance: <strong>₹{activeCustomer.currentBalance.toLocaleString('en-IN')}</strong>
                            </span>
                            <span className={canUseKhata ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-bold'}>
                              Remaining Credit: ₹{remainingCredit.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {!canUseKhata && (
                            <p className="text-[10px] text-rose-600 flex items-center gap-1 font-medium mt-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              Order exceeds available credit limit. Choose Pay Online or Cash.
                            </p>
                          )}
                        </div>
                      </div>
                    </label>

                    {/* 2. Online Payment */}
                    <label
                      className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'online_paid'
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'online_paid'}
                          onChange={() => setPaymentMethod('online_paid')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-emerald-600" />
                              Pay Now (UPI / Card / NetBanking)
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              Prepaid
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            Instant zero-touch contactless confirmation.
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* 3. Cash on Delivery */}
                    <label
                      className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'cash_on_delivery'
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'cash_on_delivery'}
                          onChange={() => setPaymentMethod('cash_on_delivery')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                              <Banknote className="w-4 h-4 text-stone-600" />
                              Cash / UPI on Delivery
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            Pay the delivery partner directly at your doorstep.
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer (Bill breakdown and Place Order Button) */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3.5">
              {/* Pricing breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Basket Total ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-stone-800">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Partner Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE (Over ₹300)</span>
                  ) : (
                    <span className="text-stone-800">₹{deliveryFee}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-950 pt-2 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span className="text-emerald-800 text-base">₹{orderTotal}</span>
                </div>
              </div>

              {/* Action button */}
              <button
                id="place-order-confirm-btn"
                disabled={isSubmitting || (paymentMethod === 'store_balance' && !canUseKhata)}
                onClick={handleCheckout}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Place Delivery Order • ₹{orderTotal}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-stone-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Guaranteed safe, hygienic grocery packing & verified invoice
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
