"use client";

import { DashboardShell } from "@/layouts/dashboard-shell";
import { RequireAuth } from "@/components/require-auth";
import { AdminPanel } from "@/components/admin/admin-panel";

export default function AdminPage() {
  return (
    <RequireAuth role="admin">
      <DashboardShell
        title="Panel Administrador"
        subtitle="Gestiona alumnos, programas, asignaciones y progreso."
      >
        <AdminPanel />
      </DashboardShell>
    </RequireAuth>
  );
}
