import { getServiceById } from "@/actions";
import { ImageWithLightbox } from "@/components";
import { ServiceTrackingPageThemeColor, Timestamp } from "@/components";
import { contactDetails } from "@/constants";
import { verifySession } from "@/lib";
import { AppError, renderText } from "@/utils";
import clsx from "clsx";
import Link from "next/link";
import { notFound } from "next/navigation";

const technicianStatuses = {
  pending: {
    title: "আপনার সার্ভিস অনুরোধটি গ্রহন করা হয়েছে।",
    description: `প্রিয় গ্রাহক {customer_name}, আপনার পন্যটির সার্ভিস অনুরোধটি গ্রহন করা হয়েছে।
সার্ভিস আই ডি: {serviceId} সার্ভিসিং এর জন্য অতি শ্রীগ্রই সার্ভিস টিমকে নিযুক্ত করা হবে। সময় দিয়ে আমাদের সহযোগিতা করবেন ধন্যাবাদ।`,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
    color: "blue",
  },
  in_progress: {
    title: "সার্ভিস টিমকে নিযুক্ত করা হয়েছে।",
    description:
      "প্রিয় গ্রাহক, আপনার আবেদনের প্রেক্ষিতে আপনার পন্যটি সার্ভিস করা জন্য আমাদের অফিসিয়াল সার্ভিস টিমকে নিয়োগ দেওয়া হয়েছে। অতি শ্রীগ্রই তারা আপনার সাথে যোগাযোগ করবে।",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>
    ),
    color: "yellow",
  },
  appointment_retry: {
    title: "নিযুক্ত সার্ভিস টিম অনুরোধটি কেন্সেল করেছে।",
    description:
      "দুঃখীত। আপনার পন্যটি সার্ভিস করার জন্য যে সার্ভিস টিম নিয়োগ করা হয়েছিল, অনাকাঙ্ক্ষিত সমস্যার কারনে সার্ভিস টিমটি অনুরোধটি কেন্সেল করেছে। আমরা পুনরায় আপনার জন্য নতুন সার্ভিস টিম নিয়োগ দিচ্ছি আশা করি অতি দ্রুত সার্ভিস টিম নিযুক্ত করা হবে।",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
        />
      </svg>
    ),
    color: "yellow",
  },
  service_center: {
    title: "পন্যটি অফিসিয়াল সার্ভিসিং সেন্টারে পাঠানো হয়েছে।",
    description:
      "প্রিয় গ্রাহক {customer_name}, আপনার পন্যটি ({serviceId}) সার্ভিসিং করার জন্য আমাদের অফিসিয়াল সার্ভিস টিম আপনার ঠিকানায় গিয়ে ছিল। পন্যটির বড় ধরনের ত্রুটির কারনে হোম সার্ভিসিং করা সম্ভব না, তাই আমাদের অফিসিয়াল সার্ভিসিং সেন্টারে পাঠানো হয়েছে। আশা করি ১/২ দিনের মধ্যেই আপনার পন্যটির সমস্যা সমাধান করা হবে।সময় দিয়ে আমাদের সহযোগিতা করবেন ধন্যাবাদ।",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
        />
      </svg>
    ),
    color: "blue",
  },
  service_center_received: {
    title: "পন্যটি সার্ভিসিং সেন্টারে রিসিভ করা হয়েছে।",
    description:
      "প্রিয় গ্রাহক, আপনার পন্যটি ({serviceId}) সার্ভিসিং করার জন্য আমাদের অফিসিয়াল সার্ভিসিং সেন্টারে সিলেট এসেছে। পন্যটির বড় ধরনের ত্রুটির কারনে, আমাদের দক্ষ ইঞ্জিনিয়ার পর্যবেক্ষণ করে আপনার পন্যটির ত্রুটির সমাধান করবে। সময় দিয়ে আমাদের সহযোগিতা করবেন ধন্যাবাদ।",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
        />
      </svg>
    ),
    color: "blue",
  },
  staff_departed: {
    title: "সার্ভিস টিম লোকেশনের উদ্দেশ্যে রওনা হয়েছে।",
    description:
      "প্রিয় গ্রাহক, আমাদের অফিসিয়াল সার্ভিস টিম আপনার দেওয়া ঠিকানার উদ্দেশ্যে রওনা হয়েছে। অতি শ্রীগ্রই আমাদের সার্ভিস টিম আপনার গন্তব্যে যথা সময়ে পৌঁছাবে আশা করছি।",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
        />
      </svg>
    ),
    color: "yellow",
  },
  staff_arrived: {
    title: "সার্ভিস টিম লোকেশনের ঠিকানায় পৌঁছেছে।",
    description:
      "আমাদের অফিসিয়াল সার্ভিস টিম আপনার দেওয়া ঠিকানারয় পৌঁছেছে অতি শ্রীগ্রই সার্ভিস টিম আপনার পন্যটির সমস্যা সমাধানের জন্য পরিক্ষা নীরিক্ষার কাজ শুরু করবে আশা করছি।",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
        />
      </svg>
    ),
    color: "blue",
  },
  completed: {
    title: "আপনার পন্যটি সমস্যার সমাধান করা হয়েছে।",
    description:
      "প্রিয় গ্রাহক আপনার পন্যটি আমাদের সার্ভিস টিম দক্ষতার সাথে পন্যটির সকল সমস্যার সমাধান করা হয়েছে এখন সম্পূর্ন ঠিক আছে। আশা করি এস ই ইলেকট্রনিক্স পরিবার আপনাকে সন্তষ্ট করতে পেরেছি।",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m4.5 12.75 6 6 9-13.5"
        />
      </svg>
    ),
    color: "green",
  },
  canceled: {
    title: "সার্ভিসিং বাতিল করা হয়েছে।",
    description:
      "প্রিয় গ্রাহক, আপনার আবেদন কৃত পন্যটির আমাদের সার্ভিস টিম কোন সমস্যা না পাওয়ার কারণে আপনার সার্ভিসিংটি বাতিল করা হলো।",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>
    ),
    color: "red",
  },
};

const electricianStatuses = {
  pending: {
    title: "আপনার হোম ইনস্টল অনুরোধটি গ্রহন করা হয়েছে।",
    description: `প্রিয় গ্রাহক {customer_name}, আপনার IPS হোম ইনস্টল অনুরোধটি গ্রহন করা হয়েছে।
ইনস্টল আই ডি: {serviceId} হোম ইনস্টল এর জন্য অতি শ্রীগ্রই অফিসিয়াল ইলেকট্রিশিয়ান টিমকে নিযুক্ত করা হবে। সময় দিয়ে আমাদের সহযোগিতা করবেন ধন্যাবাদ।`,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
    color: "blue",
  },
  in_progress: {
    title: "হাউস ওয়ারিং ইন্সটল টিমকে নিযুক্ত করা হয়েছে।",
    description:
      "প্রিয় গ্রাহক, আপনার আবেদনের প্রেক্ষিতে আপনার পন্যটি হোম ইনস্টল করা জন্য আমাদের অফিসিয়াল হাউস ওয়ারিং ইনস্টল টিমকে নিয়োগ দেওয়া হয়েছে। অতি শ্রীগ্রই তারা আপনার সাথে যোগাযোগ করবে।",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>
    ),
    color: "blue",
  },
  appointment_retry: {
    title: "নিযুক্ত হোম ইনস্টল টিম অনুরোধটি  কেন্সেল করেছে।",
    description: `দুঃখীত। আপনার পন্যটি হাউস ওয়ারিং ইনস্টল করার জন্য যে ইনস্টল টিম নিয়োগ করা হয়েছিল,
অনাকাঙ্ক্ষিত সমস্যার কারনে হাউস ওয়ারিং ইনস্টল টিমটি অনুরোধটি কেন্সেল করেছে। আমরা পুনরায় আপনার জন্য নতুন সার্ভিস টিম নিয়োগ দিচ্ছি আশা করি অতি দ্রুত হাউস ওয়ারিং ইনস্টল টিম নিযুক্ত করা হবে।`,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
        />
      </svg>
    ),
    color: "yellow",
  },
  staff_departed: {
    title: "হাউস ওয়ারিং ইলেকট্রিশিয়ান টিম লোকেশনের উদ্দেশ্যে রওনা হয়েছে।",
    description:
      "প্রিয় গ্রাহক, আমাদের অফিসিয়াল হাউস ওয়ারিং ইনস্টল টিম আপনার দেওয়া ঠিকানার উদ্দেশ্যে রওনা হয়েছে। অতি শ্রীগ্রই আমাদের হোম ইনস্টল টিম আপনার গন্তব্যে যথা সময়ে পৌঁছাবে আশা করছি।",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.11-.504 1.11-1.125v-3.75m-17.25 0h16.5m0 0V7.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v3.75m17.25 0v3.375c0 .621-.504 1.125-1.125 1.125h-16.5a1.125 1.125 0 0 1-1.125-1.125v-3.375"
        />
      </svg>
    ),
    color: "blue",
  },
  staff_arrived: {
    title: "হাউস ওয়ারিং ইলেকট্রিশিয়ান টিম লোকেশনের ঠিকানায় পৌঁছেছে।",
    description:
      "আমাদের অফিসিয়াল হাউস ওয়ারিং ইনস্টল টিম আপনার দেওয়া ঠিকানারয় পৌঁছেছে অতি শ্রীগ্রই IPS হোম ইনস্টল টিম আপনার হাউস ওয়ারিং ইনস্টলেশনের কাজ শুরু করবে আশা করছি।",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
        />
      </svg>
    ),
    color: "blue",
  },
  completed: {
    title: "আপনার IPS প্যাকেজ টি প্রদত্ত ঠিকানায় ইন্সটলের কাজ শেষ করা হয়েছে।",
    description:
      "প্রিয় গ্রাহক আপনার IPS প্যাকেজ টি আমাদের অফিসিয়াল হাউস ওয়ারিং ইনস্টল টিম দক্ষতার সঙ্গে আপনার প্রদত্ত ঠিকানায় হাউস ওয়ারিং IPS ইন্সটল করেছেন। সম্পূর্ন ভাবে সব কিছু ঠিক আছে। আশা করি এস ই ইলেকট্রনিক্স পরিবার আপনাকে সন্তষ্ট করতে পেরেছি।",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m4.5 12.75 6 6 9-13.5"
        />
      </svg>
    ),
    color: "green",
  },
  canceled: {
    title: "আপনার IPS প্যাকেজ ইন্সটলটি কেন্সেল করা হয়েছে।",
    description:
      "প্রিয় গ্রাহক, আপনার IPS প্যাকেজ হোম ইন্সটল কায্যক্রমটি কেন্সেল করা হয়েছে, কি কারনে ইন্সটল কেন্সেল করা হয়েছে আশা করি আপনি অবগত আছেন।",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>
    ),
    color: "red",
  },
};

export default async function ServiceTrackPage({
  searchParams,
}: {
  searchParams: Promise<{ trackingId: string }>;
}) {
  const params = await searchParams;
  if (!params.trackingId) {
    notFound();
  }

  const response = await getServiceById(params.trackingId);

  if (!response.success || !response.data) {
    throw new AppError("ট্র্যাকিং আইডিটি সঠিক নয় অথবা খুঁজে পাওয়া যায়নি।");
  }
  const serviceData = response.data;
  const statusHistory = serviceData.statusHistory;
  const currentStatus = statusHistory[statusHistory.length - 1].status;
  const appointedStaffPhotoUrl =
    serviceData.appointedStaff &&
    "photoUrl" in serviceData.appointedStaff &&
    serviceData.appointedStaff.photoUrl
      ? serviceData.appointedStaff.photoUrl
      : "";

  const session = await verifySession(false);
  const profileHref =
    session?.role === "customer"
      ? "/customer/profile"
      : session?.role === "staff"
        ? "/staff/profile"
        : null;
  return (
    <div className="bg-black h-screen overflow-y-auto">
      <ServiceTrackingPageThemeColor />
      <div className="mx-auto max-w-[600px] text-center pb-4">
        <div className="flex justify-end px-4 pt-4">
          {profileHref ? (
            <Link
              href={profileHref}
              className="text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 px-3 py-2 rounded-lg transition-colors"
            >
              Back to Profile
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/customer/login"
                className="text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 px-3 py-2 rounded-lg transition-colors"
              >
                Customer Login
              </Link>
              <Link
                href="/login"
                className="text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 px-3 py-2 rounded-lg transition-colors"
              >
                Admin/Staff Login
              </Link>
            </div>
          )}
        </div>
        {/* Header */}
        <div className="mb-3 bg-slate-900 text-white p-4 sm:rounded-lg">
          <div className="flex items-start justify-between gap-4 mb-4">
            {/* Left Column - Service Info */}
            <div className="flex-1 min-w-0">
              <div
                className={clsx(
                  "text-md font-bold mb-3",
                  serviceData?.type === "install" && "text-yellow-500",
                )}
              >
                এস ই ইলেকট্রনিকস গ্রাহক সেবা সার্ভিসিং তথ্য ট্রেকিং
              </div>
              <div className="space-y-1 text-sm text-start mx-2">
                <div className="flex">
                  <span className="w-28 flex-shrink-0">ট্রেকিং নম্বর</span>
                  <span className="mr-2 flex-shrink-0">:</span>
                  <span className="font-bold truncate">
                    {serviceData.serviceId}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 flex-shrink-0">হেল্প নাম্বার</span>
                  <span className="mr-2 flex-shrink-0">:</span>
                  <span className="font-bold truncate">
                    {contactDetails.customerCare}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 flex-shrink-0">হেড অফিস</span>
                  <span className="mr-2 flex-shrink-0">:</span>
                  <span className="font-bold truncate">
                    {contactDetails.headOffice}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Info Section */}
          {((serviceData?.staffName && serviceData?.staffPhone) ||
            serviceData?.appointedStaff) && (
            <div className="border-t border-slate-700 pt-3 mx-2">
              <div
                className={clsx(
                  "font-bold text-md mb-4",
                  serviceData?.type === "install" && "text-yellow-500",
                )}
              >
                এস ই ইলেকট্রনিকস নিযুক্ত{" "}
                {serviceData.type === "install"
                  ? "ইলেকট্রিসিয়ান"
                  : "টেকনিশিয়ান"}{" "}
                তথ্য
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm space-y-1 text-start flex-1 min-w-0">
                  <div className="flex items-start">
                    <span className="w-20 flex-shrink-0">নাম</span>
                    <span className="mr-2 flex-shrink-0">:</span>
                    <span className="font-bold truncate block">
                      {serviceData.appointedStaff?.name ||
                        serviceData.staffName}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-20 flex-shrink-0">ফোন</span>
                    <span className="mr-2 flex-shrink-0">:</span>
                    <span className="font-bold truncate block">
                      {serviceData.appointedStaff?.phone ||
                        serviceData.staffPhone}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-20 flex-shrink-0">সার্ভিস এরিয়া</span>
                    <span className="mr-2 flex-shrink-0">:</span>
                    <span className="font-bold truncate block">
                      {serviceData.customerAddress}
                    </span>
                  </div>
                </div>
                {serviceData.appointedStaff && (
                  <div className="flex-shrink-0 __center flex flex-col">
                    <div className="size-16 rounded-full overflow-hidden border-2 border-slate-600">
                      <ImageWithLightbox
                        src={appointedStaffPhotoUrl}
                        alt="Staff Photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Link
                      target="_blank"
                      href={`/team-members?staffId=${serviceData.appointedStaff.staffId}`}
                      className="mt-2 text-blue-500 hover:underline"
                    >
                      View Profile
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Event History */}
        <div className="flex flex-col gap-6 bg-slate-900 text-white p-4 sm:rounded-lg">
          <ul className="flex flex-col">
            {statusHistory.map(
              ({
                id,
                statusType,
                status,
                customLabel,
                customNote,
                cancelReason,
                createdAt,
              }) => {
                const statusData =
                  serviceData.type === "install"
                    ? electricianStatuses[
                        status as keyof typeof electricianStatuses
                      ]
                    : technicianStatuses[
                        status as keyof typeof technicianStatuses
                      ];

                const isLastOne =
                  id === statusHistory[statusHistory.length - 1].id;
                const isFirstOne = id === statusHistory[0].id;
                const isCompleted = status === "completed";
                const isCanceled = status === "canceled";
                const isCustomStatus = statusType === "custom";

                return (
                  <li key={id} className="relative flex gap-4">
                    {(!isLastOne ||
                      isFirstOne ||
                      (!isCanceled && !isCompleted)) && (
                      <div className="absolute w-7 h-full">
                        <div className=" bg-blue-500 w-0.5 m-auto h-full"></div>
                      </div>
                    )}
                    <div
                      className={clsx(
                        `size-7 min-w-7 rounded-full __center text-white relative`,
                        isCustomStatus
                          ? "bg-blue-500"
                          : `bg-${statusData?.color}-500`,
                      )}
                    >
                      {isCustomStatus ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                          />
                        </svg>
                      ) : (
                        statusData?.icon
                      )}
                    </div>
                    <div className="flex flex-col text-start gap-1 pb-5">
                      <span
                        className={clsx(
                          "font-bold",
                          serviceData?.type === "install"
                            ? "text-yellow-500"
                            : isCustomStatus
                              ? "text-blue-500"
                              : `text-${statusData?.color}-500`,
                        )}
                      >
                        {isCustomStatus ? customLabel : statusData?.title}
                      </span>
                      <p className="text-sm">
                        {isCustomStatus
                          ? customNote
                          : isCanceled && cancelReason
                            ? cancelReason
                            : renderText(statusData?.description, {
                                serviceId: serviceData?.serviceId,
                                customer_name: serviceData?.customerName,
                              })}
                      </p>
                      <Timestamp timestamp={createdAt} />
                    </div>
                  </li>
                );
              },
            )}

            {currentStatus !== "completed" && currentStatus !== "canceled" && (
              <li className="flex gap-4 opacity-60">
                <div className="size-7 min-w-7 rounded-full bg-gray-500 __center text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                </div>

                {serviceData.type === "install" ? (
                  <div className="flex flex-col text-start gap-1 pb-8">
                    <span className="text-white font-bold">
                      আপনার IPS প্যাকেজ টি প্রদত্ত ঠিকানায় ইন্সটলের কাজ শেষ করা
                      হয়েছে।
                    </span>
                    <p className="text-sm text-gray-300">
                      প্রিয় গ্রাহক, আপনার IPS প্যাকেজ টি আমাদের ইন্সটল টিম
                      দক্ষতার সঙ্গে আপনার প্রদত্ত ঠিকানায় হাউস ওয়ারিং IPS
                      ইন্সটল করেছেন। আশা করি আমরা আপনাকে সন্তুষ্ট করতে পেরেছি।
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col text-start gap-1 pb-8">
                    <span className="text-white font-bold">
                      আপনার পণ্যের সমস্যা সমাধান করা হয়েছে।
                    </span>
                    <p className="text-sm text-gray-300">
                      প্রিয় গ্রাহক, আপনার পন্যটি আমাদের সার্ভিস টিম দক্ষতার
                      সঙ্গে সমস্যাগুলা সমাধান করেছেন। আশা করি আমরা আপনাকে
                      সন্তুষ্ট করতে পেরেছি।
                    </p>
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
