import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Settings() {
  const { user, updateLocalUser } = useAuth();
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/users/profile', profile);
      if (data.success) {
        updateLocalUser(data.data);
        toast.success('Profile updated');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/password', password);
      toast.success('Password updated');
      setPassword({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Profile, password, and theme (toggle in the header).</p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</p>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
          <div>
            <label className="text-xs font-semibold text-slate-500">First name</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Last name</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit">Save profile</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Password</h2>
        <form className="mt-4 space-y-4" onSubmit={savePassword}>
          <div>
            <label className="text-xs font-semibold text-slate-500">Current password</label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={password.currentPassword}
              onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">New password (min 8)</label>
            <input
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/80"
              value={password.newPassword}
              onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Update password</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
