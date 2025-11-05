"use client";

import * as React from "react";
import { Toaster } from "@/components/ui/sonner";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Toaster richColors />
    </>
  );
};

export default Providers;
