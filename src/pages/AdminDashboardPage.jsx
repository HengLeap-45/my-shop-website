import { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  Package,
  FolderTree,
  ClipboardList,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getAllOrders } from '../services/orderService';
import { getAllUsers } from '../services/authService';
import { ErrorBanner, PageSpinner } from '../components/LoadingSkeleton';
import AdminStatsTab from '../components/admin/AdminStatsTab';
import AdminProductsTab from '../components/admin/AdminProductsTab';
import AdminCategoriesTab from '../components/admin/AdminCategoriesTab';
import AdminOrdersTab from '../components/admin/AdminOrdersTab';
import AdminCustomersTab from '../components/admin/AdminCustomersTab';

const ADMIN_TABS = [
  { id: 'overview', label: 'Sales & Overview', icon: BarChart3 },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'customers', label: 'Customers', icon: Users },
];

export default function AdminDashboardPage() {
  useDocumentTitle('Admin Dashboard');
  const { products, categories, refreshCatalog } = useCatalog();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await refreshCatalog({ includeInactive: true });
      const [allOrders, allUsers] = await Promise.all([getAllOrders(), getAllUsers()]);
      setOrders(allOrders);
      setUsers(allUsers);
    } catch (err) {
      setError(err.message || 'Unable to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [refreshCatalog]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Protected Admin Portal
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Store Administration</h1>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Admin sections">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                active
                  ? 'bg-[#0F4C5C] text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <ErrorBanner message={error} onRetry={loadAdminData} />

      {loading ? (
        <PageSpinner label="Loading store operations..." />
      ) : (
        <div>
          {activeTab === 'overview' && (
            <AdminStatsTab products={products} orders={orders} users={users} />
          )}
          {activeTab === 'products' && (
            <AdminProductsTab
              products={products}
              categories={categories}
              onRefresh={loadAdminData}
            />
          )}
          {activeTab === 'categories' && (
            <AdminCategoriesTab
              categories={categories}
              products={products}
              onRefresh={loadAdminData}
            />
          )}
          {activeTab === 'orders' && (
            <AdminOrdersTab orders={orders} onRefresh={loadAdminData} />
          )}
          {activeTab === 'customers' && (
            <AdminCustomersTab users={users} orders={orders} onRefresh={loadAdminData} />
          )}
        </div>
      )}
    </div>
  );
}
