import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export const WHATSAPP_LINK =
  "https://api.whatsapp.com/send?phone=5579991767938&text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20de%20projeto";

export const INSTAGRAM_LINK = "https://instagram.com/arquiteta.mariana";

export const CONTACT = {
  phone: "+55 (79) 99176-7938",
  phoneRaw: "5579991767938",
  address: "Av. Francisco Porto, 151, Sala 3, Grageru, Aracaju/SE",
  city: "Aracaju, SE",
  email: "contato@marianaarquiteta.com.br",
};
