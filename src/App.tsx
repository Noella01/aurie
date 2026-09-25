import React, { useState, useEffect, useCallback } from 'react';
import {
  Product,
  CartItem,
  CategoryType,
  ProductColor,
  Order,
} from './types';
import {
  getProducts,
  updateProduct,
  subscribeToStoreEvents,
  INITIAL_PRODUCTS,
} from './services/api';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { QuickViewModal } from './components/QuickViewModal';
import { SearchModal } from './components/SearchModal';
import { WishlistDrawer } from './components/WishlistDrawer';

// Views
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CustomClothingView } from './views/CustomClothingView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { AdminDashboardView } from './views/AdminDashboardView';

type AdminTab = 'overview' | 'products' | 'orders' | 'custom' | 'inventory' | 'payments' | 'settings';

export default function App() {
  // Products state
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Parse initial route from URL
  const parseRoute = useCallback(() => {
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    if (pathname.startsWith('/admin')) {
      const sub = pathname.replace('/admin', '').replace(/^\//, '').split('/')[0];
      const validTabs: AdminTab[] = ['overview', 'products', 'orders', 'custom', 'inventory', 'payments', 'settings'];
      const adminTab: AdminTab = validTabs.includes(sub as any) ? (sub as AdminTab) : 'overview';
      return {
        role: 'admin' as const,
        adminTab,
        customerView: 'home',
        category: 'All' as CategoryType,
        orderNum: '',
      };
    }

    let customerView = 'home';
    if (pathname.startsWith('/shop')) {
      customerView = 'shop';
    } else if (pathname.startsWith('/custom')) {
      customerView = 'custom';
    } else if (pathname.startsWith('/track-order') || pathname.startsWith('/track')) {
      customerView = 'track-order';
    }

    const catParam = searchParams.get('category');
    const validCats: CategoryType[] = ['All', 'Men', 'Women', 'Unisex', 'Culture'];
    const category = catParam && validCats.includes(catParam as any) ? (catParam as CategoryType) : 'All';
    const orderNum = searchParams.get('order') || '';

    return {
      role: 'customer' as const,
      adminTab: 'overview' as AdminTab,
      customerView,
      category,
      orderNum,
    };
  }, []);

  const [currentRole, setCurrentRole] = useState<'customer' | 'admin'>(() => parseRoute().role);
  const [activeView, setActiveView] = useState<string>(() => parseRoute().customerView);
  const [adminTab, setAdminTab] = useState<AdminTab>(() => parseRoute().adminTab);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(() => parseRoute().category);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string>(() => parseRoute().orderNum);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart & Wishlist state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('lenos_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('lenos_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Live Toast Notification
  const [liveToast, setLiveToast] = useState<{ message: string; sub?: string } | null>(null);

  // Synchronize route when user clicks back/forward or enters URL
  const applyRoute = useCallback(() => {
    const route = parseRoute();
    setCurrentRole(route.role);
    setAdminTab(route.adminTab);
    setActiveView(route.customerView);
    setSelectedCategory(route.category);
    if (route.orderNum) {
      setTrackingOrderNumber(route.orderNum);
    }
  }, [parseRoute]);

  // URL Navigation helper
  const navigateTo = (url: string) => {
    if (window.location.pathname + window.location.search !== url) {
      window.history.pushState({}, '', url);
    }
    applyRoute();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.addEventListener('popstate', applyRoute);
    return () => {
      window.removeEventListener('popstate', applyRoute);
    };
  }, [applyRoute]);

  // Load products on mount
  useEffect(() => {
    getProducts().then((data) => setProducts(data));

    const unsubOrder = subscribeToStoreEvents('order_updated', (order: Order) => {
      setLiveToast({
        message: `Order #${order.order_number} Status Updated`,
        sub: `New status: ${order.status} (${new Date().toLocaleTimeString()})`,
      });
      setTimeout(() => setLiveToast(null), 4000);
    });

    const unsubProductCreated = subscribeToStoreEvents('product_created', (newProd: Product) => {
      setProducts((prev) => [newProd, ...prev]);
    });

    const unsubProductUpdated = subscribeToStoreEvents('product_updated', (updProd: Product) => {
      setProducts((prev) => prev.map((p) => (p.id === updProd.id ? updProd : p)));
    });

    const unsubProductDeleted = subscribeToStoreEvents('product_deleted', ({ id }: { id: string }) => {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    });

    return () => {
      unsubOrder();
      unsubProductCreated();
      unsubProductUpdated();
      unsubProductDeleted();
    };
  }, []);

  // Save cart & wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('lenos_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('lenos_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Cart operations
  const handleAddToCart = (
    product: Product,
    size: string,
    color: ProductColor,
    quantity: number = 1
  ) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor.name === color.name
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }
      return [...prev, { product, selectedSize: size, selectedColor: color, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleBuyNow = (
    product: Product,
    size: string,
    color: ProductColor,
    quantity: number = 1
  ) => {
    handleAddToCart(product, size, color, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (idx: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(idx);
      return;
    }
    setCartItems((prev) => {
      const next = [...prev];
      next[idx].quantity = newQty;
      return next;
    });
  };

  const handleRemoveCartItem = (idx: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Wishlist toggle
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Customer navigation handlers
  const handleNavigate = (view: string, categoryFilter?: CategoryType) => {
    if (view === 'home') {
      navigateTo('/');
    } else if (view === 'shop') {
      if (categoryFilter && categoryFilter !== 'All') {
        navigateTo(`/shop?category=${categoryFilter}`);
      } else {
        navigateTo('/shop');
      }
    } else if (view === 'custom') {
      navigateTo('/custom');
    } else if (view === 'track-order') {
      navigateTo('/track-order');
    } else {
      setActiveView(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackSpecificOrder = (orderNum: string) => {
    setTrackingOrderNumber(orderNum);
    navigateTo(`/track-order?order=${encodeURIComponent(orderNum)}`);
  };

  const handleUpdateProductImage = async (productId: string, imageUrl: string) => {
    await updateProduct(productId, { image_url: imageUrl });
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, image_url: imageUrl } : p))
    );
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct({ ...selectedProduct, image_url: imageUrl });
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistIds = wishlist.map((w) => w.id);

  // Dedicated Admin Portal (URL: /admin)
  if (currentRole === 'admin') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">
        <AdminDashboardView
          currentTab={adminTab}
          onTabChange={(tab) => {
            setAdminTab(tab);
            window.history.pushState({}, '', tab === 'overview' ? '/admin' : `/admin/${tab}`);
          }}
          onSwitchToCustomer={() => {
            navigateTo('/');
          }}
          onTrackOrder={handleTrackSpecificOrder}
        />
      </div>
    );
  }

  // Dedicated Customer Portal (URL: /)
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0A0A0A] text-[#F5F5F5]">
      {/* Real-Time Status Toast */}
      {liveToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#161616] border border-emerald-500/50 text-white p-3.5 shadow-2xl rounded-none max-w-sm animate-fade-in flex items-start gap-3 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mt-1"></span>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              {liveToast.message}
            </div>
            {liveToast.sub && (
              <div className="text-[11px] text-neutral-400 mt-0.5">{liveToast.sub}</div>
            )}
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentRole={currentRole}
        onSwitchRole={(role) => {
          if (role === 'admin') {
            navigateTo('/admin');
          } else {
            navigateTo('/');
          }
        }}
        activeView={activeView}
        onNavigate={handleNavigate}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <HomeView
            products={products}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p, size, col) => handleAddToCart(p, size, col, 1)}
            onNavigate={handleNavigate}
            onUpdateProductImage={handleUpdateProductImage}
          />
        )}

        {activeView === 'shop' && (
          <ShopView
            products={products}
            initialCategory={selectedCategory}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p, size, col) => handleAddToCart(p, size, col, 1)}
            onUpdateProductImage={handleUpdateProductImage}
          />
        )}

        {activeView === 'product-detail' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            onBack={() => navigateTo('/shop')}
            isWishlisted={wishlistIds.includes(selectedProduct.id)}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={(p, sz, col, qty) => handleAddToCart(p, sz, col, qty)}
            onBuyNow={(p, sz, col, qty) => handleBuyNow(p, sz, col, qty)}
            onSelectRelated={handleSelectProduct}
            relatedProducts={products.filter(
              (p) => p.category === selectedProduct.category && p.id !== selectedProduct.id
            )}
            onUpdateProductImage={handleUpdateProductImage}
          />
        )}

        {activeView === 'custom' && (
          <CustomClothingView onNavigateHome={() => navigateTo('/')} />
        )}

        {activeView === 'track-order' && (
          <OrderTrackingView
            initialOrderNumber={trackingOrderNumber}
            onNavigateShop={() => navigateTo('/shop')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onSwitchRole={(role) => {
          if (role === 'admin') {
            navigateTo('/admin');
          } else {
            navigateTo('/');
          }
        }}
        currentRole={currentRole}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal with Flutterwave & Rwanda Address */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={(order) => {
          setCartItems([]);
          setTrackingOrderNumber(order.order_number);
        }}
        onTrackOrder={(orderNumber) => {
          setIsCheckoutOpen(false);
          handleTrackSpecificOrder(orderNumber);
        }}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(p, sz, col) => handleAddToCart(p, sz, col, 1)}
        onViewDetails={handleSelectProduct}
        onUpdateProductImage={handleUpdateProductImage}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={handleSelectProduct}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={(id) => setWishlist((prev) => prev.filter((p) => p.id !== id))}
        onSelectProduct={handleSelectProduct}
      />
    </div>
  );
}
