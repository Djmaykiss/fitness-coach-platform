"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminPage() {
  // Seccion activa elevada al shell (sidebar desktop) + tabs compactas del panel (movil).
  // SOLO estado de navegacion; la logica/datos siguen en AdminPanel.
  const [section, setSection] = useState("inicio");
  return (
    <RequireAuth role="admin">
      <AdminShell active={section} onChange={setSection}>
        <AdminPanel activeTab={section} onTabChange={setSection} />
      </AdminShell>
    </RequireAuth>
  );
}
