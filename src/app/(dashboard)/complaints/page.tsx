"use client";

import { getAllComplaints, resolveComplaint } from "@/actions/complaintActions";
import { ExternalLink, Search, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    setLoading(true);
    const res = await getAllComplaints();
    if (res.success) {
      setComplaints(res.data || []);
    }
    setLoading(false);
  }

  async function handleResolve() {
    if (!selectedComplaint || !adminNotes.trim()) {
      toast.error("Please provide admin notes");
      return;
    }
    setIsResolving(true);
    const res = await resolveComplaint(
      selectedComplaint.complaintId,
      adminNotes,
    );
    if (res.success) {
      toast.success(res.message);
      setSelectedComplaint(null);
      setAdminNotes("");
      loadComplaints();
    } else {
      toast.error(res.message);
    }
    setIsResolving(false);
  }

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = filter === "all" || c.status === filter;
    const matchesSearch =
      c.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.staff.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Shield className="text-red-500" />
            Staff Reports
          </h1>
          <p className="text-gray-500">
            Manage customer complaints against staff members
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === "all" ? "bg-black text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === "pending" ? "bg-yellow-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === "resolved" ? "bg-green-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            Resolved
          </button>
        </div>
      </header>

      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by ID, Customer or Staff..."
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-red-500 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
          <Shield className="mx-auto text-gray-200 mb-4" size={64} />
          <p className="text-gray-500 font-bold">
            No reports found matching your criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => (
            <div
              key={complaint.complaintId}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      complaint.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {complaint.status}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    {complaint.complaintId}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {complaint.subject}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {complaint.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 uppercase font-bold tracking-tighter">
                      Customer
                    </span>
                    <span className="font-bold text-gray-900">
                      {complaint.customer.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 uppercase font-bold tracking-tighter">
                      Reported Staff
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-red-600 italic">
                        @{complaint.staff.name}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {complaint.staff.phone}
                      </span>
                    </div>
                  </div>
                  {complaint.serviceId && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 uppercase font-bold tracking-tighter">
                        Linked Service
                      </span>
                      <Link
                        href={`/service-track?trackingId=${complaint.serviceId}`}
                        className="text-blue-600 flex items-center gap-1 hover:underline"
                      >
                        {complaint.serviceId}
                        <ExternalLink size={10} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100">
                {complaint.status === "pending" ? (
                  <button
                    onClick={() => setSelectedComplaint(complaint)}
                    className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all"
                  >
                    Handle Report
                  </button>
                ) : (
                  <div className="text-xs">
                    <p className="font-bold text-gray-400 mb-1 uppercase tracking-tighter">
                      Admin Resolution:
                    </p>
                    <p className="text-gray-600 italic">
                      "{complaint.adminNote}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                Resolve Report
              </h2>
              <p className="text-gray-500 text-sm italic">
                Report ID: {selectedComplaint.complaintId}
              </p>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-xs font-black text-red-600 uppercase mb-2 tracking-widest">
                  Customer Complaint
                </p>
                <p className="text-gray-800 text-sm leading-relaxed">
                  "{selectedComplaint.description}"
                </p>
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-2">
                Resolution Notes
              </label>
              <textarea
                className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all"
                placeholder="Explain how you resolved this or any warnings given to staff..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            <div className="p-8 bg-gray-50 flex gap-4">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="flex-1 py-4 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={isResolving || !adminNotes.trim()}
                className="flex-1 py-4 bg-black text-white rounded-2xl text-sm font-bold shadow-lg disabled:bg-gray-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isResolving ? "Resolving..." : "Confirm Resolution"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
