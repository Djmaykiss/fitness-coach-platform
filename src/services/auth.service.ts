import {
  clientRepository,
  pendingEvaluationRepository,
  userRepository,
} from "@/repositories";
import type { AuthUser, Credentials, RegisterInput } from "@/types";

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

/** Quita las credenciales antes de exponer el usuario a la UI. */
function toAuthUser(user: { password: string } & AuthUser): AuthUser {
  const { password: _password, ...safe } = user;
  void _password;
  return safe;
}

/**
 * Autenticacion simulada (mock). No usa JWT ni sesiones reales: solo valida
 * contra los usuarios mock. Al migrar a Supabase, esta misma interfaz se
 * implementa con `supabase.auth.signInWithPassword`, etc.
 */
export const authService = {
  async login({ email, password }: Credentials): Promise<AuthResult> {
    const user = await userRepository.findByCredentials({ email, password });
    if (!user) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }
    return { ok: true, user: toAuthUser(user) };
  },

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      return { ok: false, error: "Ya existe una cuenta con este correo." };
    }
    const user = await userRepository.create(input);

    // Si el usuario completo el onboarding antes de registrarse, su evaluacion
    // quedo pendiente: se guarda en el perfil del alumno y se limpia.
    const pending = await pendingEvaluationRepository.get();

    // El alumno recien registrado aparece de inmediato en el panel admin y
    // queda enlazado a su usuario para que vea su propio progreso.
    await clientRepository.createClient({
      name: `${user.firstName} ${user.lastName}`.trim(),
      status: "Nuevo",
      userId: user.id,
      evaluation: pending?.evaluation,
    });

    if (pending) {
      await pendingEvaluationRepository.clear();
    }

    return { ok: true, user: toAuthUser(user) };
  },
};
