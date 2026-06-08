import { ShoppingCart, Menu, Search, User, X, Heart, LogOut } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuthStore } from '../../store/useAuthStore';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { user, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalWishlistItems = wishlistItems.length;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMenuOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mr-4 lg:hidden text-gray-700 hover:text-black"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold tracking-tighter text-black uppercase">CHOPPOL</span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-gray-700">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
            <Link to="/about" className="hover:text-black transition-colors">About Us</Link>
            <Link to="/blog" className="hover:text-black transition-colors">Blog</Link>
            <Link to="/track-order" className="hover:text-black transition-colors">Track Order</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-700 hover:text-black"
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            <Link to={user ? (isAdmin ? '/admin' : '/dashboard') : '/login'} className="text-gray-700 hover:text-black">
              <User className="h-5 w-5" />
            </Link>
            {user && (
              <button 
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
            <Link to="/wishlist" className="relative text-gray-700 hover:text-red-500 transition-colors">
              <Heart className="h-5 w-5" />
              {totalWishlistItems > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {totalWishlistItems}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative text-gray-700 hover:text-black">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop Search Bar Expansion */}
        {isSearchOpen && (
          <div className="py-4 border-t border-gray-100">
            <form onSubmit={handleSearch} className="flex max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search products, brands, or categories..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-l-xl focus:ring-0 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="px-6 py-3 bg-black text-white rounded-r-xl font-bold">
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t bg-white h-[calc(100vh-4rem)] overflow-y-auto">
          {!isSearchOpen && (
            <div className="p-4 border-b border-gray-100">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-l-lg focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-r-lg font-bold">
                  Go
                </button>
              </form>
            </div>
          )}
          <div className="space-y-1 px-4 py-4">
            <Link onClick={() => setIsMenuOpen(false)} to="/" className="block py-3 text-base font-medium text-gray-900 border-b border-gray-50">Home</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/shop" className="block py-3 text-base font-medium text-gray-900 border-b border-gray-50">Shop</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/about" className="block py-3 text-base font-medium text-gray-900 border-b border-gray-50">About Us</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/blog" className="block py-3 text-base font-medium text-gray-900 border-b border-gray-50">Blog</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/track-order" className="block py-3 text-base font-medium text-gray-900 border-b border-gray-50">Track Order</Link>
            {user && (
              <button 
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="w-full text-left py-3 text-base font-medium text-red-600 border-b border-gray-50 flex items-center"
              >
                <LogOut className="h-5 w-5 mr-3" /> Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
