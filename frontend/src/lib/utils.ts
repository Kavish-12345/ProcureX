import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractErrors(error: unknown, fallbackMessage = "Something went wrong. Please try again.") {
  if (error && typeof error === "object" && "response" in error) {
    const data = (error as any).response?.data;
    const fieldErrors: Record<string, string[]> = {};
    const properties = data?.errors?.properties;
    if (properties) {
      for (const key in properties) {
        if (properties[key]?.errors?.length) {
          fieldErrors[key] = properties[key].errors;
        }
      }
    }
    const generalMessage =
      Object.keys(fieldErrors).length > 0
        ? (data?.message ?? "Please fix the errors below")
        : (data?.message ?? fallbackMessage);
    return { fieldErrors, generalMessage };
  }
  return { fieldErrors: {}, generalMessage: fallbackMessage };
}
