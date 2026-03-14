"use client";

import { addVirtualBalance } from "@/actions/paymentActions";
import { getStaffs } from "@/actions/staffActions";
import { Modal } from "@/components/ui";
import { StaffsType } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PlusCircle, Search, Wallet, User } from "lucide-react";

export default function AddBalanceButton() {
  const [showModal, setShowModal] = useState(false);
  const [staffs, setStaffs] = useState<Partial<StaffsType>[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Partial<StaffsType> | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (showModal && staffs.length === 0) {
      setIsLoading(true);
      getStaffs({ limit: "100" }).then((res) => {
        if (res.success && res.data) {
          setStaffs(res.data);
        }
        setIsLoading(false);
      });
    }
  }, [showModal]);

  const filteredStaffs = staffs.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.staffId?.toLowerCase().includes(q) ||
      s.phone?.includes(q)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff?.staffId || !amount) return;

    setIsSubmitting(true);
    const res = await addVirtualBalance(
      selectedStaff.staffId,
      parseFloat(amount),
      description || undefined,
      serviceId || undefined,
    );
    setIsSubmitting(false);

    if (res.success) {
      toast.success(res.message);
      setShowModal(false);
      setSelectedStaff(null);
      setAmount("");
      setDescription("");
      setServiceId("");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-semibold"
      >
        <Wallet size={16} />
        Add Balance
      </button>

      {showModal && (
        <Modal
          isVisible
          title="Add Virtual Balance"
          onClose={() => {
            setShowModal(false);
            setSelectedStaff(null);
          }}
        >
          {!selectedStaff ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search staff by name, ID or phone..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading staff...</div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {filteredStaffs.map((staff) => (
                    <button
                      key={staff.staffId}
                      onClick={() => setSelectedStaff(staff)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand/20 hover:bg-brand/5 transition-all text-left"
                    >
                      <div className="size-10 rounded-full bg-brand/10 flex items-center justify-center">
                        <User size={18} className="text-brand" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{staff.name}</p>
                        <p className="text-xs text-gray-500">{staff.staffId} · {staff.phone}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        {staff.role}
                      </span>
                    </button>
                  ))}
                  {filteredStaffs.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">No staff found</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-brand/5 rounded-xl border border-brand/10">
                <div className="size-12 rounded-full bg-brand/10 flex items-center justify-center">
                  <User size={20} className="text-brand" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selectedStaff.name}</p>
                  <p className="text-xs text-gray-500">{selectedStaff.staffId} · {selectedStaff.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStaff(null)}
                  className="ml-auto text-xs font-bold text-brand hover:underline"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (৳)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  required
                  placeholder="Enter amount to add"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service ID (optional)</label>
                <input
                  type="text"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  placeholder="e.g., SERV-123456"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g., Service charge for job #123"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !amount}
                className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl text-sm uppercase tracking-wider hover:bg-teal-700 disabled:bg-teal-300 transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle size={18} />
                {isSubmitting ? "Adding..." : `Add ৳${amount || "0"} Balance`}
              </button>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
