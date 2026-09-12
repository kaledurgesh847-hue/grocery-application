import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { CustomerStore } from './components/CustomerStore';
import { CartDrawer } from './components/CartDrawer';
import { OrderHistoryView } from './components/OrderHistoryView';
import { StoreManagement } from './components/StoreManagement';
import {
  Store,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  HeartHandshake,
  Clock,
  Phone
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    viewMode,
    activeCustomerTab,
    toastMessage,
    showToast,
    setViewMode,
  } = useStore();

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Global Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {viewMode === 'customer' ? (
          <div>
            {activeCustomerTab === 'browse' ? (
              <CustomerStore />
            ) : (
              <OrderHistoryView />
            )}
          </div>
        ) : (
          <StoreManagement />
        )}
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-stone-900/95 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium border border-stone-700/80 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-8 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-stone-900">FreshMart Groceries & Superstore</p>
              <p className="text-[11px] text-stone-400">
                Fresh Farm Groceries • Express 45-Min Delivery • Customer Khata Credit Ledger
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-stone-600">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Open Daily: 7:00 AM – 10:30 PM
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              Free Delivery on ₹300+
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              Support: +91 98000 12345
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
