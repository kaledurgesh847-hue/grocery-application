import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Store,
  ShoppingCart,
  Receipt,
  User,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    activeCustomerTab,
    setActiveCustomerTab,
    activeCustomer,
    setActiveCustomer,
    customers,
    cartCount,
    setIsCartOpen,
    resetDemoData,
  } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Banner / Role Switcher Strip */}
      <div className="bg-stone-900 text-stone-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-medium text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            Fresh Local Delivery
          </span>
          <span className="text-stone-500">•</span>
          <span className="text-stone-300">Fast 45-Min Home Delivery & Khata Store Credit</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Profile Switching in Customer Mode */}
          {viewMode === 'customer' && (
            <div className="flex items-center gap-1.5 text-stone-300">
              <User className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline">Shopping as:</span>
              <div className="relative inline-block">
                <select
                  id="active-customer-selector"
                  value={activeCustomer.id}
                  onChange={(e) => {
                    const found = customers.find((c) => c.id === e.target.value);
                    if (found) setActiveCustomer(found);
                  }}
                  className="bg-stone-800 text-amber-300 font-medium rounded px-2 py-0.5 pr-6 text-xs border border-stone-700 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-amber-400 appearance-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Due: ₹{c.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-stone-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          <button
            id="reset-demo-data-button"
            onClick={resetDemoData}
            title="Reset to default grocery & ledger data"
            className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => {
            setViewMode('customer');
            setActiveCustomerTab('browse');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="brand-logo-button"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-stone-900 tracking-tight">FreshMart</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                Groceries
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">Inventory, Express Delivery & Khata Ledger</p>
          </div>
        </div>

        {/* View Mode Switcher (Customer Storefront vs Store Owner / Manager) */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            id="switch-customer-mode-btn"
            onClick={() => setViewMode('customer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'customer'
                ? 'bg-white text-emerald-950 shadow-xs border border-stone-200/60 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>Customer Store</span>
          </button>

          <button
            id="switch-store-manager-mode-btn"
            onClick={() => setViewMode('store_manager')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'store_manager'
                ? 'bg-stone-900 text-white shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Store Khata & Manager</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {viewMode === 'customer' ? (
            <>
              {/* Order History link */}
              <button
                id="header-orders-tab-btn"
                onClick={() => setActiveCustomerTab('orders')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer border ${
                  activeCustomerTab === 'orders'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Track Orders</span>
              </button>

              {/* Cart Drawer Trigger */}
              <button
                id="header-cart-open-btn"
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="bg-amber-400 text-stone-950 font-bold px-1.5 py-0.5 rounded-full text-[11px] leading-none animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-lg text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Owner Portal
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
