
import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Save,
  Building2,
} from 'lucide-react';

import api from '../services/api';
import MainLayout from '../layouts/MainLayout';

const initialForm = {
  courtName: '',
  benchLocation: '',
  courtType: 'Circuit Court',
  roomNumber: '',
};

const Courts = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [search, setSearch] = useState('');

  // Fetch all courts
  const fetchCourts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/courts');
      setCourts(response.data.courts || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to load courts.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open add form
  const openAddForm = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFormError('');
    setSuccessMessage('');
    setShowForm(true);
  };

  // Open edit form
  const openEditForm = (court) => {
    setEditingId(court._id);

    setFormData({
      courtName: court.courtName || '',
      benchLocation: court.benchLocation || '',
      courtType: court.courtType || 'Circuit Court',
      roomNumber: court.roomNumber || '',
    });

    setFormError('');
    setSuccessMessage('');
    setShowForm(true);
  };

  // Add or update court
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setFormError('');
      setSuccessMessage('');

      const payload = {
        courtName: formData.courtName.trim(),
        benchLocation: formData.benchLocation.trim(),
        courtType: formData.courtType,
        roomNumber: formData.roomNumber.trim(),
      };

      let response;

      if (editingId) {
        response = await api.put(`/courts/${editingId}`, payload);
      } else {
        response = await api.post('/courts', payload);
      }

      setShowForm(false);
      setFormData(initialForm);
      setEditingId(null);

      setSuccessMessage(
        response.data.message ||
        (editingId
          ? 'Court updated successfully.'
          : 'Court added successfully.')
      );

      await fetchCourts();
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Unable to save court.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete court
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this court?'
    );

    if (!confirmed) return;

    try {
      setError('');
      setSuccessMessage('');

      const response = await api.delete(`/courts/${id}`);

      setSuccessMessage(
        response.data.message || 'Court deleted successfully.'
      );

      await fetchCourts();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to delete court.'
      );
    }
  };

  const filteredCourts = courts.filter((court) => {
    const searchText = search.toLowerCase();

    return (
      court.courtName?.toLowerCase().includes(searchText) ||
      court.benchLocation?.toLowerCase().includes(searchText) ||
      court.courtType?.toLowerCase().includes(searchText)
    );
  });

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#101D35]">
              Court Management
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage court locations, benches and courtrooms.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 bg-[#101D35] text-white px-5 py-3 rounded-lg hover:bg-[#1C3154] transition"
          >
            <Plus size={18} />
            Add New Court
          </button>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Courts</p>
                <h2 className="text-2xl font-bold text-[#101D35] mt-2">
                  {courts.length}
                </h2>
              </div>

              <Building2 size={28} className="text-[#C5A46D]" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-500">Bench Locations</p>
            <h2 className="text-2xl font-bold text-[#101D35] mt-2">
              {new Set(courts.map((court) => court.benchLocation)).size}
            </h2>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-5 rounded-xl border border-gray-100">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search by court name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#C5A46D]"
            />
          </div>
        </div>

        {/* Courts Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-[#101D35]">
              Registered Courts
            </h2>

            <button
              onClick={fetchCourts}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#101D35]"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading courts...
            </div>
          ) : filteredCourts.length === 0 ? (
            <div className="p-12 text-center">
              <Building2
                size={36}
                className="mx-auto text-gray-300 mb-3"
              />

              <p className="text-gray-600 font-medium">
                No courts found
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Add a new court to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Court Name</th>
                    <th className="px-5 py-4">Bench Location</th>
                    <th className="px-5 py-4">Court Type</th>
                    <th className="px-5 py-4">Room Number</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredCourts.map((court) => (
                    <tr
                      key={court._id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-[#101D35]">
                        {court.courtName}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {court.benchLocation}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {court.courtType}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {court.roomNumber || 'Not assigned'}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            title="Edit court"
                            onClick={() => openEditForm(court)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            title="Delete court"
                            onClick={() => handleDelete(court._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add / Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl">

              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-[#101D35]">
                    {editingId ? 'Edit Court' : 'Add New Court'}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Enter the court details below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={22} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-5"
              >
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Court Name *
                  </label>

                  <input
                    type="text"
                    name="courtName"
                    value={formData.courtName}
                    onChange={handleChange}
                    placeholder="e.g. Sindh High Court"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#C5A46D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bench Location *
                  </label>

                  <input
                    type="text"
                    name="benchLocation"
                    value={formData.benchLocation}
                    onChange={handleChange}
                    placeholder="e.g. Karachi, Hyderabad, Sukkur"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#C5A46D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Court Type *
                    </label>

                    <select
                      name="courtType"
                      value={formData.courtType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#C5A46D]"
                    >
                      <option value="High Court">High Court</option>
                      <option value="Circuit Court">Circuit Court</option>
                      <option value="Bench">Bench</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number
                    </label>

                    <input
                      type="text"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleChange}
                      placeholder="e.g. 01"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#C5A46D]"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#101D35] text-white rounded-lg hover:bg-[#1C3154] disabled:opacity-50"
                  >
                    <Save size={17} />
                    {submitting
                      ? 'Saving...'
                      : editingId
                        ? 'Update Court'
                        : 'Add Court'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Courts;
