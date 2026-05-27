"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export function ToastController() {
  useEffect(() => {
    const originalSuccess = toast.success;
    toast.success = () => "";

    return () => {
      toast.success = originalSuccess;
    };
  }, []);

  return null;
}
