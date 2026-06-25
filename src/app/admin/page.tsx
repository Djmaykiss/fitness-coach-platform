"use client";

import { DashboardShell } from "@/layouts/dashboard-shell";
import { RequireAuth } from "@/components/require-auth";
import { AdminPanel } from "@/components/admin/admin-panel";
import { useAuth } from "@/context/auth-context";

export default function AdminPage() {
  const { user } = useAuth();
  return (
    <RequireAuth role="admin">
      <DashboardShell
        title={`Bienvenido, ${user?.firstName ?? ""}`}
        subtitle="Gestiona alumnos, programas, asignaciones y progreso."
      >
        <AdminPanel />
      </DashboardShell>
    </RequireAuth>
  );
}
