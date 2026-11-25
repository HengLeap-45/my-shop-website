import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  MapPin,
  Heart,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  deleteAddress,
  getAddresses,
  saveAddress,
} from '../services/accountService';
import { validateAddressForm } from '../utils/validators';
import ModalDialog from '../components/ModalDialog';
import ProductCard from '../components/ProductCard';

const EMPTY_ADDRESS = {
  id: '',
  label: 'Home',
  recipient_name: '',
  phone: '',
  street_address: '',
  apartment: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'United States',
  is_default: false,
};

export default function AccountPage() {
  useDocumentTitle('My Account');
  const { user, isAdmin, updateProfile, signOut } = useAuth();
  const { favoriteIds } = useCart();
  const { products } = useCatalog();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'profile';
  const setTab = (tab) => setSearchParams({ tab }, { replace: true });

  // Profile state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDRESS);
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    setFullName(user?.full_name || '');
    setPhone(user?.phone || '');
  }, [user?.full_name, user?.phone]);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingAddresses(true);
    getAddresses(user.id)
      .then(setAddresses)
      .catch(() => {})
      .finally(() => setLoadingAddresses(false));
  }, [user?.id]);

  const favoriteProducts = products.filter((p) => favoriteIds.includes(p.id));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Full name cannot be empty.', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({ full_name: fullName, phone });
      showToast('Profile details updated.');
    } catch (err) {
      showToast(err.message || 'Could not update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const openNewAddress = () => {
    setAddrForm({ ...EMPTY_ADDRESS, recipient_name: user?.full_name || '', phone: user?.phone || '' });
    setAddrModalOpen(true);
  };

  const openEditAddress = (addr) => {
    setAddrForm({ ...EMPTY_ADDRESS, ...addr });
    setAddrModalOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const errors = validateAddressForm(addrForm);
    if (Object.keys(errors).length > 0) {
      showToast(Object.values(errors)[0], 'error');
      return;
    }
    setSavingAddr(true);
    try {
      await saveAddress(user.id, addrForm);
      const refreshed = await getAddresses(user.id);
      setAddresses(refreshed);
      setAddrModalOpen(false);
      showToast('Shipping address saved.');
    } catch (err) {
      showToast(err.message || 'Failed to save address.', 'error');
    } finally {
      setSavingAddr(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteAddress(user.id, addressId);
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      showToast('Address removed.', 'info');
    } catch (err) {
      showToast(err.message || 'Could not delete address.', 'error');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out.', 'info');
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F4C5C]">
            Customer Portal
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
            Welcome, {user?.full_name || user?.email}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-4 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-200"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Admin Dashboard
            </Link>
          )}
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
          >
            <Package className="h-4 w-4" aria-hidden="true" />
            My Orders
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Account sections">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'addresses', label: `Addresses (${addresses.length})`, icon: MapPin },
          { id: 'favorites', label: `Favorites (${favoriteProducts.length})`, icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(tab.id)}
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

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-extrabold text-slate-900">Profile Details</h2>
          <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
            <div>
              <label htmlFor="acc-email" className="mb-1 block text-xs font-bold text-slate-700">
                Email Address
              </label>
              <input
                id="acc-email"
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-600"
              />
            </div>

            <div>
              <label htmlFor="acc-name" className="mb-1 block text-xs font-bold text-slate-700">
                Full Name <span aria-hidden="true">*</span>
              </label>
              <input
                id="acc-name"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label htmlFor="acc-phone" className="mb-1 block text-xs font-bold text-slate-700">
                Phone Number
              </label>
              <input
                id="acc-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (415) 555-0192"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-xl bg-[#0F4C5C] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0A3642] disabled:opacity-60"
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Saved Shipping Addresses</h2>
            <button
              type="button"
              onClick={openNewAddress}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F4C5C] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0A3642]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Address
            </button>
          </div>

          {loadingAddresses ? (
            <p className="text-sm text-slate-500">Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No saved addresses yet. Add one for faster checkout.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {addresses.map((addr) => (
                <article
                  key={addr.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#F5F3EE] px-3 py-1 text-xs font-bold text-slate-800">
                        {addr.label}
                      </span>
                      {addr.is_default && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-3 font-bold text-slate-900">{addr.recipient_name}</p>
                    <p className="mt-1 text-sm text-slate-600">{addr.street_address}</p>
                    <p className="text-sm text-slate-600">
                      {addr.city}, {addr.state} {addr.postal_code}
                    </p>
                    <p className="text-sm text-slate-600">{addr.country}</p>
                    {addr.phone && <p className="mt-1 text-xs text-slate-500">{addr.phone}</p>}
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => openEditAddress(addr)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div>
          <h2 className="mb-5 text-lg font-extrabold text-slate-900">Saved Favorites</h2>
          {favoriteProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-sm text-slate-600">
                You haven&apos;t saved any favorite products yet.
              </p>
              <Link
                to="/shop"
                className="mt-4 inline-flex rounded-xl bg-[#0F4C5C] px-5 py-2.5 text-xs font-bold text-white"
              >
                Explore Shop
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {favoriteProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Address Modal Dialog */}
      <ModalDialog
        open={addrModalOpen}
        onClose={() => setAddrModalOpen(false)}
        title={addrForm.id ? 'Edit Shipping Address' : 'Add Shipping Address'}
      >
        <form onSubmit={handleSaveAddress} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="m-label" className="mb-1 block text-xs font-bold text-slate-700">
                Label (e.g. Home, Office)
              </label>
              <input
                id="m-label"
                type="text"
                value={addrForm.label}
                onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="m-name" className="mb-1 block text-xs font-bold text-slate-700">
                Full Name <span aria-hidden="true">*</span>
              </label>
              <input
                id="m-name"
                type="text"
                required
                autoComplete="name"
                value={addrForm.recipient_name}
                onChange={(e) => setAddrForm({ ...addrForm, recipient_name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="m-street" className="mb-1 block text-xs font-bold text-slate-700">
                Street Address <span aria-hidden="true">*</span>
              </label>
              <textarea
                id="m-street"
                rows={2}
                required
                autoComplete="street-address"
                value={addrForm.street_address}
                onChange={(e) => setAddrForm({ ...addrForm, street_address: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="m-city" className="mb-1 block text-xs font-bold text-slate-700">
                City <span aria-hidden="true">*</span>
              </label>
              <input
                id="m-city"
                type="text"
                required
                autoComplete="address-level2"
                value={addrForm.city}
                onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="m-state" className="mb-1 block text-xs font-bold text-slate-700">
                State / Region
              </label>
              <input
                id="m-state"
                type="text"
                autoComplete="address-level1"
                value={addrForm.state}
                onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="m-postal" className="mb-1 block text-xs font-bold text-slate-700">
                Postal Code
              </label>
              <input
                id="m-postal"
                type="text"
                autoComplete="postal-code"
                value={addrForm.postal_code}
                onChange={(e) => setAddrForm({ ...addrForm, postal_code: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="m-country" className="mb-1 block text-xs font-bold text-slate-700">
                Country <span aria-hidden="true">*</span>
              </label>
              <input
                id="m-country"
                type="text"
                required
                autoComplete="country-name"
                value={addrForm.country}
                onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="m-phone" className="mb-1 block text-xs font-bold text-slate-700">
                Phone
              </label>
              <input
                id="m-phone"
                type="tel"
                autoComplete="tel"
                value={addrForm.phone}
                onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={addrForm.is_default}
                  onChange={(e) => setAddrForm({ ...addrForm, is_default: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#0F4C5C]"
                />
                Set as default shipping address
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddrModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingAddr}
              className="rounded-xl bg-[#0F4C5C] px-5 py-2 text-sm font-bold text-white hover:bg-[#0A3642] disabled:opacity-60"
            >
              {savingAddr ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
}
