import type { Role } from "@/types/domain";

const roleOrder: Record<Role, number> = {
  employee: 0,
  manager: 1,
  editor: 2,
  admin: 3
};

export function canAccess(viewerRole: Role, contentRole: Role) {
  return roleOrder[viewerRole] >= roleOrder[contentRole];
}

export function canManageContent(role: Role) {
  return role === "editor" || role === "admin";
}

export function canViewAuditLog(role: Role) {
  return role === "admin";
}

export function canApproveContent(role: Role) {
  return role === "admin";
}

export function getRoleLabel(role: Role) {
  return (
    {
      employee: "一般社員",
      manager: "管理職",
      editor: "編集担当",
      admin: "管理者"
    } satisfies Record<Role, string>
  )[role];
}
