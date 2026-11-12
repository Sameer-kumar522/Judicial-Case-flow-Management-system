
import { useEffect, useState, useCallback } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  FileText,
} from 'lucide-react';

import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api.js';

const initialForm = {
  caseId: '',
  judgeId: '',
  courtId: '',
  hearingDate: '',
  hearingType: 'Regular',
  status: 'Scheduled',
  proceedingsSummary: '',
  nextHearingDate: '',
};

const hearingTypes = ['Initial', 'Regular', 'Final', 'Emergency'];

const statuses = [
  'Scheduled',
  'Completed',
  'Adjourned',
  'Cancelled',
];

// Different APIs may return arrays under different property names.
const getArray = (data, keys) => {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  'Something went wrong. Please try again.';

// Handles both populated MongoDB references and plain ObjectId strings.
const getReferenceId = (reference) => {
  if (!reference) return '';
  if (typeof reference === 'string') return reference;
  return reference._id ? String(reference._id) : String(reference);
};

const formatDate = (date) => {
  if (!date) return '—';

  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const toDateTimeInput = (date) => {
  if (!date) return '';

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return '';

  const localDate = new Date(
    value.getTime() - value.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().slice(0, 16);
};

const getStatusStyle = (status) => {
  const styles = {
    Scheduled: 'bg-blue-50 text-blue-700 border-blue-100',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Adjourned: 'bg-amber-50 text-amber-700 border-amber-100',
    Cancelled: 'bg-red-50 text-red-700 border-red-100',
  };

  return styles[status] || 'bg-slate-100 text-slate-600 border-slate-200';
};

const Hearings = () => {
  const { user } = useAuth();
  const role = user?.role;

  const canManage = ['Admin', 'Clerk'].includes(role);
  const canUpdateStatus = ['Admin', 'Clerk', 'Judge'].includes(role);
  const isAdmin = role === 'Admin';

  const [hearings, setHearings] = useState([]);
  const [cases, setCases] = useState([]);
  const [judges, setJudges] = useState([]);
  const [courts, setCourts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHearing, setEditingHearing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Keep every judge visible. Judges assigned to another court remain disabled.
  const availableJudges = judges;

  const selectedCase = cases.find(
    (item) => getReferenceId(item._id) === form.caseId
  );
  const caseHasAssignedCourt = Boolean(
    getReferenceId(selectedCase?.court)
  );

  const showSuccess = (message) => {
    setSuccess(message);
    setError('');
  };

  const showError = (message) => {
    setError(message);
    setSuccess('');
  };

  // Fetch hearings with search and filters.
  const fetchHearings = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};

      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.hearingType = typeFilter;

      const response = await api.get('/hearings', { params });

      setHearings(
        getArray(response.data, ['hearings'])
      );

      setError('');
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  // Fetch dropdown data.
  const fetchDropdownData = useCallback(async () => {
    const results = await Promise.allSettled([
      api.get('/cases'),
      api.get('/judges'),
      api.get('/courts'),
    ]);

    if (results[0].status === 'fulfilled') {
      setCases(
        getArray(results[0].value.data, ['cases'])
      );
    }

    if (results[1].status === 'fulfilled') {
      setJudges(
        getArray(results[1].value.data, ['judges'])
      );
    }

    if (results[2].status === 'fulfilled') {
      setCourts(
        getArray(results[2].value.data, ['courts'])
      );
    }

    const failed = results.find(
      (result) => result.status === 'rejected'
    );

    if (failed) {
      showError(
        'Some dropdown data could not be loaded. Check your Cases, Judges and Courts APIs.'
      );
    }
  }, []);

  useEffect(() => {
    fetchHearings();
  }, [fetchHearings]);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  const openAddModal = () => {
    setEditingHearing(null);
    setForm(initialForm);
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const openEditModal = (hearing) => {
    setEditingHearing(hearing);

    setForm({
      caseId: hearing.case?._id || hearing.case || '',
      judgeId: hearing.judge?._id || hearing.judge || '',
      courtId: hearing.court?._id || hearing.court || '',
      hearingDate: toDateTimeInput(hearing.hearingDate),
      hearingType: hearing.hearingType || 'Regular',
      status: hearing.status || 'Scheduled',
      proceedingsSummary: hearing.proceedingsSummary || '',
      nextHearingDate: toDateTimeInput(hearing.nextHearingDate),
    });

    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingHearing(null);
    setForm(initialForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Selecting a case sets its court, but the user chooses the judge manually.
  const handleCaseChange = (event) => {
    const caseId = event.target.value;
    const selectedCase = cases.find(
      (item) => getReferenceId(item._id) === caseId
    );

    setForm((previous) => ({
      ...previous,
      caseId,
      courtId: getReferenceId(selectedCase?.court),
      judgeId: '',
    }));
  };

  // If the court is changed manually, clear a judge who belongs to another court.
  const handleCourtChange = (event) => {
    const courtId = event.target.value;
    const selectedJudge = judges.find(
      (judge) => getReferenceId(judge._id) === form.judgeId
    );

    setForm((previous) => ({
      ...previous,
      courtId,
      judgeId:
        selectedJudge &&
        getReferenceId(selectedJudge.assignedCourt) === courtId
          ? previous.judgeId
          : '',
    }));
  };

  // Add or edit a hearing.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.caseId ||
      !form.judgeId ||
      !form.courtId ||
      !form.hearingDate
    ) {
      showError('Please fill in all required fields.');
      return;
    }

    const payload = {
      case: form.caseId,
      judge: form.judgeId,
      court: form.courtId,
      hearingDate: new Date(form.hearingDate).toISOString(),
      hearingType: form.hearingType,
      status: form.status,
      proceedingsSummary: form.proceedingsSummary,
      nextHearingDate: form.nextHearingDate
        ? new Date(form.nextHearingDate).toISOString()
        : null,
    };

    try {
      setSaving(true);
      setError('');

      if (editingHearing) {
        await api.put(
          `/hearings/${editingHearing._id}`,
          payload
        );

        showSuccess('Hearing updated successfully.');
      } else {
        await api.post('/hearings', payload);

        showSuccess('Hearing scheduled successfully.');
      }

      setModalOpen(false);
      setEditingHearing(null);
      setForm(initialForm);

      await fetchHearings();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Update hearing status.
  const handleStatusChange = async (hearingId, status) => {
    try {
      await api.patch(`/hearings/${hearingId}/status`, {
        status,
      });

      showSuccess('Hearing status updated successfully.');
      await fetchHearings();
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  // Delete hearing.
  const handleDelete = async (hearing) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete hearing for ${
        hearing.case?.caseNumber || 'this case'
      }?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/hearings/${hearing._id}`);

      showSuccess('Hearing deleted successfully.');
      await fetchHearings();
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const total = hearings.length;
  const scheduled = hearings.filter(
    (item) => item.status === 'Scheduled'
  ).length;
  const completed = hearings.filter(
    (item) => item.status === 'Completed'
  ).length;
  const adjourned = hearings.filter(
    (item) => item.status === 'Adjourned'
  ).length;

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-[#B18A45]">Hearings</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold text-[#17243B]">
              Hearing Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Schedule, monitor and manage court hearings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchHearings}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            {canManage && (
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 rounded-xl bg-[#17243B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#243653]"
              >
                <Plus size={17} />
                Schedule Hearing
              </button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 size={18} />
            <span>{success}</span>
            <button
              onClick={() => setSuccess('')}
              className="ml-auto"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Hearings"
            value={total}
            icon={CalendarDays}
            iconStyle="bg-blue-50 text-blue-700"
          />

          <StatCard
            title="Scheduled"
            value={scheduled}
            icon={Clock}
            iconStyle="bg-indigo-50 text-indigo-700"
          />

          <StatCard
            title="Completed"
            value={completed}
            icon={CalendarCheck}
            iconStyle="bg-emerald-50 text-emerald-700"
          />

          <StatCard
            title="Adjourned"
            value={adjourned}
            icon={AlertCircle}
            iconStyle="bg-amber-50 text-amber-700"
          />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search case, judge or court..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#B18A45] focus:ring-2 focus:ring-[#B18A45]/10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-[#B18A45]"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-[#B18A45]"
            >
              <option value="">All Hearing Types</option>
              {hearingTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hearings table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#17243B]">
                Hearing Records
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {hearings.length} record(s) found
              </p>
            </div>

            <FileText size={20} className="text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Case Details</th>
                  <th className="px-5 py-4 font-semibold">Judge</th>
                  <th className="px-5 py-4 font-semibold">Court</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Type</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  {(canManage || canUpdateStatus || isAdmin) && (
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-16 text-center text-sm text-slate-500"
                    >
                      Loading hearing records...
                    </td>
                  </tr>
                ) : hearings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-16 text-center">
                      <CalendarDays
                        size={35}
                        className="mx-auto text-slate-300"
                      />
                      <p className="mt-3 font-medium text-slate-600">
                        No hearings found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  hearings.map((hearing) => (
                    <tr
                      key={hearing._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#17243B]">
                          {hearing.case?.caseNumber || 'Case unavailable'}
                        </p>
                        <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                          {hearing.case?.title || '—'}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {hearing.judge?.fullName || '—'}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {hearing.judge?.designation || ''}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {hearing.court?.courtName || '—'}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {hearing.court?.benchLocation || ''}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(hearing.hearingDate)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                          {hearing.hearingType}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                            hearing.status
                          )}`}
                        >
                          {hearing.status}
                        </span>
                      </td>

                      {(canManage || canUpdateStatus || isAdmin) && (
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {canUpdateStatus && (
                              <select
                                value={hearing.status}
                                onChange={(event) =>
                                  handleStatusChange(
                                    hearing._id,
                                    event.target.value
                                  )
                                }
                                title="Update status"
                                className="max-w-[125px] rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-[#B18A45]"
                              >
                                {statuses.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            )}

                            {canManage && (
                              <button
                                onClick={() => openEditModal(hearing)}
                                title="Edit hearing"
                                className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Pencil size={16} />
                              </button>
                            )}

                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(hearing)}
                                title="Delete hearing"
                                className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
            <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="text-lg font-bold text-[#17243B]">
                    {editingHearing ? 'Edit Hearing' : 'Schedule New Hearing'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter the hearing information below.
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">

                  <FormField label="Select Case" required>
                    <select
                      name="caseId"
                      value={form.caseId}
                      onChange={handleCaseChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#B18A45] focus:ring-2 focus:ring-[#B18A45]/10"
                    >
                      <option value="">Choose a case</option>
                      {cases.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.caseNumber} — {item.title}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Select Judge" required>
                    <select
                      name="judgeId"
                      value={form.judgeId}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#B18A45] focus:ring-2 focus:ring-[#B18A45]/10"
                    >
                      <option value="">Choose a judge</option>
                      {availableJudges.map((item) => {
                        const assignedCourtId = getReferenceId(item.assignedCourt);
                        const belongsToSelectedCourt =
                          !form.courtId ||
                          !assignedCourtId ||
                          assignedCourtId === form.courtId;

                        return (
                          <option
                            key={item._id}
                            value={item._id}
                          >
                            {item.fullName} — {item.designation}
                            {!belongsToSelectedCourt ? ' (Other Court)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <p className="mt-1.5 text-xs text-slate-500">
                      All judges are selectable. Choose the judge for this hearing; the server will validate the court assignment.
                    </p>
                  </FormField>

                  <FormField label="Select Court" required>
                    <select
                      name="courtId"
                      value={form.courtId}
                      onChange={handleCourtChange}
                      required
                      disabled={caseHasAssignedCourt}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#B18A45] focus:ring-2 focus:ring-[#B18A45]/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <option value="">Choose a court</option>
                      {courts.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.courtName} — {item.benchLocation}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Hearing Date & Time" required>
                    <input
                      type="datetime-local"
                      name="hearingDate"
                      value={form.hearingDate}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#B18A45] focus:ring-2 focus:ring-[#B18A45]/10"
                    />
                  </FormField>

                  <FormField label="Hearing Type">
                    <select
                      name="hearingType"
                      value={form.hearingType}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#B18A45] focus:ring-2 focus:ring-[#B18A45]/10"
                    >
                      {hearingTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Status">
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#B18A45] focus:ring-2 focus:ring-[#B18A45]/10"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Next Hearing Date">
                    <input
                      type="datetime-local"
                      name="nextHearingDate"
                      value={form.nextHearingDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#B18A45] focus:ring-2 focus:ring-[#B18A45]/10"
                    />
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField label="Proceedings Summary">
                      <textarea
                        name="proceedingsSummary"
                        value={form.proceedingsSummary}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Enter proceedings summary..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#B18A45] focus:ring-2 focus:ring-[#B18A45]/10 resize-none"
                      />
                    </FormField>
                  </div>

                  {error && (
                    <div className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[#17243B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#243653] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? 'Saving...'
                      : editingHearing
                        ? 'Save Changes'
                        : 'Schedule Hearing'}
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

// Reusable statistics card.
const StatCard = ({ title, value, icon: Icon, iconStyle }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-2 text-2xl font-bold text-[#17243B]">
          {value}
        </h3>
      </div>

      <div className={`rounded-xl p-3 ${iconStyle}`}>
        <Icon size={22} />
      </div>
    </div>
  </div>
);

// Reusable form field.
const FormField = ({ label, required, children }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    {children}
  </div>
);

export default Hearings;