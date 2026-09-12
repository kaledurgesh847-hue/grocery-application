import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import {
  CustomerAccount,
  LedgerTransaction,
  Order,
  OrderStatus,
  PaymentChannel,
  Product,
  ProductCategory
} from '../types';
import { ReceiptModal } from './ReceiptModal';
import { ImageUploader } from './ImageUploader';
import {
  Wallet,
  Users,
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  Receipt,
  Phone,
  Clock,
  ShieldCheck,
  Edit2,
  RefreshCw,
  X,
  Share2,
  Copy,
  ExternalLink,
  Camera,
  Image as ImageIcon,
  Tag,
  Check
} from 'lucide-react';

export const StoreManagement: React.FC = () => {
  const {
    customers,
    orders,
    products,
    ledgerTransactions,
    updateOrderStatus,
    recordCustomerPayment,
    addManualCustomerCharge,
    addNewCustomer,
    updateCustomerCreditLimit,
    updateProductStock,
    updateProduct,
    addNewProduct,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'khata' | 'orders' | 'inventory' | 'summary'>('khata');

  // Khata search & filter
  const [customerSearch, setCustomerSearch] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'due_only' | 'settled' | 'near_limit'>('all');

  // Modals state
  const [paymentModalCustomer, setPaymentModalCustomer] = useState<CustomerAccount | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel>('upi');
  const [paymentNote, setPaymentNote] = useState<string>('');

  const [chargeModalCustomer, setChargeModalCustomer] = useState<CustomerAccount | null>(null);
  const [chargeAmount, setChargeAmount] = useState<string>('');
  const [chargeDescription, setChargeDescription] = useState<string>('');

  const [passbookCustomer, setPassbookCustomer] = useState<CustomerAccount | null>(null);
  const [reminderCustomer, setReminderCustomer] = useState<CustomerAccount | null>(null);

  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustLimit, setNewCustLimit] = useState('5000');
  const [newCustNotes, setNewCustNotes] = useState('');

  // Add Product modal state (with rate and computer image upload)
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('Fresh Produce');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('1 kg');
  const [newProdStock, setNewProdStock] = useState('25');
  const [newProdEmoji, setNewProdEmoji] = useState('🥕');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Edit Product / Change Rate & Image modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdCategory, setEditProdCategory] = useState<ProductCategory>('Fresh Produce');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdOriginalPrice, setEditProdOriginalPrice] = useState('');
  const [editProdUnit, setEditProdUnit] = useState('1 kg');
  const [editProdStock, setEditProdStock] = useState('20');
  const [editProdEmoji, setEditProdEmoji] = useState('📦');
  const [editProdImageUrl, setEditProdImageUrl] = useState<string>('');
  const [editProdBadge, setEditProdBadge] = useState('');
  const [editProdDesc, setEditProdDesc] = useState('');
  const [editProdOrigin, setEditProdOrigin] = useState('');
  const [editProdInStock, setEditProdInStock] = useState(true);

  // Quick Rate Modal
  const [quickRateProduct, setQuickRateProduct] = useState<Product | null>(null);
  const [quickRateValue, setQuickRateValue] = useState<string>('');
  const [quickMrpValue, setQuickMrpValue] = useState<string>('');

  // Quick Row Image Upload from Computer
  const quickRowFileInputRef = useRef<HTMLInputElement | null>(null);
  const [quickRowProductId, setQuickRowProductId] = useState<string | null>(null);

  // Orders Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);

  // Computed Metrics
  const totalOutstandingBalance = useMemo(() => {
    return customers.reduce((sum, c) => sum + c.currentBalance, 0);
  }, [customers]);

  const totalCreditLimits = useMemo(() => {
    return customers.reduce((sum, c) => sum + c.creditLimit, 0);
  }, [customers]);

  const customersWithDue = useMemo(() => {
    return customers.filter((c) => c.currentBalance > 0).length;
  }, [customers]);

  const totalPaymentsCollected = useMemo(() => {
    return ledgerTransactions
      .filter((t) => t.type === 'payment_received')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [ledgerTransactions]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch) ||
        c.address.toLowerCase().includes(customerSearch.toLowerCase());

      let matchesFilter = true;
      if (balanceFilter === 'due_only') matchesFilter = c.currentBalance > 0;
      if (balanceFilter === 'settled') matchesFilter = c.currentBalance === 0;
      if (balanceFilter === 'near_limit') {
        matchesFilter = c.currentBalance >= c.creditLimit * 0.8 && c.currentBalance > 0;
      }

      return matchesSearch && matchesFilter;
    });
  }, [customers, customerSearch, balanceFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return orders;
    return orders.filter((o) => o.orderStatus === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  // Handle Record Payment Submission
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalCustomer) return;
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid payment amount');
      return;
    }

    recordCustomerPayment({
      customerId: paymentModalCustomer.id,
      amount: amountNum,
      paymentChannel,
      referenceNote: paymentNote || undefined,
    });

    setPaymentModalCustomer(null);
    setPaymentAmount('');
    setPaymentNote('');
  };

  // Handle Manual In-store Charge Submission
  const handleAddChargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeModalCustomer) return;
    const amountNum = parseFloat(chargeAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid amount');
      return;
    }

    addManualCustomerCharge({
      customerId: chargeModalCustomer.id,
      amount: amountNum,
      description: chargeDescription || 'Counter in-store grocery purchase',
    });

    setChargeModalCustomer(null);
    setChargeAmount('');
    setChargeDescription('');
  };

  // Handle New Customer Account Creation
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      showToast('Name and phone number are required.');
      return;
    }

    addNewCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim() || 'Store counter / Pickup',
      creditLimit: parseFloat(newCustLimit) || 5000,
      notes: newCustNotes.trim() || undefined,
    });

    setIsNewCustomerModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustLimit('5000');
    setNewCustNotes('');
  };

  // Handle New Product Creation
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) {
      showToast('Product name and price are required.');
      return;
    }

    addNewProduct({
      name: newProdName.trim(),
      category: newProdCategory,
      price: parseFloat(newProdPrice),
      originalPrice: newProdOriginalPrice ? parseFloat(newProdOriginalPrice) : undefined,
      unit: newProdUnit.trim() || '1 kg',
      stock: parseInt(newProdStock) || 20,
      inStock: true,
      imageEmoji: newProdEmoji || '📦',
      imageUrl: newProdImageUrl || undefined,
      description: newProdDesc || 'Fresh local grocery product.',
    });

    setIsNewProductModalOpen(false);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdOriginalPrice('');
    setNewProdImageUrl('');
    setNewProdDesc('');
  };

  // Open Full Edit Product & Rate Modal
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditProdName(p.name);
    setEditProdCategory(p.category);
    setEditProdPrice(p.price.toString());
    setEditProdOriginalPrice(p.originalPrice ? p.originalPrice.toString() : '');
    setEditProdUnit(p.unit);
    setEditProdStock(p.stock.toString());
    setEditProdEmoji(p.imageEmoji || '📦');
    setEditProdImageUrl(p.imageUrl || '');
    setEditProdBadge(p.badge || '');
    setEditProdDesc(p.description || '');
    setEditProdOrigin(p.origin || '');
    setEditProdInStock(p.inStock);
  };

  // Save Full Product Edit (Rate & Image & Details)
  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editProdName.trim() || !editProdPrice) {
      showToast('Product name and price are required.');
      return;
    }

    const priceNum = parseFloat(editProdPrice);
    const originalPriceNum = editProdOriginalPrice ? parseFloat(editProdOriginalPrice) : undefined;
    const stockNum = parseInt(editProdStock) || 0;

    updateProduct(editingProduct.id, {
      name: editProdName.trim(),
      category: editProdCategory,
      price: priceNum,
      originalPrice: originalPriceNum,
      unit: editProdUnit.trim() || '1 kg',
      stock: stockNum,
      inStock: editProdInStock && stockNum > 0,
      imageEmoji: editProdEmoji.trim() || '📦',
      imageUrl: editProdImageUrl ? editProdImageUrl : undefined,
      badge: editProdBadge.trim() || undefined,
      description: editProdDesc.trim() || '',
      origin: editProdOrigin.trim() || undefined,
    });

    showToast(`Updated rate & details for ${editProdName.trim()}!`);
    setEditingProduct(null);
  };

  // Open Quick Rate Changer
  const openQuickRateModal = (p: Product) => {
    setQuickRateProduct(p);
    setQuickRateValue(p.price.toString());
    setQuickMrpValue(p.originalPrice ? p.originalPrice.toString() : '');
  };

  // Save Quick Rate
  const handleSaveQuickRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRateProduct || !quickRateValue) return;
    const newPrice = parseFloat(quickRateValue);
    if (isNaN(newPrice) || newPrice <= 0) {
      showToast('Please enter a valid price');
      return;
    }
    const newMrp = quickMrpValue ? parseFloat(quickMrpValue) : undefined;

    updateProduct(quickRateProduct.id, {
      price: newPrice,
      originalPrice: newMrp,
    });

    showToast(`Rate for ${quickRateProduct.name} updated to ₹${newPrice}!`);
    setQuickRateProduct(null);
  };

  // Trigger quick image upload from table row
  const triggerQuickImageUpload = (productId: string) => {
    setQuickRowProductId(productId);
    quickRowFileInputRef.current?.click();
  };

  // Handle image file selection from computer for table row
  const handleQuickRowFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && quickRowProductId) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 500;
          let width = img.width;
          let height = img.height;
          if (width > height && width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            updateProduct(quickRowProductId, { imageUrl: compressed });
          } else {
            updateProduct(quickRowProductId, { imageUrl: ev.target?.result as string });
          }
          showToast('Product photo uploaded from your computer and saved!');
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-900 font-bold">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
              </span>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-stone-900">
                  Store Management & Customer Khata Ledger
                </h1>
                <p className="text-xs text-stone-500">
                  Keep track of balance payments, dispatch delivery orders, and manage grocery stock.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewCustomerModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer Ledger</span>
            </button>
          </div>
        </div>

        {/* Management Tabs */}
        <div className="flex items-center gap-2 border-t border-stone-100 pt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('khata')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'khata'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Wallet className="w-4 h-4 text-amber-400" />
            <span>Customer Khata & Balances</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full">
              ₹{totalOutstandingBalance.toLocaleString('en-IN')}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Delivery Orders</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Package className="w-4 h-4 text-teal-400" />
            <span>Inventory & Stock</span>
            <span className="bg-stone-200 text-stone-700 text-[10px] px-1.5 py-0.2 rounded-full">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'summary'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Passbook & Reports</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CUSTOMER KHATA & BALANCE LEDGER */}
      {activeTab === 'khata' && (
        <div className="space-y-6">
          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
                <span>Total Balance Due</span>
                <Wallet className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
                ₹{totalOutstandingBalance.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                From {customersWithDue} customers with dues
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
                <span>Payments Collected</span>
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
                ₹{totalPaymentsCollected.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Via Cash, UPI & Transfers
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
                <span>Registered Ledgers</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                {customers.length}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Regular customer accounts
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
                <span>Total Credit Facility</span>
                <CreditCard className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                ₹{totalCreditLimits.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {(
                  (totalOutstandingBalance / (totalCreditLimits || 1)) *
                  100
                ).toFixed(1)}
                % utilized overall
              </p>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="bg-white border border-stone-200 rounded-xl p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customer by name or phone..."
                className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setBalanceFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  balanceFilter === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All Accounts ({customers.length})
              </button>
              <button
                onClick={() => setBalanceFilter('due_only')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  balanceFilter === 'due_only'
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Has Balance Due ({customers.filter((c) => c.currentBalance > 0).length})
              </button>
              <button
                onClick={() => setBalanceFilter('near_limit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  balanceFilter === 'near_limit'
                    ? 'bg-rose-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Near Limit
              </button>
              <button
                onClick={() => setBalanceFilter('settled')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  balanceFilter === 'settled'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Zero Due
              </button>
            </div>
          </div>

          {/* Customer Ledger Directory Cards / Table */}
          <div className="space-y-3">
            {filteredCustomers.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-2">
                <p className="text-sm font-semibold text-stone-800">No customer records found</p>
                <p className="text-xs text-stone-500">Try changing your search or filter criteria.</p>
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const usedPct = Math.min(
                  100,
                  Math.round((cust.currentBalance / cust.creditLimit) * 100)
                );
                const isNearLimit = cust.currentBalance >= cust.creditLimit * 0.8;

                return (
                  <div
                    key={cust.id}
                    id={`customer-ledger-card-${cust.id}`}
                    className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Customer Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-stone-900">
                            {cust.name}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                              cust.currentBalance === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : isNearLimit
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {cust.currentBalance === 0 ? 'Settled / Clean' : isNearLimit ? 'High Due (>80%)' : 'Active Due'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            {cust.phone}
                          </span>
                          <span>•</span>
                          <span className="line-clamp-1">{cust.address}</span>
                        </div>
                        {cust.notes && (
                          <p className="text-[11px] text-stone-400 italic">
                            Note: {cust.notes}
                          </p>
                        )}
                      </div>

                      {/* Balance & Limit Meter */}
                      <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 min-w-[240px] space-y-2">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-[11px] text-stone-400 block">
                              Outstanding Due:
                            </span>
                            <span
                              className={`text-lg font-black ${
                                cust.currentBalance > 0
                                  ? 'text-amber-600'
                                  : 'text-emerald-700'
                              }`}
                            >
                              ₹{cust.currentBalance.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-stone-400 block">
                              Credit Limit:
                            </span>
                            <span className="text-xs font-semibold text-stone-700">
                              ₹{cust.creditLimit.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {/* Limit progress bar */}
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              usedPct > 80
                                ? 'bg-rose-500'
                                : usedPct > 50
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${usedPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-stone-400">
                          <span>{usedPct}% credit used</span>
                          <span>
                            Available: ₹{(cust.creditLimit - cust.currentBalance).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Strip for this Customer */}
                    <div className="border-t border-stone-100 pt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* 1. Record Payment Received */}
                        <button
                          id={`record-payment-btn-${cust.id}`}
                          onClick={() => {
                            setPaymentModalCustomer(cust);
                            setPaymentAmount(cust.currentBalance > 0 ? cust.currentBalance.toString() : '');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          <span>Record Payment</span>
                        </button>

                        {/* 2. Add Direct In-Store Purchase to Khata */}
                        <button
                          onClick={() => {
                            setChargeModalCustomer(cust);
                            setChargeAmount('');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Charge In-Store Purchase</span>
                        </button>

                        {/* 3. Send Courteous WhatsApp / SMS Reminder */}
                        {cust.currentBalance > 0 && (
                          <button
                            onClick={() => setReminderCustomer(cust)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5 text-amber-700" />
                            <span>Payment Reminder</span>
                          </button>
                        )}
                      </div>

                      {/* View Complete Passbook / Statements */}
                      <button
                        onClick={() => setPassbookCustomer(cust)}
                        className="flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-emerald-800 hover:underline cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Passbook ({ledgerTransactions.filter((t) => t.customerId === cust.id).length} txns)</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DELIVERY ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700">Filter Orders by Status:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-medium text-stone-800"
              >
                <option value="all">All Orders ({orders.length})</option>
                <option value="placed">Placed ({orders.filter((o) => o.orderStatus === 'placed').length})</option>
                <option value="packed">Packed ({orders.filter((o) => o.orderStatus === 'packed').length})</option>
                <option value="out_for_delivery">Out for Delivery ({orders.filter((o) => o.orderStatus === 'out_for_delivery').length})</option>
                <option value="delivered">Delivered ({orders.filter((o) => o.orderStatus === 'delivered').length})</option>
              </select>
            </div>
            <span className="text-xs text-stone-500">
              Showing {filteredOrders.length} orders
            </span>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xl p-10 text-center">
                <p className="text-sm font-semibold text-stone-800">No orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {order.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            order.orderStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.orderStatus === 'out_for_delivery'
                              ? 'bg-blue-100 text-blue-800'
                              : order.orderStatus === 'packed'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {order.orderStatus.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-stone-400">•</span>
                        <span className="text-xs text-stone-500">
                          {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm mt-1">
                        {order.customerName} ({order.customerPhone})
                      </h4>
                      <p className="text-xs text-stone-600 line-clamp-1">{order.deliveryAddress}</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">Slot: {order.deliverySlot}</p>
                    </div>

                    {/* Order Total & Payment Mode */}
                    <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 text-right">
                      <span className="text-xs text-stone-500 block">Total Bill:</span>
                      <span className="text-base sm:text-lg font-black text-emerald-800">
                        ₹{order.total}
                      </span>
                      <div className="mt-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            order.paymentMethod === 'store_balance'
                              ? 'bg-amber-100 text-amber-900'
                              : order.paymentMethod === 'online_paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {order.paymentMethod === 'store_balance' ? 'Khata Credit' : order.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="bg-stone-50/70 rounded-lg p-2.5 border border-stone-100 text-xs">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Ordered Groceries ({order.items.length} items):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((i, idx) => (
                        <span
                          key={idx}
                          className="bg-white border border-stone-200 px-2 py-1 rounded text-stone-700 font-medium text-[11px]"
                        >
                          {i.emoji} {i.name} ({i.quantity} × ₹{i.price})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Order Stage Controls for Store Owner */}
                  <div className="border-t border-stone-100 pt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {order.orderStatus === 'placed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'packed')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                        >
                          📦 Mark as Packed & Bagged
                        </button>
                      )}

                      {order.orderStatus === 'packed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                        >
                          🛵 Hand Over & Dispatch to Rider
                        </button>
                      )}

                      {order.orderStatus === 'out_for_delivery' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                        >
                          ✓ Confirm Delivered at Doorstep
                        </button>
                      )}

                      {order.orderStatus === 'delivered' && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Delivered Successfully
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setViewingReceiptOrder(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Print / View Invoice</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY & STOCK MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Hidden input for quick image upload from computer per row */}
          <input
            type="file"
            ref={quickRowFileInputRef}
            onChange={handleQuickRowFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-stone-900">Grocery Inventory, Rates & Photos</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Store Owner Controls
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Change product rates, add photos from your computer, and manage available stock.
              </p>
            </div>
            <button
              onClick={() => {
                setNewProdName('');
                setNewProdPrice('');
                setNewProdOriginalPrice('');
                setNewProdImageUrl('');
                setIsNewProductModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Grocery Item</span>
            </button>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3">Product & Photo</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Rate (Selling Price)</th>
                    <th className="p-3">Available Stock</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Owner Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {/* Photo Thumbnail with Hover Upload Option */}
                          {p.imageUrl ? (
                            <div className="relative group/img w-11 h-11 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-stone-100 shadow-2xs">
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <button
                                onClick={() => triggerQuickImageUpload(p.id)}
                                title="Change photo from computer"
                                className="absolute inset-0 bg-stone-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span className="text-[8px] font-bold">Replace</span>
                              </button>
                            </div>
                          ) : (
                            <div className="relative group/img w-11 h-11 rounded-lg bg-emerald-50 border border-stone-200 flex items-center justify-center text-2xl shrink-0">
                              <span>{p.imageEmoji}</span>
                              <button
                                onClick={() => triggerQuickImageUpload(p.id)}
                                title="Upload photo from computer"
                                className="absolute inset-0 bg-emerald-900/80 text-white rounded-lg flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5 text-emerald-200" />
                                <span className="text-[8px] font-bold">Add Photo</span>
                              </button>
                            </div>
                          )}

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-stone-900 text-xs">{p.name}</p>
                              {p.badge && (
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-200">
                                  {p.badge}
                                </span>
                              )}
                              {p.imageUrl && (
                                <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded border border-emerald-200">
                                  Custom Photo
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-400">{p.unit}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-stone-600 font-medium">{p.category}</td>

                      {/* Unit Rate / Price with Instant Edit Option */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-bold text-sm text-stone-900">₹{p.price}</span>
                            {p.originalPrice && p.originalPrice > p.price && (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-stone-400 line-through">
                                  ₹{p.originalPrice}
                                </span>
                                <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                                  Save ₹{p.originalPrice - p.price}
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => openQuickRateModal(p)}
                            className="p-1 rounded text-stone-400 hover:text-emerald-700 hover:bg-stone-100 cursor-pointer"
                            title="Quick Change Rate"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Stock count */}
                      <td className="p-3">
                        <span
                          className={`font-semibold ${
                            p.stock <= 5 ? 'text-rose-600 font-bold' : 'text-stone-800'
                          }`}
                        >
                          {p.stock} {p.unit}
                        </span>
                        {p.stock <= 5 && (
                          <span className="text-[10px] text-rose-500 font-medium block">Low Stock Alert</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            p.inStock && p.stock > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.inStock && p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Quick Restock */}
                          <button
                            onClick={() => updateProductStock(p.id, p.stock + 10)}
                            className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
                            title="Restock +10 units"
                          >
                            +10
                          </button>

                          {/* Quick PC Photo button */}
                          <button
                            onClick={() => triggerQuickImageUpload(p.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/60 text-stone-700 hover:text-emerald-800 text-xs font-semibold cursor-pointer transition-colors"
                            title="Upload image from computer"
                          >
                            <Camera className="w-3.5 h-3.5 text-stone-500" />
                            <span>Photo</span>
                          </button>

                          {/* Full Edit Modal */}
                          <button
                            onClick={() => openEditModal(p)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-2xs transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit Rate & Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PASSBOOK & FINANCIAL SUMMARY */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-stone-900">
                  Global Store Ledger Passbook
                </h3>
                <p className="text-xs text-stone-500">
                  Audit trail of all customer purchases charged and payments collected.
                </p>
              </div>
              <span className="text-xs text-stone-400">
                {ledgerTransactions.length} recorded entries
              </span>
            </div>

            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Transaction Type</th>
                    <th className="p-3">Notes / Reference</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {ledgerTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-stone-50/50">
                      <td className="p-3 text-stone-500">
                        {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3 font-bold text-stone-900">{tx.customerName}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            tx.type === 'payment_received'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {tx.type === 'payment_received' ? 'Payment Received' : 'Order Charge'}
                        </span>
                      </td>
                      <td className="p-3 text-stone-600">{tx.referenceNote}</td>
                      <td
                        className={`p-3 text-right font-bold ${
                          tx.type === 'payment_received' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {tx.type === 'payment_received' ? '- ' : '+ '}₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-stone-800">
                        ₹{tx.balanceAfter.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: RECORD PAYMENT RECEIVED */}
      {paymentModalCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-stone-900">Record Payment Received</h3>
              </div>
              <button
                onClick={() => setPaymentModalCustomer(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs space-y-1">
              <p className="text-stone-500">
                Customer: <strong className="text-stone-900">{paymentModalCustomer.name}</strong> ({paymentModalCustomer.phone})
              </p>
              <p className="text-stone-500">
                Current Due Balance: <strong className="text-amber-600 text-sm">₹{paymentModalCustomer.currentBalance.toLocaleString('en-IN')}</strong>
              </p>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Amount Received (₹):</label>
                <input
                  id="payment-received-amount-input"
                  type="number"
                  required
                  min={1}
                  step="any"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full text-base font-bold text-emerald-800 p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Payment Mode:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['upi', 'cash', 'bank_transfer', 'cheque'] as PaymentChannel[]).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setPaymentChannel(mode)}
                      className={`p-2 rounded-lg text-xs font-semibold capitalize border transition-all cursor-pointer ${
                        paymentChannel === mode
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-500 ring-1 ring-emerald-500'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {mode.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Note / Reference (Optional):</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. GPay UPI Ref 38192 or Cash at store counter"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Save & Deduct from Balance
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentModalCustomer(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD IN-STORE PURCHASE TO KHATA */}
      {chargeModalCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-stone-900">Charge In-Store Shopping</h3>
              </div>
              <button
                onClick={() => setChargeModalCustomer(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs space-y-1">
              <p className="text-stone-500">Customer: <strong>{chargeModalCustomer.name}</strong></p>
              <p className="text-stone-500">Remaining Credit: <strong>₹{(chargeModalCustomer.creditLimit - chargeModalCustomer.currentBalance).toLocaleString('en-IN')}</strong></p>
            </div>

            <form onSubmit={handleAddChargeSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Bill Amount (₹):</label>
                <input
                  type="number"
                  required
                  min={1}
                  step="any"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                  placeholder="e.g. 450"
                  className="w-full text-base font-bold text-stone-900 p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Item Details / Bill Description:</label>
                <input
                  type="text"
                  value={chargeDescription}
                  onChange={(e) => setChargeDescription(e.target.value)}
                  placeholder="e.g. 5kg Basmati Rice + 1L Oil purchased at shop"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Add Charge to Khata
                </button>
                <button
                  type="button"
                  onClick={() => setChargeModalCustomer(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CUSTOMER PASSBOOK STATEMENT */}
      {passbookCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-stone-200 my-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  {passbookCustomer.name}&apos;s Khata Passbook
                </h3>
                <p className="text-xs text-stone-500">
                  Complete audit history of orders and payments
                </p>
              </div>
              <button
                onClick={() => setPassbookCustomer(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
              <div>
                <span className="text-stone-400 text-[11px] block">Current Balance Due:</span>
                <span className="font-black text-amber-600 text-base">
                  ₹{passbookCustomer.currentBalance.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-stone-400 text-[11px] block">Credit Limit:</span>
                <span className="font-semibold text-stone-800 text-sm">
                  ₹{passbookCustomer.creditLimit.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-stone-400 text-[11px] block">Customer Contact:</span>
                <span className="font-medium text-stone-700">{passbookCustomer.phone}</span>
              </div>
            </div>

            {/* Passbook Table */}
            <div className="max-h-80 overflow-y-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200 sticky top-0">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Particulars / Note</th>
                    <th className="p-2.5 text-right">Debit (+)</th>
                    <th className="p-2.5 text-right">Credit (-)</th>
                    <th className="p-2.5 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {ledgerTransactions
                    .filter((t) => t.customerId === passbookCustomer.id)
                    .map((tx) => (
                      <tr key={tx.id} className="hover:bg-stone-50/50">
                        <td className="p-2.5 text-stone-500 whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="p-2.5 text-stone-800 font-medium">
                          {tx.referenceNote}
                          {tx.paymentChannel && (
                            <span className="text-[10px] text-stone-400 block uppercase">
                              via {tx.paymentChannel}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right font-bold text-amber-700">
                          {tx.type === 'purchase_charge' ? `₹${tx.amount}` : '-'}
                        </td>
                        <td className="p-2.5 text-right font-bold text-emerald-700">
                          {tx.type === 'payment_received' ? `₹${tx.amount}` : '-'}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-stone-900">
                          ₹{tx.balanceAfter.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPassbookCustomer(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold text-stone-800 cursor-pointer"
              >
                Close Passbook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PAYMENT REMINDER DISPATCH */}
      {reminderCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-stone-900">Payment Reminder</h3>
              </div>
              <button
                onClick={() => setReminderCustomer(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Send a polite balance settlement reminder to <strong>{reminderCustomer.name}</strong> ({reminderCustomer.phone}):
            </p>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-xs text-stone-800 space-y-2 font-mono">
              <p>
                &ldquo;Dear {reminderCustomer.name}, this is a gentle reminder regarding your pending grocery balance of ₹{reminderCustomer.currentBalance.toLocaleString('en-IN')} at FreshMart.
              </p>
              <p>
                You can settle via UPI to <strong>freshmart@upi</strong> or pay by cash at your convenience. Thank you for your continued support! - FreshMart Store&rdquo;
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  const text = `Dear ${reminderCustomer.name}, this is a gentle reminder regarding your pending grocery balance of ₹${reminderCustomer.currentBalance.toLocaleString('en-IN')} at FreshMart. You can pay via UPI to freshmart@upi or cash. Thank you!`;
                  navigator.clipboard.writeText(text);
                  showToast('Reminder message copied to clipboard!');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Message</span>
              </button>

              <button
                onClick={() => {
                  const text = encodeURIComponent(
                    `Dear ${reminderCustomer.name}, this is a gentle reminder regarding your pending grocery balance of ₹${reminderCustomer.currentBalance.toLocaleString('en-IN')} at FreshMart. You can pay via UPI to freshmart@upi or cash. Thank you!`
                  );
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                  showToast('Opened WhatsApp reminder prompt');
                  setReminderCustomer(null);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD NEW CUSTOMER ACCOUNT */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-stone-900">Add Customer Ledger Account</h3>
              </div>
              <button
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-stone-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Suresh Raina"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. +91 98111 22233"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">Delivery Address</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="e.g. Flat 301, Royal Palms"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">Khata Credit Limit (₹)</label>
                <input
                  type="number"
                  value={newCustLimit}
                  onChange={(e) => setNewCustLimit(e.target.value)}
                  placeholder="5000"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">Internal Store Notes</label>
                <input
                  type="text"
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                  placeholder="e.g. Settles on 1st of every month"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Create Ledger Account
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD NEW PRODUCT (WITH COMPUTER PHOTO UPLOAD & RATES) */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-stone-200 my-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-stone-900">Add New Grocery Product</h3>
              </div>
              <button
                onClick={() => setIsNewProductModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Fresh Alphonso Mangoes"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Photo Upload from Computer */}
              <div>
                <ImageUploader
                  currentImageUrl={newProdImageUrl}
                  onImageSelected={setNewProdImageUrl}
                  onImageRemoved={() => setNewProdImageUrl('')}
                  label="Product Photo from Computer (Optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="Fresh Produce">Fresh Produce</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Bakery & Grains">Bakery & Grains</option>
                    <option value="Pantry & Spices">Pantry & Spices</option>
                    <option value="Snacks & Drinks">Snacks & Drinks</option>
                    <option value="Personal & Home">Personal & Home</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700">Fallback Emoji Icon</label>
                  <input
                    type="text"
                    value={newProdEmoji}
                    onChange={(e) => setNewProdEmoji(e.target.value)}
                    placeholder="🥭"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600 text-center text-lg"
                  />
                </div>
              </div>

              {/* Pricing & Rates */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-1.5 text-stone-700 font-bold text-xs">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pricing & Unit Rates</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-emerald-800">Selling Rate (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full text-xs p-2 bg-white border border-emerald-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-bold text-emerald-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-600">Original MRP (₹)</label>
                    <input
                      type="number"
                      step="any"
                      value={newProdOriginalPrice}
                      onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                      placeholder="e.g. 150 (Optional)"
                      className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-600">Unit / Pack</label>
                    <input
                      type="text"
                      value={newProdUnit}
                      onChange={(e) => setNewProdUnit(e.target.value)}
                      placeholder="1 kg"
                      className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-600">Initial Stock</label>
                    <input
                      type="number"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      placeholder="25"
                      className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">Product Description</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Fresh farm produce delivered directly to your doorstep..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Save & Add Product to Inventory
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: FULL EDIT PRODUCT, RATE & PHOTO FROM COMPUTER */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-stone-200 my-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-base text-stone-900">Edit Product, Rates & Photos</h3>
                  <p className="text-[11px] text-stone-500">ID: {editingProduct.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editProdName}
                  onChange={(e) => setEditProdName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-semibold"
                />
              </div>

              {/* Photo Upload from Computer */}
              <div>
                <ImageUploader
                  currentImageUrl={editProdImageUrl}
                  onImageSelected={setEditProdImageUrl}
                  onImageRemoved={() => setEditProdImageUrl('')}
                  label="Upload Product Photo from Your Computer"
                />
              </div>

              {/* Rates Section */}
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                    <span>Change Product Rates & MRP</span>
                  </div>
                  {editProdPrice && editProdOriginalPrice && parseFloat(editProdOriginalPrice) > parseFloat(editProdPrice) && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Customer Saves ₹{(parseFloat(editProdOriginalPrice) - parseFloat(editProdPrice)).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-800 block mb-1">
                      Selling Rate (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-emerald-700">₹</span>
                      <input
                        type="number"
                        step="any"
                        required
                        value={editProdPrice}
                        onChange={(e) => setEditProdPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full text-sm pl-6 p-2 bg-white border border-emerald-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-bold text-emerald-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-800 block mb-1">
                      Original Rate / MRP (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-stone-400">₹</span>
                      <input
                        type="number"
                        step="any"
                        value={editProdOriginalPrice}
                        onChange={(e) => setEditProdOriginalPrice(e.target.value)}
                        placeholder="Leave blank if no MRP"
                        className="w-full text-sm pl-6 p-2 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock and Unit */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-stone-700">Unit Label</label>
                  <input
                    type="text"
                    value={editProdUnit}
                    onChange={(e) => setEditProdUnit(e.target.value)}
                    placeholder="1 kg, 500 ml, etc."
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700">Stock Count</label>
                  <input
                    type="number"
                    value={editProdStock}
                    onChange={(e) => setEditProdStock(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700">Category</label>
                  <select
                    value={editProdCategory}
                    onChange={(e) => setEditProdCategory(e.target.value as ProductCategory)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="Fresh Produce">Fresh Produce</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Bakery & Grains">Bakery & Grains</option>
                    <option value="Pantry & Spices">Pantry & Spices</option>
                    <option value="Snacks & Drinks">Snacks & Drinks</option>
                    <option value="Personal & Home">Personal & Home</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-stone-700">Special Badge / Tag</label>
                  <input
                    type="text"
                    value={editProdBadge}
                    onChange={(e) => setEditProdBadge(e.target.value)}
                    placeholder="Fresh, Offer, Organic, etc."
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700">Origin / Farm Source</label>
                  <input
                    type="text"
                    value={editProdOrigin}
                    onChange={(e) => setEditProdOrigin(e.target.value)}
                    placeholder="Local Farm, Direct Mill, etc."
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">Description</label>
                <textarea
                  rows={2}
                  value={editProdDesc}
                  onChange={(e) => setEditProdDesc(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={editProdInStock}
                  onChange={(e) => setEditProdInStock(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="inStockCheck" className="text-xs font-bold text-stone-800 cursor-pointer">
                  Mark as In-Stock & Available for Customer Orders
                </label>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes & Update Store</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: QUICK RATE CHANGER */}
      {quickRateProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-stone-900">Change Selling Rate</h3>
              </div>
              <button
                onClick={() => setQuickRateProduct(null)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <span className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-xl overflow-hidden shrink-0">
                {quickRateProduct.imageUrl ? (
                  <img
                    src={quickRateProduct.imageUrl}
                    alt={quickRateProduct.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  quickRateProduct.imageEmoji
                )}
              </span>
              <div>
                <p className="font-bold text-xs text-stone-900">{quickRateProduct.name}</p>
                <p className="text-[11px] text-stone-500">Unit: {quickRateProduct.unit}</p>
              </div>
            </div>

            <form onSubmit={handleSaveQuickRate} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-emerald-900 block mb-1">
                  New Selling Rate (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-emerald-700">₹</span>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    value={quickRateValue}
                    onChange={(e) => setQuickRateValue(e.target.value)}
                    className="w-full text-base pl-7 p-2.5 bg-white border border-emerald-400 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-950"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">
                  Original MRP (₹) (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-stone-400">₹</span>
                  <input
                    type="number"
                    step="any"
                    value={quickMrpValue}
                    onChange={(e) => setQuickMrpValue(e.target.value)}
                    placeholder="Leave empty for no MRP"
                    className="w-full text-xs pl-7 p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Update Rate Now
                </button>
                <button
                  type="button"
                  onClick={() => setQuickRateProduct(null)}
                  className="px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Viewer Modal */}
      <ReceiptModal order={viewingReceiptOrder} onClose={() => setViewingReceiptOrder(null)} />
    </div>
  );
};
