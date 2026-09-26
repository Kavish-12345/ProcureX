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

  // Errors thrown by our own mutation functions (rather than returned by the API)
  // carry their message directly — checked after the axios shape above, since
  // axios errors are Errors too.
  if (error instanceof Error && error.message) {
    return { fieldErrors: {}, generalMessage: error.message };
  }

  return { fieldErrors: {}, generalMessage: fallbackMessage };
}
