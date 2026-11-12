
import { useCallback, useEffect, useState } from "react";
import {
  FileText, Upload, Download, Pencil, Trash2,
  Search, X, RefreshCw
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const TYPES = [
  "Petition",
  "Evidence",
  "Affidavit",
  "Court Order",
  "Judgment",
  "Other",
];

const INPUT =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#172B4D]";

function getItems(response, key) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.[key])) return data.data[key];

  return [];
}

export default function Documents() {
  const { user } = useAuth();

  const canManage = ["Admin", "Clerk"].includes(user?.role);
  const isAdmin = user?.role === "Admin";

  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    case: "",
    documentTitle: "",
    documentType: "",
  });

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    documentTitle: "",
    documentType: "",
  });

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/documents");
      setDocuments(getItems(response, "documents"));
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Documents could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCases = useCallback(async () => {
    try {
      const response = await api.get("/cases");
      setCases(getItems(response, "cases"));
    } catch {
      setCases([]);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
    loadCases();
  }, [loadDocuments, loadCases]);

  const filteredDocuments = documents.filter((doc) => {
    const text =
      `${doc.documentTitle || ""} ${doc.case?.caseNumber || ""}`
        .toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());
    const matchesType = !filter || doc.documentType === filter;

    return matchesSearch && matchesType;
  });

  // Upload document
  const uploadDocument = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      !form.case ||
      !form.documentTitle.trim() ||
      !form.documentType ||
      !file
    ) {
      setError("Please complete all fields and select a file.");
      return;
    }

    const body = new FormData();

    body.append("case", form.case);
    body.append("documentTitle", form.documentTitle.trim());
    body.append("documentType", form.documentType);
    body.append("document", file);

    try {
      setSaving(true);

      await api.post("/documents", body);

      setMessage("Document uploaded successfully.");

      setForm({
        case: "",
        documentTitle: "",
        documentType: "",
      });

      setFile(null);
      setShowUpload(false);

      await loadDocuments();
    } catch (err) {
      setError(
        err.response?.data?.message || "Document upload failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // Download document
  
  // Download document from private Supabase Storage
  const downloadDocument = async (doc) => {
    try {
      setError("");

      const response = await api.get(
        `/documents/${doc._id}/download`
      );

      const downloadUrl = response.data.downloadUrl;

      if (!downloadUrl) {
        throw new Error("Download URL not found.");
      }

      const anchor = window.document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download =
        `${doc.documentTitle || "document"}.${(
          doc.fileFormat || "pdf"
        ).toLowerCase()}`;

      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

    } catch (err) {
      setError(
        err.response?.data?.message || "File download failed."
      );
    }
  };

  // Edit document details
  const startEdit = (doc) => {
    setEditing(doc);

    setEditForm({
      documentTitle: doc.documentTitle || "",
      documentType: doc.documentType || "Other",
    });
  };

  const saveEdit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      await api.put(`/documents/${editing._id}`, {
        documentTitle: editForm.documentTitle.trim(),
        documentType: editForm.documentType,
      });

      setMessage("Document updated successfully.");
      setEditing(null);

      await loadDocuments();
    } catch (err) {
      setError(
        err.response?.data?.message || "Document update failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete document (Admin only)
  const deleteDocument = async (doc) => {
    const confirmed = window.confirm(
      `Delete "${doc.documentTitle}" and its file?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/documents/${doc._id}`);

      setMessage("Document deleted successfully.");

      await loadDocuments();
    } catch (err) {
      setError(
        err.response?.data?.message || "Document deletion failed."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
              Sindh High Court
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Documents Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage and access case-related documents.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadDocuments}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            {canManage && (
              <button
                onClick={() => {
                  setShowUpload(true);
                  setError("");
                  setMessage("");
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#172B4D] px-4 py-3 text-sm font-semibold text-white hover:bg-[#243d66]"
              >
                <Upload size={16} />
                Upload Document
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            title="Total Documents"
            value={documents.length}
          />

          <Stat
            title="PDF Documents"
            value={documents.filter(
              (d) => d.fileFormat === "PDF"
            ).length}
          />

          <Stat
            title="Document Types"
            value={
              new Set(documents.map((d) => d.documentType)).size
            }
          />
        </div>

        {/* Documents Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Search and Filter */}
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title or case number..."
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#172B4D]"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="">All document types</option>

              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="p-10 text-center text-sm text-slate-500">
              Loading documents...
            </p>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center p-14 text-center">
              <FileText size={34} className="text-slate-400" />

              <p className="mt-3 font-semibold text-slate-800">
                No documents found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Uploaded documents will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    {[
                      "Document",
                      "Case",
                      "Type",
                      "File",
                      "Uploaded",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 font-semibold"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredDocuments.map((doc) => (
                    <tr
                      key={doc._id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="rounded-lg bg-blue-50 p-2 text-blue-700">
                            <FileText size={18} />
                          </span>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {doc.documentTitle}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {doc.uploadedBy?.fullName ||
                                doc.uploadedBy?.name ||
                                doc.uploadedBy?.email ||
                                "Uploader"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {doc.case?.caseNumber || "—"}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                          {doc.case?.title || ""}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {doc.documentType}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold">
                          {doc.fileFormat}
                        </span>

                        <p className="mt-1 text-xs text-slate-400">
                          {doc.fileSizeKB >= 1024
                            ? `${(doc.fileSizeKB / 1024).toFixed(1)} MB`
                            : `${doc.fileSizeKB} KB`}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {doc.uploadedAt
                          ? new Date(doc.uploadedAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <IconButton
                            label="Download"
                            onClick={() => downloadDocument(doc)}
                          >
                            <Download size={16} />
                          </IconButton>

                          {canManage && (
                            <IconButton
                              label="Edit"
                              onClick={() => startEdit(doc)}
                            >
                              <Pencil size={16} />
                            </IconButton>
                          )}

                          {isAdmin && (
                            <IconButton
                              label="Delete"
                              danger
                              onClick={() => deleteDocument(doc)}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <Modal
          title="Upload New Document"
          onClose={() => setShowUpload(false)}
        >
          <form onSubmit={uploadDocument} className="space-y-4">

            <Field label="Related Case">
              <select
                required
                value={form.case}
                onChange={(e) =>
                  setForm({ ...form, case: e.target.value })
                }
                className={INPUT}
              >
                <option value="">Select a case</option>

                {cases.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.caseNumber} — {item.title}
                  </option>
                ))}
              </select>

              {cases.length === 0 && (
                <p className="mt-1 text-xs text-amber-700">
                  No cases loaded. Check your cases API.
                </p>
              )}
            </Field>

            <Field label="Document Title">
              <input
                required
                value={form.documentTitle}
                onChange={(e) =>
                  setForm({
                    ...form,
                    documentTitle: e.target.value,
                  })
                }
                placeholder="Enter document title"
                className={INPUT}
              />
            </Field>

            <Field label="Document Type">
              <select
                required
                value={form.documentType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    documentType: e.target.value,
                  })
                }
                className={INPUT}
              >
                <option value="">Select type</option>

                {TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Select File">
              <input
                required
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setFile(e.target.files?.[0] || null)
                }
                className="mt-1 block w-full rounded-xl border border-slate-300 p-2 text-sm"
              />

              <p className="mt-1 text-xs text-slate-500">
                Allowed formats: PDF, DOCX, JPG, PNG.
              </p>
            </Field>

            <ModalActions
              onCancel={() => setShowUpload(false)}
              saving={saving}
              submitText="Upload Document"
            />
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editing && (
        <Modal
          title="Edit Document Details"
          onClose={() => setEditing(null)}
        >
          <form onSubmit={saveEdit} className="space-y-4">
            <Field label="Document Title">
              <input
                required
                value={editForm.documentTitle}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    documentTitle: e.target.value,
                  })
                }
                className={INPUT}
              />
            </Field>

            <Field label="Document Type">
              <select
                required
                value={editForm.documentType}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    documentType: e.target.value,
                  })
                }
                className={INPUT}
              >
                {TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>

            <ModalActions
              onCancel={() => setEditing(null)}
              saving={saving}
              submitText="Save Changes"
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function IconButton({ label, onClick, danger = false, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`rounded-lg border p-2 ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-slate-200 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}

function ModalActions({ onCancel, saving, submitText }) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-[#172B4D] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Please wait..." : submitText}
      </button>
    </div>
  );
}
