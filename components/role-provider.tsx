"use client";

import { createContext, useContext, useMemo, useState } from "react";

import type { Role } from "@/types/domain";

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({
  children,
  initialRole = "employee"
}: {
  children: React.ReactNode;
  initialRole?: Role;
}) {
  const [role, setRole] = useState<Role>(initialRole);
  const value = useMemo(() => ({ role, setRole }), [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }

  return context;
}
