
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

import {
  Landmark,
  UserPlus,
  Users,
  User,
  Mail,
  LockKeyhole,
  ShieldCheck,
  RefreshCw,
  Pencil,
  Save,
  X,
  CheckCircle,
  Ban,
  ArrowLeft,
} from 'lucide-react';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const roles = ['Clerk', 'Judge', 'Registrar', 'Lawyer'];

const getDefaultDesignation = (role) => {
  const designations = {
    Clerk: 'Court Clerk',
    Judge: 'Judge',
    Registrar: 'Court Registrar',
    Lawyer: 'Advocate',
  };

  return designations[role] || 'Judicial Staff';
};

function Register() {
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Clerk',
    designation: 'Court Clerk',
  });

  const [users, setUsers] = useState([]);
  const [edits, setEdits] = useState({});

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/auth/users');

      const fetchedUsers = response.data.users || [];

      setUsers(fetchedUsers);

      const initialEdits = {};

      fetchedUsers.forEach((item) => {
        initialEdits[item._id] = {
          role: item.role,
          designation: item.designation || '',
          isActive: item.isActive,
        };
      });

      setEdits(initialEdits);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load users. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle create form
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Create new user
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setCreating(true);

    try {
      await api.post('/auth/register', formData);

      setSuccess('New user account created successfully.');

      setFormData({
        fullName: '',
        email: '',
        password: '',
        role: 'Clerk',
        designation: 'Court Clerk',
      });

      await fetchUsers();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Account creation failed.'
      );
    } finally {
      setCreating(false);
    }
  };

  // Handle editing users
  const handleEditChange = (id, field, value) => {
    setEdits((previous) => ({
      ...previous,
      [id]: {
        ...previous[id],
        [field]: value,
      },
    }));
  };

  // Save user changes
  const handleSave = async (id) => {
    setError('');
    setSuccess('');
    setSavingId(id);

    try {
      await api.patch(`/auth/users/${id}`, edits[id]);

      setSuccess('User information updated successfully.');

      await fetchUsers();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to update user.'
      );
    } finally {
      setSavingId(null);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((item) => item.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <MainLayout>
  <div className="min-h-screen">
      {/* HEADER */}

      <header className="bg-[#101D35] text-white px-6 py-5 shadow-lg">

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="bg-[#C5A46D] p-3 rounded-xl">
              <Landmark size={25} className="text-[#101D35]" />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                CFMS
              </h1>

              <p className="text-xs text-slate-400 tracking-widest">
                ADMINISTRATION PORTAL
              </p>
            </div>

          </div>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

        </div>

      </header>

      <main className="max-w-7xl mx-auto p-5 sm:p-8">

        {/* PAGE TITLE */}

        <div className="mb-8">

          <p className="text-sm font-bold text-[#B18B50] uppercase tracking-widest mb-2">
            Administration
          </p>

          <h2 className="text-3xl font-bold text-[#17243B]">
            User Management
          </h2>

          <p className="text-slate-500 mt-2">
            Create and manage accounts for judicial staff.
          </p>

        </div>

        {/* STATISTICS */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Users
                </p>

                <h3 className="text-3xl font-bold text-[#17243B] mt-2">
                  {totalUsers}
                </h3>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
                <Users size={25} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Active Users
                </p>

                <h3 className="text-3xl font-bold text-green-600 mt-2">
                  {activeUsers}
                </h3>
              </div>

              <div className="p-3 rounded-xl bg-green-50 text-green-700">
                <CheckCircle size={25} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Inactive Users
                </p>

                <h3 className="text-3xl font-bold text-red-600 mt-2">
                  {inactiveUsers}
                </h3>
              </div>

              <div className="p-3 rounded-xl bg-red-50 text-red-700">
                <Ban size={25} />
              </div>
            </div>
          </div>

        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm">
            {success}
          </div>
        )}

        {/* CREATE USER FORM */}

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">

          <div className="flex items-center gap-3 mb-7">

            <div className="bg-[#E9EEF7] text-[#203D68] p-3 rounded-xl">
              <UserPlus size={23} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#17243B]">
                Create New User
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Add a new account to the judicial system.
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* FULL NAME */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#B18B50] focus:ring-4 focus:ring-[#B18B50]/10"
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#B18B50] focus:ring-4 focus:ring-[#B18B50]/10"
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Temporary Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#B18B50] focus:ring-4 focus:ring-[#B18B50]/10"
                  />
                </div>
              </div>

              {/* ROLE */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Account Role
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={(e) => {
                    const role = e.target.value;

                    setFormData((previous) => ({
                      ...previous,
                      role,
                      designation: getDefaultDesignation(role),
                    }));
                  }}
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#B18B50] bg-white"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESIGNATION */}

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Designation
                </label>

                <input
                  type="text"
                  name="designation"
                  required
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Enter designation"
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:border-[#B18B50] focus:ring-4 focus:ring-[#B18B50]/10"
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={creating}
              className="bg-[#172B4D] hover:bg-[#223D67] disabled:opacity-60 text-white px-7 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-3 transition"
            >
              <UserPlus size={18} />

              {creating ? 'Creating Account...' : 'Create User Account'}
            </button>

          </form>

        </section>

        {/* USERS TABLE */}

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-6 sm:p-8 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">

            <div>
              <h3 className="text-xl font-bold text-[#17243B]">
                Registered Users
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                View and manage system accounts.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>

          </div>

          {loading ? (

            <div className="p-12 text-center text-slate-500">
              Loading users...
            </div>

          ) : users.length === 0 ? (

            <div className="p-12 text-center text-slate-500">
              No users found.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left min-w-[900px]">

                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">

                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Designation</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {users.map((item) => {
                    const isCurrentUser =
                      String(item._id) === String(currentUser?._id);

                    const isAdmin = item.role === 'Admin';

                    const canEdit = !isCurrentUser && !isAdmin;

                    const currentEdit = edits[item._id] || {};

                    return (

                      <tr key={item._id} className="hover:bg-slate-50/70">

                        {/* USER DETAILS */}

                        <td className="px-6 py-5">

                          <div className="font-semibold text-[#17243B]">
                            {item.fullName}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-[#B18B50]">
                                (You)
                              </span>
                            )}
                          </div>

                          <div className="text-sm text-slate-500 mt-1">
                            {item.email}
                          </div>

                        </td>

                        {/* ROLE */}

                        <td className="px-6 py-5">

                          <select
                            value={currentEdit.role || item.role}
                            disabled={!canEdit}
                            onChange={(e) =>
                              handleEditChange(
                                item._id,
                                'role',
                                e.target.value
                              )
                            }
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-slate-100 disabled:text-slate-500"
                          >
                            <option value="Admin">Admin</option>

                            {roles.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>

                        </td>

                        {/* DESIGNATION */}

                        <td className="px-6 py-5">

                          <input
                            type="text"
                            value={currentEdit.designation ?? item.designation ?? ''}
                            disabled={!canEdit}
                            onChange={(e) =>
                              handleEditChange(
                                item._id,
                                'designation',
                                e.target.value
                              )
                            }
                            className="w-40 border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                          />

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-5">

                          <button
                            type="button"
                            disabled={!canEdit}
                            onClick={() =>
                              handleEditChange(
                                item._id,
                                'isActive',
                                !currentEdit.isActive
                              )
                            }
                            className={`px-3 py-1.5 rounded-full text-xs font-bold disabled:opacity-60 ${
                              currentEdit.isActive
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {currentEdit.isActive ? 'Active' : 'Inactive'}
                          </button>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-5">

                          {canEdit ? (

                            <button
                              type="button"
                              disabled={savingId === item._id}
                              onClick={() => handleSave(item._id)}
                              className="flex items-center gap-2 bg-[#172B4D] hover:bg-[#223D67] disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                            >
                              <Save size={15} />

                              {savingId === item._id ? 'Saving...' : 'Save'}
                            </button>

                          ) : (

                            <span className="text-xs text-slate-400">
                              Protected account
                            </span>

                          )}

                        </td>

                      </tr>

                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </section>

        <p className="text-center text-xs text-slate-400 mt-8">
          © 2026 CFMS | Judicial Case Flow Management System
        </p>

      </main>

    </div>
</MainLayout>
  );
}

export default Register;
