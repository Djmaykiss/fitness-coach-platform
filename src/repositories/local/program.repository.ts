import { programRows as seedProgramRows, programs } from "@/data/programs";
import { resolveMock } from "@/repositories/async";
import type { ProgramRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readCollection,
  writeCollection,
} from "@/lib/local-store";
import type { CreateProgramInput, ProgramRow } from "@/types";

/**
 * Programas. `getPrograms` (tarjetas de la landing) es estatico y seguro en el
 * servidor; `getProgramRows` (gestion del admin) se persiste en localStorage.
 */
export class LocalProgramRepository implements ProgramRepository {
  getPrograms() {
    return resolveMock(programs);
  }

  private readRows(): ProgramRow[] {
    return readCollection<ProgramRow>(STORAGE_KEYS.programs, seedProgramRows);
  }

  getProgramRows() {
    return resolveMock(this.readRows());
  }

  createProgramRow(input: CreateProgramInput) {
    const rows = this.readRows();
    const row: ProgramRow = {
      name: input.name.trim(),
      clients: "0",
      duration: input.duration.trim(),
      status: input.status,
    };
    rows.push(row);
    writeCollection(STORAGE_KEYS.programs, rows);
    return resolveMock(row);
  }
}
