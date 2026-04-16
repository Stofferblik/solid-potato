import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MOSCOW_LABELS: Record<string, string> = {
  must: "Must Have",
  should: "Should Have",
  could: "Could Have",
  wont: "Won't Have",
};

export const MOSCOW_COLORS: Record<string, string> = {
  must: "bg-red-100 text-red-800 border-red-200",
  should: "bg-orange-100 text-orange-800 border-orange-200",
  could: "bg-blue-100 text-blue-800 border-blue-200",
  wont: "bg-gray-100 text-gray-600 border-gray-200",
};

export const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  sprint: "In sprint",
  gereed: "Gereed",
  open: "Open",
  actief: "Actief",
  gepland: "Gepland",
  bezig: "Bezig",
  voltooid: "Voltooid",
  todo: "Te doen",
  klaar: "Klaar",
};

export const CATEGORIE_LABELS: Record<string, string> = {
  sponsor: "Sponsor",
  gebruiker: "Gebruiker",
  expert: "Expert",
  management: "Management",
};

export function formatDatum(datum: Date | string): string {
  return new Date(datum).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function kwartaalNaam(kwartaal: number, jaar: number): string {
  return `Q${kwartaal} ${jaar}`;
}
