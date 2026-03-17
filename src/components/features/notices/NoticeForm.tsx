"use client";

import { createNotice, updateNotice } from "@/actions";
import { Modal, InputField, Spinner } from "@/components/ui";
import { NoticePriority, NoticeTarget, StaffsType } from "@/types";
import { NoticeSchema } from "@/validationSchemas";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import {
  Search,
  User,
  Users,
  Bell,
  AlertTriangle,
  Clock,
  Save,
  Send,
} from "lucide-react";
import clsx from "clsx";

type NoticeFormProps = {
  staffs: StaffsType[];
  initialData?: any;
  onClose: () => void;
  onSuccess: () => void;
};

export default function NoticeForm({
  staffs,
  initialData,
  onClose,
  onSuccess,
}: NoticeFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    priority: (initialData?.priority as NoticePriority) || "normal",
    targetType: (initialData?.targetType as NoticeTarget) || "all",
    isDraft: initialData?.isDraft || false,
    scheduledAt: initialData?.scheduledAt
      ? new Date(initialData.scheduledAt).toISOString().slice(0, 16)
      : "",
    expiresAt: initialData?.expiresAt
      ? new Date(initialData.expiresAt).toISOString().slice(0, 16)
      : "",
    recipientIds: initialData?.recipients?.map((r: any) => r.staffId) || [],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, setIsPending] = useState(false);

  const filteredStaffs = staffs.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staffId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleRecipient = (staffId: string) => {
    setFormData((prev) => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(staffId)
        ? prev.recipientIds.filter((id: string) => id !== staffId)
        : [...prev.recipientIds, staffId],
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent,
    isDraftSubmit: boolean = false,
  ) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const dataToValidate = {
        ...formData,
        isDraft: isDraftSubmit,
        scheduledAt: formData.scheduledAt
          ? new Date(formData.scheduledAt)
          : null,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null,
      };

      NoticeSchema.parse(dataToValidate);

      let res;
      if (initialData?.id) {
        res = await updateNotice(initialData.id, dataToValidate);
      } else {
        res = await createNotice(dataToValidate);
      }

      if (res.success) {
        toast.success(res.message);
        onSuccess();
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      } else {
        console.error(error);
        toast.error("Something went wrong");
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal
      isVisible
      onClose={onClose}
      title={initialData ? "Edit Notice" : "Compose New Notice"}
      width="800"
    >
      <form className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">
            Notice Title
          </label>
          <input
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="e.g., Policy Update, Emergency Meeting"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none font-bold"
          />
        </div>

        {/* Priority & Target */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Priority Level
            </label>
            <div className="flex gap-2">
              {(["low", "normal", "high", "urgent"] as NoticePriority[]).map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, priority: p }))
                    }
                    className={clsx(
                      "flex-1 py-2 px-3 rounded-xl text-sm font-black uppercase tracking-tight transition-all border-2",
                      formData.priority === p
                        ? {
                            "bg-blue-50 border-blue-200 text-blue-700":
                              p === "low",
                            "bg-emerald-50 border-emerald-200 text-emerald-700":
                              p === "normal",
                            "bg-orange-50 border-orange-200 text-orange-700":
                              p === "high",
                            "bg-rose-50 border-rose-200 text-rose-700":
                              p === "urgent",
                          }
                        : "bg-white border-gray-100 text-gray-400 hover:border-gray-200",
                    )}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Target Audience
            </label>
            <div className="flex gap-2">
              {(["all", "multiple", "single"] as NoticeTarget[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, targetType: t }))
                  }
                  className={clsx(
                    "flex-1 py-2 px-3 rounded-xl text-sm font-black uppercase tracking-tight transition-all border-2",
                    formData.targetType === t
                      ? "bg-brand/5 border-brand/20 text-brand"
                      : "bg-white border-gray-100 text-gray-400 hover:border-gray-200",
                  )}
                >
                  {t === "all"
                    ? "All Staff"
                    : t === "multiple"
                      ? "Groups"
                      : "Individual"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recipient Selection (if multiple/single) */}
        {formData.targetType !== "all" && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700">
                Select Recipients ({formData.recipientIds.length})
              </label>
              <div className="relative w-48">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={14}
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search staff..."
                  className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-brand"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
              {filteredStaffs.map((staff) => (
                <button
                  key={staff.staffId}
                  type="button"
                  onClick={() => toggleRecipient(staff.staffId)}
                  className={clsx(
                    "flex items-center gap-2 p-2 rounded-lg border transition-all text-left",
                    formData.recipientIds.includes(staff.staffId)
                      ? "bg-brand/10 border-brand/30"
                      : "bg-white border-gray-100 hover:border-brand/20",
                  )}
                >
                  <div className="size-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {staff.photoUrl ? (
                      <img
                        src={staff.photoUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <User size={12} className="text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {staff.name}
                    </p>
                    <p className="text-[10px] text-gray-500">{staff.staffId}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scheduling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              Schedule Release (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  scheduledAt: e.target.value,
                }))
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand transition-all outline-none text-sm font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Bell size={16} className="text-gray-400" />
              Expiry Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand transition-all outline-none text-sm font-medium"
            />
          </div>
        </div>

        {/* Content (Rich Text Sim) */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">
            Notice Content
          </label>
          <div className="border-2 border-gray-100 rounded-2xl overflow-hidden focus-within:border-brand transition-all">
            <div className="bg-gray-50 border-b border-gray-100 p-2 flex gap-1">
              {/* Basic rich text toolbar simulation */}
              {["B", "I", "U", "•"].map((tool) => (
                <button
                  key={tool}
                  type="button"
                  className="size-8 rounded-lg hover:bg-white hover:shadow-sm text-sm font-bold text-gray-600 transition-all"
                >
                  {tool}
                </button>
              ))}
            </div>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Write your notice here..."
              rows={8}
              className="w-full px-4 py-4 outline-none text-sm font-medium resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            disabled={isPending}
            onClick={(e) => handleSubmit(e, true)}
            className="flex-1 py-4 px-6 rounded-2xl bg-gray-100 text-gray-600 font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            {isPending ? <Spinner message="" /> : <Save size={18} />}
            Save Draft
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={(e) => handleSubmit(e, false)}
            className="flex-[2] py-4 px-6 rounded-2xl bg-brand text-white font-black uppercase tracking-widest text-sm hover:bg-brand-800 transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
          >
            {isPending ? <Spinner message="" /> : <Send size={18} />}
            {initialData ? "Update & Dispatch" : "Send Notice"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
