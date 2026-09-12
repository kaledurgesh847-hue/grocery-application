import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory } from '../types';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Truck,
  ShieldAlert,
  Wallet,
  Info,
  Clock,
  MapPin,
  Tag
} from 'lucide-react';

const CATEGORIES: ProductCategory[] = [
  'All',
  'Fresh Produce',
  'Dairy & Eggs',
  'Bakery & Grains',
  'Pantry & Spices',
  'Snacks & Drinks',
  'Personal & Home'
];

export const CustomerStore: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    updateCartQuantity,
    activeCustomer,
    setActiveCustomerTab,
    setIsCartOpen,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStock = !onlyInStock || (item.inStock && item.stock > 0);
      return matchesCategory && matchesSearch && matchesStock;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, onlyInStock, sortBy]);

  // Helper to get cart quantity for a product
  const getCartQuantity = (productId: string): number => {
    const item = cart.find((c) => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  const creditUsedPercent = Math.min(
    100,
    Math.round((activeCustomer.currentBalance / activeCustomer.creditLimit) * 100)
  );
  const creditAvailable = Math.max(0, activeCustomer.creditLimit - activeCustomer.currentBalance);

  return (
    <div className="space-y-6">
      {/* Customer Khata Status & Delivery Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 rounded-2xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-xs border border-emerald-500/30">
              <MapPin className="w-3.5 h-3.5" />
              <span>Delivering to: {activeCustomer.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Daily Fresh Groceries, Delivered in 45 Mins
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl line-clamp-1">
              {activeCustomer.address}
            </p>
          </div>

          {/* Customer Khata / Store Credit Balance Badge */}
          <div className="bg-stone-800/80 backdrop-blur-md border border-stone-700/80 p-3.5 rounded-xl flex flex-col gap-2 min-w-[280px]">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-stone-300 font-medium">
                <Wallet className="w-4 h-4 text-amber-400" />
                Store Khata Balance
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                activeCustomer.currentBalance > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {activeCustomer.currentBalance > 0 ? 'Pay Later Active' : 'Zero Due'}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-stone-400">Current Due:</span>
                <p className="text-lg font-bold text-amber-300">
                  ₹{activeCustomer.currentBalance.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-400">Available Credit:</span>
                <p className="text-sm font-semibold text-emerald-300">
                  ₹{creditAvailable.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Credit Progress Bar */}
            <div className="w-full bg-stone-700 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  creditUsedPercent > 80 ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${creditUsedPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-stone-400 flex items-center justify-between">
              <span>Limit: ₹{activeCustomer.creditLimit.toLocaleString('en-IN')}</span>
              <span>{creditUsedPercent}% used</span>
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white border border-stone-200 rounded-xl p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="grocery-search-input"
              type="text"
              placeholder="Search tomatoes, milk, atta, oil, dry fruits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-8 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <select
              id="sort-products-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-medium text-stone-700 focus:outline-hidden focus:border-emerald-600"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            {/* In stock toggle */}
            <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer select-none bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          Showing <strong>{filteredProducts.length}</strong> grocery items
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
        </span>
        <span className="flex items-center gap-1 text-emerald-700 font-medium">
          <Truck className="w-3.5 h-3.5" />
          Free delivery on orders ₹300+
        </span>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center text-xl">
            🔍
          </div>
          <h3 className="text-base font-semibold text-stone-800">No matching items found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing your filters, or browsing other categories.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setOnlyInStock(false);
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => {
            const qty = getCartQuantity(product.id);
            const isOutOfStock = !product.inStock || product.stock === 0;

            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                className="bg-white border border-stone-200 rounded-xl p-3 sm:p-4 flex flex-col justify-between hover:shadow-md transition-shadow group relative"
              >
                {/* Product Badge */}
                {product.badge && (
                  <span className="absolute top-2.5 left-2.5 z-10 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
                    {product.badge}
                  </span>
                )}

                {/* Top: Image & Info */}
                <div>
                  <div
                    onClick={() => setSelectedProductDetails(product)}
                    className="w-full aspect-square bg-stone-50 group-hover:bg-emerald-50/40 rounded-lg flex items-center justify-center cursor-pointer transition-colors relative mb-2.5 overflow-hidden"
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-5xl sm:text-6xl transform group-hover:scale-110 transition-transform select-none">
                        {product.imageEmoji}
                      </span>
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-stone-900/60 rounded-lg flex items-center justify-center backdrop-blur-2xs">
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider bg-rose-600 px-2 py-0.5 rounded">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] text-stone-500 font-medium">
                      {product.unit}
                    </p>
                    <h3
                      onClick={() => setSelectedProductDetails(product)}
                      className="text-xs sm:text-sm font-semibold text-stone-900 line-clamp-1 group-hover:text-emerald-700 cursor-pointer"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                    {product.origin && (
                      <p className="text-[11px] text-stone-400 line-clamp-1">
                        From: {product.origin}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom: Price & Add to Cart button */}
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm sm:text-base font-bold text-stone-900">
                        ₹{product.price}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[11px] text-stone-400 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium block">
                      {product.stock <= 5 && product.stock > 0
                        ? `Only ${product.stock} left`
                        : 'In stock'}
                    </span>
                  </div>

                  {/* Quantity Stepper or Add button */}
                  <div>
                    {isOutOfStock ? (
                      <button
                        disabled
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-400 cursor-not-allowed"
                      >
                        Sold Out
                      </button>
                    ) : qty > 0 ? (
                      <div className="flex items-center bg-emerald-50 border border-emerald-300 rounded-lg overflow-hidden shadow-2xs">
                        <button
                          id={`qty-decrease-${product.id}`}
                          onClick={() => updateCartQuantity(product.id, qty - 1)}
                          className="px-2 py-1 text-emerald-800 hover:bg-emerald-100 active:bg-emerald-200 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 py-1 text-xs font-bold text-emerald-950 min-w-[20px] text-center">
                          {qty}
                        </span>
                        <button
                          id={`qty-increase-${product.id}`}
                          onClick={() => updateCartQuantity(product.id, qty + 1)}
                          className="px-2 py-1 text-emerald-800 hover:bg-emerald-100 active:bg-emerald-200 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`add-to-cart-btn-${product.id}`}
                        onClick={() => addToCart(product, 1)}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar (if items in cart) */}
      {cart.length > 0 && (
        <div className="sticky bottom-4 z-30 max-w-xl mx-auto px-2">
          <div className="bg-stone-900 text-white p-3 sm:p-3.5 rounded-xl shadow-xl flex items-center justify-between gap-4 border border-stone-800 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <p className="text-xs text-stone-300">
                <span className="font-bold text-white">{cart.reduce((s, i) => s + i.quantity, 0)} items</span> added
              </p>
              <p className="text-base font-bold text-emerald-400">
                Subtotal: ₹{cart.reduce((s, i) => s + i.product.price * i.quantity, 0)}
              </p>
            </div>

            <button
              id="floating-checkout-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <span>View Cart & Checkout</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-stone-200 relative animate-in zoom-in-95">
            <button
              onClick={() => setSelectedProductDetails(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100"
            >
              ✕
            </button>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-emerald-50 rounded-xl flex items-center justify-center overflow-hidden border border-stone-200 shrink-0">
                {selectedProductDetails.imageUrl ? (
                  <img
                    src={selectedProductDetails.imageUrl}
                    alt={selectedProductDetails.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-5xl">{selectedProductDetails.imageEmoji}</span>
                )}
              </div>
              <div className="space-y-1">
                {selectedProductDetails.badge && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    {selectedProductDetails.badge}
                  </span>
                )}
                <h2 className="text-base font-bold text-stone-900">
                  {selectedProductDetails.name}
                </h2>
                <p className="text-xs text-stone-500">
                  Unit: {selectedProductDetails.unit}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-emerald-800">
                    ₹{selectedProductDetails.price}
                  </span>
                  {selectedProductDetails.originalPrice && (
                    <span className="text-xs text-stone-400 line-through">
                      ₹{selectedProductDetails.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-stone-50 rounded-xl p-3 text-xs space-y-1.5 border border-stone-200/70">
              <div className="flex items-center justify-between text-stone-500">
                <span>Category:</span>
                <span className="font-medium text-stone-800">{selectedProductDetails.category}</span>
              </div>
              {selectedProductDetails.origin && (
                <div className="flex items-center justify-between text-stone-500">
                  <span>Sourced From:</span>
                  <span className="font-medium text-stone-800">{selectedProductDetails.origin}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-stone-500">
                <span>Inventory Available:</span>
                <span className="font-medium text-emerald-700">{selectedProductDetails.stock} {selectedProductDetails.unit}</span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-stone-700">Product Details</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {selectedProductDetails.description}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  addToCart(selectedProductDetails, 1);
                  setSelectedProductDetails(null);
                }}
                disabled={!selectedProductDetails.inStock || selectedProductDetails.stock === 0}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:bg-stone-200 disabled:text-stone-400"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => setSelectedProductDetails(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
