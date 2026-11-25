import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CategoriesPage from './pages/CategoriesPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

/* ── Scroll to top on route change ── */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public */}
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="product/:slug" element={<ProductDetailsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />

          {/* Auth-protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailsPage />} />
          </Route>

          {/* Admin-protected */}
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="admin" element={<AdminDashboardPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
