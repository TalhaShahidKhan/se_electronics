"use client";

import { updateStaffSMSPreferences } from "@/actions/taskActions";
import { Spinner } from "@/components/ui";
import { StaffsType, SMSFrequency } from "@/types";
import { useState } from "react";
import { toast } from "react-toastify";
import { 
  Bell, 
  Clock, 
  Settings, 
  Save, 
  Smartphone, 
  ShieldCheck, 
  AlertCircle,
  CalendarDays
} from "lucide-react";
import clsx from "clsx";

interface SMSSettingsFormProps {
  initialData: {
    smsNotificationEnabled: boolean;
    smsWorkingHoursOnly: boolean;
    smsFrequency: SMSFrequency;
    smsOptOut: boolean;
  };
}

export default function SMSSettingsForm({ initialData }: SMSSettingsFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const res = await updateStaffSMSPreferences(formData);

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="p-8 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
          <div className="size-12 rounded-md bg-brand/5 flex items-center justify-center">
            <Smartphone size={24} className="text-brand" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">SMS Notifications</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Control how and when you receive alerts</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100 group transition-all hover:bg-white hover:border-brand/20">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-md bg-white flex items-center justify-center text-brand shadow-sm">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-black text-gray-900 uppercase tracking-tight">Enable SMS Alerts</p>
                <p className="text-xs text-gray-500 font-medium">Receive real-time SMS for new task assignments</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.smsNotificationEnabled}
                onChange={(e) => setFormData({ ...formData, smsNotificationEnabled: e.target.checked })}
                className="sr-only peer" 
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand"></div>
            </label>
          </div>

          {/* Working Hours */}
          <div className={clsx(
            "flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100 transition-all",
            !formData.smsNotificationEnabled ? "opacity-50 pointer-events-none" : "hover:bg-white hover:border-brand/20"
          )}>
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-md bg-white flex items-center justify-center text-brand shadow-sm">
                <Clock size={20} />
              </div>
              <div>
                <p className="font-black text-gray-900 uppercase tracking-tight">Working Hours Only</p>
                <p className="text-xs text-gray-500 font-medium">Only send SMS between 9:00 AM and 9:00 PM</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.smsWorkingHoursOnly}
                onChange={(e) => setFormData({ ...formData, smsWorkingHoursOnly: e.target.checked })}
                className="sr-only peer" 
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand"></div>
            </label>
          </div>

          {/* SMS Frequency */}
          <div className={clsx(
            "space-y-4",
            !formData.smsNotificationEnabled ? "opacity-50 pointer-events-none" : ""
          )}>
            <div className="flex items-center gap-2 px-2">
              <CalendarDays size={16} className="text-brand" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Notification Frequency</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, smsFrequency: "immediate" })}
                className={clsx(
                  "p-5 rounded-3xl border-2 transition-all text-left",
                  formData.smsFrequency === "immediate" 
                    ? "bg-brand/5 border-brand ring-4 ring-brand/5" 
                    : "bg-gray-50 border-transparent hover:bg-gray-100"
                )}
              >
                <p className={clsx("font-black uppercase tracking-tight text-sm", formData.smsFrequency === "immediate" ? "text-brand" : "text-gray-900")}>Immediate</p>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Send SMS as soon as a task is assigned</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, smsFrequency: "daily_digest" })}
                className={clsx(
                  "p-5 rounded-3xl border-2 transition-all text-left",
                  formData.smsFrequency === "daily_digest" 
                    ? "bg-brand/5 border-brand ring-4 ring-brand/5" 
                    : "bg-gray-50 border-transparent hover:bg-gray-100"
                )}
              >
                <p className={clsx("font-black uppercase tracking-tight text-sm", formData.smsFrequency === "daily_digest" ? "text-brand" : "text-gray-900")}>Daily Digest</p>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Receive one summary SMS at the end of the day</p>
              </button>
            </div>
          </div>

          {/* Opt-out Warning */}
          <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 flex items-start gap-4 mt-8">
            <div className="size-10 rounded-md bg-white flex items-center justify-center text-rose-500 shadow-sm shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="font-black text-rose-900 uppercase tracking-tight">Complete Opt-out</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.smsOptOut}
                    onChange={(e) => setFormData({ ...formData, smsOptOut: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-12 h-6 bg-rose-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>
              <p className="text-xs text-rose-700 font-medium mt-1 leading-relaxed">
                By enabling this, you will no longer receive any SMS notifications from SE Electronics, including urgent task updates and payment alerts.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-5 rounded-[2rem] bg-brand text-white font-black uppercase tracking-widest text-sm hover:bg-brand-800 transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-3"
      >
        {isPending ? <Spinner message="" /> : <Save size={20} />}
        Save Notification Preferences
      </button>
    </form>
  );
}
