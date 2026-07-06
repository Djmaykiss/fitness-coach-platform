import type { UserRepository } from "@/repositories/types";
import type { Role, User } from "@/types";
import { getSupabaseClient } from "@/lib/supabase";
import { str, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabaseUserRepository (Bloque 12.5). Cierra el ultimo repo migrable.
 *
 * En modo `supabase` el LOGIN/REGISTRO reales van por `supabaseAuthService` (Supabase
 * Auth), NO por este repo. El unico metodo que se usa en `supabase` es `getUsers()`
 * (tabla Alumnos del admin + CRM) para resolver `userId -> email`; el email vive en
 * `auth.users`, asi que se lee via la RPC `list_org_users` (SECURITY DEFINER, staff-only,
 * scopeada a la org). `findByCredentials`/`create` no se alcanzan en `supabase`
 * (los cubre `supabaseAuthService`). Mismo contrato que `LocalUserRepository`.
 */

/** Rol de membership -> rol de app (owner/admin/coach -> admin; client -> client). */
function appRole(membershipRole: string): Role {
  return membershipRole === "client" ? "client" : "admin";
}

function rowToUser(row: Row): User {
  return {
    id: str(row, "id"),
    firstName: str(row, "first_name"),
    lastName: str(row, "last_name"),
    email: str(row, "email"),
    password: "", // nunca se expone en Supabase
    role: appRole(str(row, "role")),
  };
}

export class SupabaseUserRepository implements UserRepository {
  private sb() {
    return getSupabaseClient();
  }

  async getUsers(): Promise<User[]> {
    const { data, error } = await this.sb().rpc("list_org_users");
    if (error) throw new Error(error.message);
    return ((data ?? []) as Row[]).map(rowToUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const norm = email.trim().toLowerCase();
    const users = await this.getUsers();
    return users.find((u) => u.email.toLowerCase() === norm) ?? null;
  }

  /** El login real va por `supabaseAuthService` (Supabase Auth); no se valida aqui. */
  async findByCredentials(): Promise<User | null> {
    return null;
  }

  /** El registro real va por `supabaseAuthService` (signUp + RPC register_client). */
  async create(): Promise<User> {
    throw new Error("El registro se realiza vía Supabase Auth, no por userRepository.");
  }
}
