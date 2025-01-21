import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleProgramError(error: unknown): string {
  if (error instanceof Error) return error.message
  return "An unexpected error occurred"
}
