import { clients as seedClients } from "@/data/clients";
import { resolveMock } from "@/repositories/async";
import type { ClientRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readCollection,
  writeCollection,
} from "@/lib/local-store";
import type { Client, CreateClientInput } from "@/types";

/** Clientes/alumnos persistidos (visibles y editables en el panel admin). */
export class LocalClientRepository implements ClientRepository {
  private read(): Client[] {
    return readCollection<Client>(STORAGE_KEYS.clients, seedClients);
  }

  private write(clients: Client[]): void {
    writeCollection(STORAGE_KEYS.clients, clients);
  }

  getClients() {
    return resolveMock(this.read());
  }

  findByUserId(userId: string) {
    const match = this.read().find((client) => client.userId === userId) ?? null;
    return resolveMock(match);
  }

  createClient(input: CreateClientInput) {
    const clients = this.read();
    const client: Client = {
      id: `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name: input.name.trim(),
      status: input.status,
      userId: input.userId,
      // Un alumno nuevo arranca sin acceso hasta que el coach lo renueva.
      accessStatus: "Vencido",
      accessExpiresAt: null,
      lastPaymentDate: null,
      paymentMethod: null,
    };
    clients.push(client);
    this.write(clients);
    return resolveMock(client);
  }

  updateClient(id: string, patch: Partial<Omit<Client, "id">>) {
    const clients = this.read();
    const index = clients.findIndex((client) => client.id === id);
    if (index === -1) return resolveMock<Client | null>(null);
    const updated: Client = { ...clients[index], ...patch };
    clients[index] = updated;
    this.write(clients);
    return resolveMock<Client | null>(updated);
  }
}
