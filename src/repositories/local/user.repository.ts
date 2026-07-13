import { users as seedUsers } from "@/data/users";
import { resolveMock } from "@/repositories/async";
import type { UserRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readSeededCollection,
  writeCollection,
} from "@/lib/local-store";
import type { Credentials, RegisterInput, User } from "@/types";

/** Usuarios persistidos en localStorage (sembrados con los usuarios demo). */
export class LocalUserRepository implements UserRepository {
  private read(): User[] {
    return readSeededCollection<User>(STORAGE_KEYS.users, seedUsers);
  }

  private write(users: User[]): void {
    writeCollection(STORAGE_KEYS.users, users);
  }

  getUsers() {
    return resolveMock(this.read());
  }

  findByCredentials({ email, password }: Credentials) {
    const normalized = email.trim().toLowerCase();
    const match =
      this.read().find(
        (user) =>
          user.email.toLowerCase() === normalized && user.password === password,
      ) ?? null;
    return resolveMock(match);
  }

  findByEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    const match =
      this.read().find((user) => user.email.toLowerCase() === normalized) ??
      null;
    return resolveMock(match);
  }

  create(input: RegisterInput) {
    const users = this.read();
    const user: User = {
      id: `user-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.trim().toLowerCase(),
      password: input.password,
      // Cada registro nuevo entra como cliente en esta etapa.
      role: "client",
    };
    users.push(user);
    this.write(users);
    return resolveMock(user);
  }
}
