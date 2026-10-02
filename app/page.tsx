import ReportView, { type ReportData } from './ReportView'

// Deliberately separate from GAS_URL — the report backend is its own
// standalone Apps Script project/deployment (gas/Report.gs), independent
// from the main CE app's GAS project, so it can never be affected by (or
// affect) the live app.
const REPORT_GAS_URL = process.env.REPORT_GAS_URL || ''

// Fetched server-side (not client-side) so the page's initial HTML already
// contains the full report — avoids a "Loading report…" flash on every
// visit. Same 5-minute cache window as the old client fetch / GAS cache.
//
// Retries once on failure before giving up — a single transient hiccup
// (e.g. a cold GAS execution) at BUILD time would otherwise get permanently
// baked into the static page until the next deploy, since Next.js never
// caches (and therefore never retries on its own) a thrown/failed fetch.
async function getReportData(): Promise<ReportData> {
  if (!REPORT_GAS_URL) {
    return { error: 'no_gas_url' } as ReportData
  }
  const attempt = async () => {
    const res = await fetch(`${REPORT_GAS_URL}?action=getReport`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`GAS ${res.status}`)
    return await res.json()
  }
  try {
    return await attempt()
  } catch {
    try {
      return await attempt()
    } catch {
      return { error: 'request_failed' } as ReportData
    }
  }
}

export default async function Page() {
  const data = await getReportData()
  return <ReportView data={data} />
}
