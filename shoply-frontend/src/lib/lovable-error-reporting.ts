// No-op stub — replaces lovable-error-reporting for non-Lovable builds
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function reportLovableError(_error: unknown, _context?: Record<string, unknown>): void {
  // not connected to Lovable — errors are logged via console.error in ErrorComponent
}
