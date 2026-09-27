/**
 * File-backed investigation store.
 * Persists to .data/investigations.json on the server filesystem.
 * The interface is intentionally simple so PostgreSQL can be dropped in later.
 */
import fs from "fs";
import path from "path";
import { Investigation } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "investigations.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readAll(): Investigation[] {
  ensureDataDir();
  if (!fs.existsSync(STORE_FILE)) return [];
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf-8");
    return JSON.parse(raw) as Investigation[];
  } catch {
    return [];
  }
}

function writeAll(items: Investigation[]) {
  ensureDataDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export function createInvestigation(
  investigation: Investigation
): Investigation {
  const items = readAll();
  items.unshift(investigation); // newest first
  writeAll(items);
  return investigation;
}

export function getInvestigation(id: string): Investigation | null {
  const items = readAll();
  return items.find((i) => i.id === id) ?? null;
}

export function updateInvestigation(
  id: string,
  patch: Partial<Investigation>
): Investigation | null {
  const items = readAll();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch, updatedAt: new Date().toISOString() };
  writeAll(items);
  return items[idx];
}

export function listInvestigations(): Investigation[] {
  return readAll();
}

export function listInvestigationsByUser(githubUserId: number): Investigation[] {
  return readAll().filter((i) => i.githubUserId === githubUserId);
}

export function deleteInvestigation(id: string): boolean {
  const items = readAll();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  writeAll(filtered);
  return true;
}
