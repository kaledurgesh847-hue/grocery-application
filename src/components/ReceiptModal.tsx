import React from 'react';
import { Order } from '../types';
import { Store, Printer, X, CheckCircle2, MapPin, Phone, Calendar, Clock } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 relative my-8 animate-in zoom-in-95">
        {/* Top Actions */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4 print:hidden">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Official Store Bill / Invoice
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Slip */}
        <div className="space-y-4 print:p-0 text-stone-900 font-sans">
          {/* Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-stone-300">
            <div className="inline-flex items-center justify-center gap-1.5 font-bold text-lg text-emerald-800">
              <Store className="w-5 h-5" />
              <span>FreshMart Groceries & Superstore</span>
            </div>
            <p className="text-xs text-stone-500">
              Main Market Road, Near Town Clock, Ph: +91 98000 12345
            </p>
            <p className="text-[11px] text-stone-400">GSTIN: 27AABCF1234F1Z5 • FSSAI Lic: 11521034000182</p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-xl border border-stone-200/80">
            <div>
              <span className="text-stone-500 block text-[11px]">Invoice / Order No:</span>
              <span className="font-mono font-bold text-stone-900">{order.id}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">Date & Time:</span>
              <span className="font-medium text-stone-800">
                {new Date(order.createdAt).toLocaleDateString()} at{' '}
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="col-span-2 pt-1 border-t border-stone-200">
              <span className="text-stone-500 block text-[11px]">Customer & Destination:</span>
              <p className="font-semibold text-stone-900">{order.customerName} ({order.customerPhone})</p>
              <p className="text-[11px] text-stone-600 line-clamp-2">{order.deliveryAddress}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-t border-b border-dashed border-stone-300 py-2.5">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-stone-400 font-semibold border-b border-stone-200 pb-1 text-left">
                  <th className="py-1">Item Description</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Rate</th>
                  <th className="py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-1.5">
                    <td className="py-1 text-stone-800 font-medium">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-4 h-4 rounded object-cover inline-block mr-1.5 align-middle"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="mr-1">{item.emoji}</span>
                      )}
                      <span className="align-middle">{item.name}</span>
                      <span className="text-[10px] text-stone-500 block">({item.unit})</span>
                    </td>
                    <td className="py-1 text-center text-stone-700">{item.quantity}</td>
                    <td className="py-1 text-right text-stone-600">₹{item.price}</td>
                    <td className="py-1 text-right font-semibold text-stone-900">
                      ₹{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Breakdown */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span className="font-medium">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Home Delivery Charge:</span>
              <span className="font-medium">{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount / Promo:</span>
                <span className="font-medium">- ₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-stone-900 pt-1.5 border-t border-stone-300">
              <span>Net Payable Total:</span>
              <span className="text-emerald-800 text-base">₹{order.total}</span>
            </div>
          </div>

          {/* Payment & Khata Status Note */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Payment Mode:</span>
              <span className="font-bold text-stone-800 uppercase tracking-wider">
                {order.paymentMethod === 'store_balance'
                  ? 'Store Khata Credit'
                  : order.paymentMethod === 'online_paid'
                  ? 'Online UPI / Card (Paid)'
                  : 'Cash on Delivery'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Payment Status:</span>
              <span
                className={`font-semibold capitalize px-2 py-0.5 rounded text-[11px] ${
                  order.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.paymentStatus === 'added_to_khata'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {order.paymentStatus === 'added_to_khata' ? 'Added to Khata Balance' : order.paymentStatus}
              </span>
            </div>
            {order.paymentMethod === 'store_balance' && (
              <p className="text-[10px] text-stone-500 pt-1 border-t border-stone-200">
                • This bill has been debited to {order.customerName}&apos;s store balance account.
              </p>
            )}
          </div>

          <div className="text-center pt-2 text-[11px] text-stone-400">
            Thank you for shopping at FreshMart! We deliver pure quality.
          </div>
        </div>
      </div>
    </div>
  );
};
