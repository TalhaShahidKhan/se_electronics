"use client";

import { SideNavContext } from "@/components";
import { use, useEffect, useState } from "react";

export const useServerAction = <T>(serverAction: T): any => {
  const [isPending, setIsPending] = useState(false);
  const callServerAction = async () => {
    setIsPending(true);
    const res = await (serverAction as any)();
    return res;
  };
  return [callServerAction, isPending];
};

export const useSideNavContext = () => {
  const context = use(SideNavContext);
  if (context) {
    return context;
  } else {
    throw new Error("SideNav context is empty");
  }
};

export const useThemeColor = (color: string) => {
  useEffect(() => {
    if (!color) {
      throw new Error("Theme color is not provided");
    }
    let meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", color);
  }, []);
};
