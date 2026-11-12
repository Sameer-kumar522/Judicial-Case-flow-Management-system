
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  RefreshCw,
  FileText,
  X,
  Save,
  Trash2,
  ArrowRight,
  ClipboardList,
} from "lucide-react";

import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

const initialForm = {
  title: "",
  description: "",
  caseType: "Civil",
  priority: "Medium",
  court: "",
  assignedJudge: "",
  plaintiffName: "",
  defendantName: "",
};

const validTransitions = {
  Pending: ["Under Review"],
  "Under Review": ["In Progress"],
  "In Progress": ["Disposed"],
  Disposed: [],
};

const statusStyle = {
  Pending: "bg-amber-50 text-amber-700",
  "Under Review": "bg-blue-50 text-blue-700",
  "In Progress": "bg-purple-50 text-purple-700",
  Disposed: "bg-green-50 text-green-700",
};

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [courts, setCourts] = useState([]);
  const [judges, setJudges] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [formData, setFormData] = useState(initialForm);

  const [selectedCase, setSelectedCase] = useState(null);
  const [nextStatus, setNextStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [statusError, setStatusError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [caseType, setCaseType] = useState("");

  // Fetch cases
  const fetchCases = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cases", {
        params: {
          search: search || undefined,
          status: status || undefined,
          caseType: caseType || undefined,
        },
      });

      setCases(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load cases. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch courts and judges
  const fetchFormOptions = async () => {
    try {
      const [courtResponse, judgeResponse] = await Promise.all([
        api.get("/courts"),
        api.get("/judges", {
          params: { status: "Active" },
        }),
      ]);

      setCourts(courtResponse.data.courts || []);
      setJudges(judgeResponse.data.judges || []);
    } catch (err) {
      console.error("Unable to load court or judge options:", err);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [search, status, caseType]);

  useEffect(() => {
    fetchFormOptions();
  }, []);

  // Form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open registration form
  const openForm = () => {
    setFormData(initialForm);
    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  };

  // Register new case
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setFormError("");
      setSuccessMessage("");

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        caseType: formData.caseType,
        priority: formData.priority,
        court: formData.court,
        plaintiff: {
          name: formData.plaintiffName.trim(),
        },
        defendant: {
          name: formData.defendantName.trim(),
        },
      };

      if (formData.assignedJudge) {
        payload.assignedJudge = formData.assignedJudge;
      }

      const response = await api.post("/cases", payload);

      setShowForm(false);
      setFormData(initialForm);

      setSuccessMessage(
        response.data.message || "Case registered successfully."
      );

      await fetchCases();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Unable to register case. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Open status update modal
  const openStatusModal = (caseItem) => {
    const availableStatuses = validTransitions[caseItem.status] || [];

    if (availableStatuses.length === 0) return;

    setSelectedCase(caseItem);
    setNextStatus(availableStatuses[0]);
    setRemarks("");
    setStatusError("");
    setShowStatusModal(true);
  };

  // Update case status
  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    if (!selectedCase || !nextStatus) return;

    try {
      setUpdatingStatus(true);
      setStatusError("");

      const response = await api.patch(
        `/cases/${selectedCase._id}/status`,
        {
          nextStatus,
          remarks: remarks.trim(),
        }
      );

      setShowStatusModal(false);
      setSelectedCase(null);
      setNextStatus("");
      setRemarks("");

      setSuccessMessage(
        response.data.message || "Case status updated successfully."
      );

      await fetchCases();
    } catch (err) {
      setStatusError(
        err.response?.data?.message ||
          "Unable to update case status. Please try again."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Delete case
  const handleDeleteCase = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this case?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/cases/${id}`);

      setSuccessMessage("Case deleted successfully.");
      await fetchCases();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete case."
      );
    }
  };

  const pendingCount = cases.filter(
    (item) => item.status === "Pending"
  ).length;

  const disposedCount = cases.filter(
    (item) => item.status === "Disposed"
  ).length;

  const availableStatuses = selectedCase
    ? validTransitions[selectedCase.status] || []
    : [];

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#101D35]">
              Case Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and monitor registered judicial cases.
            </p>
          </div>

          <button
            onClick={openForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#101D35] px-5 py-3 text-white transition hover:bg-[#1C3154]"
          >
            <Plus size={18} />
            Register New Case
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {successMessage}
            <button onClick={() => setSuccessMessage("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <p className="text-sm text-gray-500">Total Cases</p>
            <h2 className="mt-2 text-2xl font-bold text-[#101D35]">
              {cases.length}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <p className="text-sm text-gray-500">Pending Cases</p>
            <h2 className="mt-2 text-2xl font-bold text-amber-600">
              {pendingCount}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <p className="text-sm text-gray-500">Disposed Cases</p>
            <h2 className="mt-2 text-2xl font-bold text-green-600">
              {disposedCount}
            </h2>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search cases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-[#C5A46D]"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#C5A46D]"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Disposed">Disposed</option>
            </select>

            <select
              value={caseType}
              onChange={(e) => setCaseType(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#C5A46D]"
            >
              <option value="">All Case Types</option>
              <option value="Civil">Civil</option>
              <option value="Criminal">Criminal</option>
              <option value="Constitutional">Constitutional</option>
              <option value="Family">Family</option>
              <option value="Other">Other</option>
            </select>

          </div>
        </div>

        {/* Cases Table */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">

          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <h2 className="font-semibold text-[#101D35]">
              Registered Cases
            </h2>

            <button
              onClick={fetchCases}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#101D35]"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading cases...
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="mb-3 text-red-600">{error}</p>
              <button
                onClick={fetchCases}
                className="text-[#101D35] underline"
              >
                Try Again
              </button>
            </div>
          ) : cases.length === 0 ? (
            <div className="p-12 text-center">
              <FileText
                className="mx-auto mb-3 text-gray-300"
                size={36}
              />
              <p className="font-medium text-gray-600">
                No cases found
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Registered cases will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Case Number</th>
                    <th className="px-5 py-4">Case Title</th>
                    <th className="px-5 py-4">Case Type</th>
                    <th className="px-5 py-4">Court</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {cases.map((item) => {
                    const nextOptions =
                      validTransitions[item.status] || [];

                    return (
                      <tr key={item._id} className="hover:bg-gray-50">

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-[#101D35]">
                          {item.caseNumber}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-700">
                          {item.title}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {item.caseType}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {item.court?.courtName || "Not assigned"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              statusStyle[item.status] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">

                            <button
                              title="View case"
                              className="text-[#C5A46D] hover:text-[#101D35]"
                            >
                              <Eye size={18} />
                            </button>

                            {nextOptions.length > 0 && (
                              <button
                                title="Update case status"
                                onClick={() => openStatusModal(item)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ClipboardList size={18} />
                              </button>
                            )}

                            <button
                              title="Delete case"
                              onClick={() => handleDeleteCase(item._id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Case Registration Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-6">
                <div>
                  <h2 className="text-xl font-bold text-[#101D35]">
                    Register New Case
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the required judicial case information.
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

              <form onSubmit={handleSubmit} className="space-y-5 p-6">

                {formError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {formError}
                  </div>
                )}

                <div>
                  <h3 className="mb-4 font-semibold text-[#101D35]">
                    Case Information
                  </h3>

                  <div className="space-y-4">

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Case Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter case title"
                        required
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#C5A46D]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Case Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter case description"
                        required
                        rows="3"
                        className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#C5A46D]"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Case Type *
                        </label>
                        <select
                          name="caseType"
                          value={formData.caseType}
                          onChange={handleChange}
                          required
                          className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#C5A46D]"
                        >
                          <option value="Civil">Civil</option>
                          <option value="Criminal">Criminal</option>
                          <option value="Constitutional">Constitutional</option>
                          <option value="Family">Family</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Priority *
                        </label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          required
                          className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#C5A46D]"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Court *
                        </label>
                        <select
                          name="court"
                          value={formData.court}
                          onChange={handleChange}
                          required
                          className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#C5A46D]"
                        >
                          <option value="">Select Court</option>
                          {courts.map((court) => (
                            <option key={court._id} value={court._id}>
                              {court.courtName} - {court.benchLocation}
                            </option>
                          ))}
                        </select>

                        {courts.length === 0 && (
                          <p className="mt-1 text-xs text-amber-600">
                            No courts available. Please add a court first.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Assigned Judge
                        </label>
                        <select
                          name="assignedJudge"
                          value={formData.assignedJudge}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#C5A46D]"
                        >
                          <option value="">Not assigned yet</option>
                          {judges.map((judge) => (
                            <option key={judge._id} value={judge._id}>
                              {judge.fullName} - {judge.designation}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <h3 className="mb-4 font-semibold text-[#101D35]">
                    Parties Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Plaintiff Name *
                      </label>
                      <input
                        type="text"
                        name="plaintiffName"
                        value={formData.plaintiffName}
                        onChange={handleChange}
                        placeholder="Enter plaintiff name"
                        required
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#C5A46D]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Defendant Name *
                      </label>
                      <input
                        type="text"
                        name="defendantName"
                        value={formData.defendantName}
                        onChange={handleChange}
                        placeholder="Enter defendant name"
                        required
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#C5A46D]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border border-gray-200 px-5 py-3 text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || courts.length === 0}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#101D35] px-6 py-3 text-white hover:bg-[#1C3154] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={17} />
                    {submitting ? "Registering..." : "Register Case"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

              <div className="flex items-center justify-between border-b border-gray-100 p-6">
                <div>
                  <h2 className="text-xl font-bold text-[#101D35]">
                    Update Case Status
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedCase.caseNumber}
                  </p>
                </div>

                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={22} />
                </button>
              </div>

              <form
                onSubmit={handleStatusUpdate}
                className="space-y-5 p-6"
              >

                {statusError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {statusError}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Current Status
                  </label>

                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      statusStyle[selectedCase.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedCase.status}
                  </span>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Next Status *
                  </label>

                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#C5A46D]"
                  >
                    {availableStatuses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Remarks
                  </label>

                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows="3"
                    placeholder="Enter remarks about this status change..."
                    className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#C5A46D]"
                  />
                </div>

                {nextStatus === "Disposed" && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    Disposal date will automatically be recorded when the case is disposed.
                  </div>
                )}

                <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="rounded-lg border border-gray-200 px-5 py-3 text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updatingStatus || !nextStatus}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#101D35] px-6 py-3 text-white hover:bg-[#1C3154] disabled:opacity-50"
                  >
                    <ArrowRight size={17} />
                    {updatingStatus ? "Updating..." : "Update Status"}
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

export default Cases;
