import { updateUserByAdmin } from '../../services/authService';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminCustomersTab({ users, orders, onRefresh }) {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const handleToggleRole = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      showToast('You cannot change your own admin role.', 'error');
      return;
    }
    const nextRole = targetUser.role === 'admin' ? 'customer' : 'admin';
    try {
      await updateUserByAdmin(targetUser.id, {
        role: nextRole,
        is_active: targetUser.is_active !== false,
      });
      await onRefresh();
      showToast(`Updated ${targetUser.email} role to ${nextRole}.`);
    } catch (err) {
      showToast(err.message || 'Could not update role.', 'error');
    }
  };

  const handleToggleActive = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      showToast('You cannot deactivate your own active session.', 'error');
      return;
    }
    const nextActive = targetUser.is_active === false;
    try {
      await updateUserByAdmin(targetUser.id, {
        role: targetUser.role,
        is_active: nextActive,
      });
      await onRefresh();
      showToast(`${targetUser.email} ${nextActive ? 'activated' : 'deactivated'}.`, 'info');
    } catch (err) {
      showToast(err.message || 'Could not update account status.', 'error');
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="visually-hidden">Customer accounts management table</caption>
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3">Account</th>
              <th scope="col" className="px-5 py-3">Role</th>
              <th scope="col" className="px-5 py-3">Orders</th>
              <th scope="col" className="px-5 py-3">Joined</th>
              <th scope="col" className="px-5 py-3">Status</th>
              <th scope="col" className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((account) => {
              const orderCount = orders.filter((o) => o.user_id === account.id).length;
              const isSelf = account.id === currentUser?.id;
              return (
                <tr key={account.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{account.full_name || 'Unnamed User'}</p>
                    <p className="text-xs text-slate-500">{account.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                        account.role === 'admin'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {account.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{orderCount}</td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDate(account.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        account.is_active !== false
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {account.is_active !== false ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        disabled={isSelf}
                        onClick={() => handleToggleRole(account)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                      >
                        {account.role === 'admin' ? 'Make Customer' : 'Make Admin'}
                      </button>
                      <button
                        type="button"
                        disabled={isSelf}
                        onClick={() => handleToggleActive(account)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                      >
                        {account.is_active !== false ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

