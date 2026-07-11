import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Added: robust date parsing and formatting helpers
export function parseDateTime(input?: string | null): Date | null {
  if (!input) return null

  // Trim
  const s = input.trim()

  // Try native parse
  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) return d

  // Try ISO-ish without timezone (replace space with T)
  const isoAttempt = s.replace(' ', 'T')
  const d2 = new Date(isoAttempt)
  if (!Number.isNaN(d2.getTime())) return d2

  // Try common German format: dd.MM.yyyy[THH:mm(:ss)]
  const dm = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (dm) {
    const day = parseInt(dm[1], 10)
    const month = parseInt(dm[2], 10) - 1
    const year = parseInt(dm[3], 10)
    const hour = dm[4] ? parseInt(dm[4], 10) : 0
    const minute = dm[5] ? parseInt(dm[5], 10) : 0
    const second = dm[6] ? parseInt(dm[6], 10) : 0
    const dt = new Date(year, month, day, hour, minute, second)
    if (!Number.isNaN(dt.getTime())) return dt
  }

  // Try US format mm/dd/yyyy
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (us) {
    const month = parseInt(us[1], 10) - 1
    const day = parseInt(us[2], 10)
    const year = parseInt(us[3], 10)
    const hour = us[4] ? parseInt(us[4], 10) : 0
    const minute = us[5] ? parseInt(us[5], 10) : 0
    const second = us[6] ? parseInt(us[6], 10) : 0
    const dt = new Date(year, month, day, hour, minute, second)
    if (!Number.isNaN(dt.getTime())) return dt
  }

  // If nothing worked, return null
  return null
}

export function formatDateShort(date: Date | null): string {
  if (!date) return ''
  return date.toLocaleDateString('de-CH', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

export function formatDateLong(date: Date | null): string {
  if (!date) return ''
  return date.toLocaleDateString('de-CH', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function formatDateTimeLong(date: Date | null): string {
  if (!date) return ''
  return date.toLocaleDateString('de-CH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function formatTimeHM(date: Date | null): string {
  if (!date) return ''
  return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
}

export function isCurrentBroadcast(start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false
  const now = new Date()
  return now >= start && now <= end
}

export function getTimeUntilBroadcast(start: Date | null): number {
  if (!start) return -1
  const now = new Date()
  return Math.max(0, start.getTime() - now.getTime())
}

export function getSendayWithDate(date: Date | null): string {
  if (!date) return ''
  return date.toLocaleDateString('de-CH', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function getWeekday(date: Date | null): string {
  if (!date) return ''
  return date.toLocaleDateString('de-CH', { weekday: 'long' })
}
