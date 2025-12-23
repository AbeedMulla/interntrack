// src/pages/Tracker.jsx
// Main tracker page with full CRUD operations
// Includes search, filter, and sort functionality

import { useState, useMemo } from "react";
import { addDoc, updateDoc, deleteDoc, doc, collection, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { useApplications } from "../contexts/ApplicationsContext";
import ApplicationModal from "../components/ApplicationModal";
import { statusBadgeClasses } from "../utils/statusClasses";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ChevronDown,
  FileText,
} from "lucide-react";

const Tracker = () => {
  const { currentUser } = useAuth();
  const { applications, loading: appsLoading } = useApplications();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  // Status options for filter
  const statusOptions = ["All", "Applied", "OA", "Interview", "Rejected", "Offer"];

  const getApplicationsRef = () => {
    return collection(db, "users", currentUser.uid, "applications");
  };

  // Add new application to Firestore
  const handleAddApplication = async (formData) => {
    if (!currentUser) {
      alert("You must be logged in.");
      return;
    }

    try {
      const applicationsRef = getApplicationsRef();

      await addDoc(applicationsRef, {
        ...formData,
        dateApplied: Timestamp.fromDate(new Date(formData.dateApplied)),
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding application:", error);
      alert(error?.message || "Failed to add application. Please try again.");
    }
  };

  // Update existing application in Firestore
  const handleUpdateApplication = async (formData) => {
    if (!currentUser) {
      alert("You must be logged in.");
      return;
    }
    if (!editingApp) return;

    try {
      const appRef = doc(db, "users", currentUser.uid, "applications", editingApp.id);

      await updateDoc(appRef, {
        ...formData,
        dateApplied: Timestamp.fromDate(new Date(formData.dateApplied)),
        updatedAt: Timestamp.now(),
      });

      setIsModalOpen(false);
      setEditingApp(null);
    } catch (error) {
      console.error("Error updating application:", error);
      alert(error?.message || "Failed to update application. Please try again.");
    }
  };

  // Delete application from Firestore
  const handleDeleteApplication = async (appId) => {
    if (!currentUser) {
      alert("You must be logged in.");
      return;
    }

    const ok = window.confirm("Delete this application? This cannot be undone.");
    if (!ok) return;

    try {
      const appRef = doc(db, "users", currentUser.uid, "applications", appId);
      await deleteDoc(appRef);
    } catch (error) {
      console.error("Error deleting application:", error);
      alert(error?.message || "Failed to delete application. Please try again.");
    }
  };

  // Open modal for editing
  const openEditModal = (app) => {
    setEditingApp(app);
    setIsModalOpen(true);
  };

  // Open modal for adding
  const openAddModal = () => {
    setEditingApp(null);
    setIsModalOpen(true);
  };

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    return [...applications]
      .filter((app) => {
        const search = searchTerm.toLowerCase();
        return (
          app.company?.toLowerCase().includes(search) ||
          app.role?.toLowerCase().includes(search)
        );
      })
      .filter((app) => statusFilter === "All" || app.status === statusFilter)
      .sort((a, b) => {
        const dateA = a.dateApplied?.toDate?.() || new Date(a.dateApplied);
        const dateB = b.dateApplied?.toDate?.() || new Date(b.dateApplied);
        return dateB - dateA;
      });
  }, [applications, searchTerm, statusFilter]);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = date?.toDate?.() || new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (appsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white">
              Application Tracker
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {filteredApplications.length} of {applications.length} applications
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Application
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company or role..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-11 pr-10 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              No applications found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {applications.length === 0
                ? "You haven't added any applications yet."
                : "No applications match your search criteria."}
            </p>

            {applications.length === 0 && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Your First Application
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {app.company}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {app.role}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClasses(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(app.dateApplied)}
                    </p>
                  </div>
                </div>

                {/* ✅ ACTION BUTTONS (this is the part you were missing) */}
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => openEditModal(app)}
                    className="flex items-center gap-1 text-sm text-emerald-500 hover:text-emerald-600"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteApplication(app.id)}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApp(null);
        }}
        onSave={editingApp ? handleUpdateApplication : handleAddApplication}
        application={editingApp}
      />
    </>
  );
};

export default Tracker;
