"use client";

import { createTask } from "@/actions/taskActions";
import { Modal, InputField, Spinner } from "@/components/ui";
import { StaffsType, NoticePriority } from "@/types";
import { useState } from "react";
import { toast } from "react-toastify";
import { Save, Send, User, Calendar, FileText, AlertTriangle, Info, Zap } from "lucide-react";
import clsx from "clsx";
import { TaskSchema } from "@/validationSchemas";
import { z } from "zod";

interface TaskFormProps {
  staffs: StaffsType[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskForm({ staffs, onClose, onSuccess }: TaskFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({
    staffId: "",
    title: "",
    description: "",
    priority: "normal" as NoticePriority,
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const validated = TaskSchema.parse({
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      });

      const res = await createTask(validated);

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
      isVisible={true}
      onClose={onClose}
      title="Assign New Task"
      width="600"
    >
      <form onSubmit={handleSubmit} className="space-y-6 p-1">
        {/* Staff Selection */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <User size={14} className="text-brand" />
            Assign to Staff
          </label>
          <select
            required
            value={formData.staffId}
            onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-brand focus:bg-white rounded-2xl transition-all outline-none text-sm font-bold appearance-none cursor-pointer"
          >
            <option value="">Select a team member</option>
            {staffs.map((staff) => (
              <option key={staff.staffId} value={staff.staffId}>
                {staff.name} ({staff.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <FileText size={14} className="text-brand" />
            Task Title
          </label>
          <input
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="What needs to be done?"
            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-brand focus:bg-white rounded-2xl transition-all outline-none text-sm font-bold"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare size={14} className="text-brand" />
            Detailed Description
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide all necessary details for the staff..."
            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-brand focus:bg-white rounded-2xl transition-all outline-none text-sm font-bold resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Priority */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-brand" />
              Priority Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["low", "normal", "high", "urgent"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p as NoticePriority })}
                  className={clsx(
                    "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                    formData.priority === p 
                      ? "bg-brand/10 border-brand text-brand" 
                      : "bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} className="text-brand" />
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-brand focus:bg-white rounded-2xl transition-all outline-none text-sm font-bold"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-100 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 px-6 rounded-2xl bg-gray-100 text-gray-600 font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-[2] py-4 px-6 rounded-2xl bg-brand text-white font-black uppercase tracking-widest text-xs hover:bg-brand-800 transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
          >
            {isPending ? <Spinner message="" /> : <Send size={18} />}
            Assign Task
          </button>
        </div>
      </form>
    </Modal>
  );
}

import { MessageSquare } from "lucide-react";
