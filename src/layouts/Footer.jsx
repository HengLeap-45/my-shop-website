import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { validateEmail } from '../utils/validators';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      showToast(err, 'error');
      return;
    }
    showToast('Subscribed to Velora editorial releases.', 'success');
    setEmail('');
  };

  return (
    <footer className="border-t border-slate-200 bg-[#111827] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 text-xl font-extrabold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F4C5C] text-base font-black text-white">
                V
              </span>
              <span>VELORA</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Thoughtfully engineered everyday goods across acoustics, workspace, home, and carry.
              Built to last with honest materials.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              Shop
            </h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/shop" className="hover:text-white">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=popular" className="hover:text-white">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              Customer Care
            </h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/account" className="hover:text-white">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              Studio Dispatch
            </h2>
            <p className="mb-4 text-sm text-slate-400">
              Receive seasonal product drops and design notes. No clutter.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <label htmlFor="footer-newsletter" className="visually-hidden">
                Email address for newsletter
              </label>
              <div className="relative flex-1">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="footer-newsletter"
                  type="email"
                  name="newsletter_email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-400 focus:border-[#C26D2D]"
                />
              </div>
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#C26D2D] px-4 font-semibold text-white transition-colors hover:bg-[#a95b22]"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs text-slate-400 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Velora Goods Studio. Built with React, Tailwind &amp; Supabase.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-white">
              Craftsmanship
            </Link>
            <Link to="/contact" className="hover:text-white">
              Support
            </Link>
            <Link to="/admin" className="hover:text-white">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
