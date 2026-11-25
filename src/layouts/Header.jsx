import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  Package,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FREE_SHIPPING_THRESHOLD, formatCurrency } from '../utils/formatters';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/categories', label: 'Categories' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const { user, isAuthenticated, isAdmin, isDemoMode, signOut } = useAuth();
  const { totals, favoriteIds } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileDialogRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const dialog = mobileDialogRef.current;
    if (!dialog) return;
    if (mobileMenuOpen && !dialog.open) {
      dialog.showModal();
    } else if (!mobileMenuOpen && dialog.open) {
      dialog.close();
    }
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      {/* Top Announcement Bar */}
      <div className="bg-[#0F4C5C] px-4 py-2 text-center text-xs font-medium text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>
            Complimentary shipping on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}
          </span>
          {isDemoMode && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold">
              Local Demo Mode (Sample Catalog)
            </span>
          )}
        </div>
      </div>

      {/* Main Header Row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Mobile Menu Trigger & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link
            to="/"
            className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-slate-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F4C5C] text-base font-black text-white shadow-sm">
              V
            </span>
            <span>VELORA</span>
          </Link>
        </div>

        {/* Desktop Primary Navigation */}
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#0F4C5C]/10 text-[#0F4C5C]'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-amber-100 text-amber-900'
                    : 'text-amber-800 hover:bg-amber-50'
                }`
              }
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Admin
            </NavLink>
          )}
        </nav>

        {/* Search & Utility Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <search className="hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <label htmlFor="header-search" className="visually-hidden">
                Search products
              </label>
              <input
                id="header-search"
                type="search"
                name="q"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search curated goods..."
                enterkeyhint="search"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="w-48 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0F4C5C] focus:bg-white lg:w-60"
              />
              <Search
                className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
            </form>
          </search>

          {/* Favorites */}
          <Link
            to="/account?tab=favorites"
            aria-label={`Favorites (${favoriteIds.length} saved)`}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 hover:text-rose-600"
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            {favoriteIds.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
                {favoriteIds.length}
              </span>
            )}
          </Link>

          {/* Account / Sign In */}
          {isAuthenticated ? (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link
                to="/account"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
              >
                <User className="h-4 w-4 text-[#0F4C5C]" aria-hidden="true" />
                <span className="max-w-28 truncate">{user?.full_name || 'Account'}</span>
              </Link>
              <Link
                to="/orders"
                aria-label="My Orders"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Package className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 sm:inline-flex"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              Sign In
            </Link>
          )}

          {/* Shopping Cart */}
          <Link
            to="/cart"
            aria-label={`Shopping cart with ${totals.itemCount} items`}
            className="relative inline-flex h-10 items-center gap-2 rounded-xl bg-[#0F4C5C] px-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0A3642]"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Cart</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-xs font-extrabold">
              {totals.itemCount}
            </span>
          </Link>
        </div>
      </div>

      {/* Native Modal Mobile Navigation Drawer */}
      <dialog
        ref={mobileDialogRef}
        closedby="any"
        aria-labelledby="mobile-nav-title"
        onClose={() => setMobileMenuOpen(false)}
        className="m-0 h-dvh max-h-dvh w-80 max-w-[85vw] border-r border-slate-200 bg-white p-0 shadow-2xl"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h1 id="mobile-nav-title" className="text-lg font-extrabold text-slate-900">
              VELORA Menu
            </h1>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="p-4">
            <search>
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <label htmlFor="mobile-search" className="visually-hidden">
                  Search products
                </label>
                <input
                  id="mobile-search"
                  type="search"
                  name="q"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  enterkeyhint="search"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm"
                />
                <Search
                  className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
                  aria-hidden="true"
                />
              </form>
            </search>
          </div>

          <nav aria-label="Mobile" className="flex-1 space-y-1 overflow-y-auto px-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-semibold ${
                    isActive
                      ? 'bg-[#0F4C5C]/10 text-[#0F4C5C]'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="my-3 border-t border-slate-100 pt-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                    My Account ({user?.full_name || 'Profile'})
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Package className="h-4 w-4" aria-hidden="true" />
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-50"
                    >
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 px-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl bg-[#0F4C5C] py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </dialog>
    </header>
  );
}
