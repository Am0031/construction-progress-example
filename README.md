# National Grid Upgrade — Progress Map

A seven-page demo for a national grid upgrade construction project:

1. **Overview** (`/`) — a programme-level dashboard: KPI tiles (overall progress,
   critical-path section count, open blockers, stations energised, days to the
   contractual completion date), a planned-vs-actual progress S-curve, a
   sections-by-status breakdown, and a key milestones list.
2. **Progress Map** (`/map`) — a deck.gl map with three switchable views (via a
   left sidebar): Cable Network (route sections colored by construction
   status), Power Stations (substations/switching/converter stations as
   colored dots), and Planning Zones (local-authority polygons tracking
   wayleave/consent status). Clicking any section, station, or zone opens a
   detail panel (dates, resources on site, blockers, predecessors/successors,
   free float, P6 activity reference).
3. **Programme** (`/programme`) — a Gantt chart of the child activities that make
   up a selected 5km section, with a section list on the side mirroring the map.
4. **Resources** (`/resources`) — a resource-utilisation timeline showing which
   crews are deployed on which sections and when, with overlapping demand for
   the same crew flagged in red (a real scheduling conflict, not just a busy
   period).
5. **Risks** (`/risks`) — a risk register: a probability × impact matrix plus a
   sortable table, each risk opening a detail panel with mitigation, owner, and
   linked section/route/zone.
6. **Report** (`/report`) — a printable weekly progress report (KPIs, status
   breakdown, top risks, open blockers, resourcing flags, upcoming milestones)
   with a "Print / Save as PDF" button; the nav/footer chrome hides itself on
   print via a `no-print` class.
7. **Contract Assistant** (`/assistant`) — an AI chat assistant (via Groq's free
   API) that can answer questions about programme progress and contract terms
   (completion dates, penalties, maintenance obligations).

Built with React + TypeScript + Vite, deck.gl/MapLibre for the map, React Router
for navigation, and Tailwind for styling. The example route network is a stretch
of the M1 motorway (Milton Keynes to Leicester) plus a spur toward Coventry,
standing in for two connected circuits on a real corridor.

## Running the app

Requires Node.js (18+) and npm.

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal (typically http://localhost:5173).

Every page works immediately except the Contract Assistant, which needs a free
Groq API key — see below.

### Setting up the Contract Assistant (Groq)

1. Create a free API key at [console.groq.com/keys](https://console.groq.com/keys).
2. Copy `.env.example` to `.env` in the project root.
3. Set `VITE_GROQ_API_KEY=your-key` in `.env`.
4. Restart the dev server.

Note: this demo calls the Groq API directly from the browser, so the key ends up
in the client bundle. That's fine for local/demo use, but for a real deployment
you'd proxy this call through a backend so the key isn't exposed to end users.

## Other scripts

```bash
npm run build      # type-check and build for production into dist/
npm run preview    # serve the production build locally
npm run lint       # run Oxlint
```

## Regenerating the mock data

`src/data/sections.json` is generated from `scripts/generate-sections.mjs`, which
interpolates 5km chunks along two connected sets of route waypoints (Route
M1-A and a Rugby-Coventry spur that branches off it) and fabricates P6-style
fields for each section: activity ID, WBS path, dates, status, resources,
blockers, comments, predecessors/successors, and free float. To regenerate it
(e.g. after changing the waypoints, section size, or section count):

```bash
node scripts/generate-sections.mjs
```

Section status isn't a pure "earlier = further along" wave — a second noise
term and a small `statusOverrides`/`commentOverrides` mechanism in the
generator break up long completed/ongoing runs (real programmes don't
progress in lockstep), while pinning specific sections whose status is
referenced elsewhere (Gantt demo data, power station tie-ins) so regenerating
can't silently desync them.

`src/data/activities.json` is hand-authored example data simulating a separate
DB/API call (e.g. `GET /sections/:id/activities`) that would return the child
activities making up a section's P6 summary line. Only a handful of sections
have this detail in the demo (see the dimmed vs. highlighted rows in the
Programme page's section list) — everything else shows an empty state.

`src/data/contract.json` is hand-authored example contract terms (NEC4-style:
completion dates, liquidated damages, maintenance period, retention, etc.) used
as context for the Contract Assistant, the Overview dashboard, and the Report
page.

`src/data/powerStations.json` and `src/data/planningZones.json` are
hand-authored example data for the Progress Map's other two views.

`src/data/risks.json` is hand-authored example risk register data. A few risks
deliberately reference the same sections/blockers/resource conflicts shown
elsewhere in the app (e.g. RISK-06 on HV testing team overallocation matches
what the Resources page's overlap detection actually flags) so the pages read
as one coherent programme rather than unrelated demos.

See [`docs/p6-data.md`](docs/p6-data.md) for notes on what this data actually
looks like in a real Primavera P6 database, how you'd query it, and how the
app would need to change to consume it for real instead of static JSON.

## Project structure

- `src/data/sections.json` — mock data simulating a P6 export with custom
  per-section coordinate columns, across two connected routes
- `src/data/activities.json` — mock child-activity breakdowns for a few example
  sections, simulating a separate per-section DB query
- `src/data/powerStations.json` — mock substation/switching/converter station
  data for the Power Stations map view
- `src/data/planningZones.json` — mock local-authority polygon data (wayleave/
  consent status) for the Planning Zones map view
- `src/data/contract.json` — mock contract terms used by the AI assistant, the
  Overview dashboard, and the Report page
- `src/data/risks.json` — mock risk register data
- `src/pages/DashboardPage.tsx` — the Overview page
- `src/pages/MapPage.tsx` — the Progress Map page (holds the layer-switching state)
- `src/pages/GanttPage.tsx` — the Programme (Gantt) page
- `src/pages/ResourcesPage.tsx` — the resource-utilisation page
- `src/pages/RiskRegisterPage.tsx` — the risk register page
- `src/pages/ReportPage.tsx` — the printable weekly report page
- `src/pages/AssistantPage.tsx` — the Contract Assistant chat page
- `src/components/StatTile.tsx` / `StatusBreakdownChart.tsx` / `ProgressSCurve.tsx` — Overview dashboard building blocks (also reused on the Report page)
- `src/components/ProgressMap.tsx` / `PowerStationsMap.tsx` / `PlanningZonesMap.tsx` — the three deck.gl map views
- `src/components/SectionPanel.tsx` / `StationPanel.tsx` / `ZonePanel.tsx` / `RiskPanel.tsx` — detail panels opened on click, one per data type
- `src/components/LayerSidebar.tsx` — the map-view switcher on the Progress Map page
- `src/components/GanttChart.tsx` / `ResourceTimeline.tsx` — the two timeline-style charts, sharing scale logic from `src/lib/timelineScale.ts`
- `src/components/SectionList.tsx` — shared section list (used by the Programme page)
- `src/components/RiskMatrix.tsx` / `RiskTable.tsx` — the risk register's matrix and sortable table
- `src/components/Navbar.tsx` / `Footer.tsx` — app shell, routed via React Router (hidden on print via the `no-print` class)
- `src/lib/statusColors.ts` — section/station/zone status → color mapping (shared across all views)
- `src/lib/activityColors.ts` — activity schedule-status → color mapping (Gantt chart)
- `src/lib/riskColors.ts` — risk probability × impact → severity color/score
- `src/lib/viewport.ts` — shared deck.gl "fit to bounds" viewport helper
- `src/lib/timelineScale.ts` — shared date-domain/scale logic for Gantt and Resources charts
- `src/lib/dashboardMetrics.ts` — KPI and S-curve calculations (Overview + Report pages)
- `src/lib/resourceMetrics.ts` — crew assignment and overlap/conflict detection (Resources + Report pages)
- `src/lib/groqClient.ts` — thin wrapper around the Groq chat completions API
- `src/lib/projectContext.ts` — builds the system prompt fed to the assistant
- `src/types/section.ts` / `station.ts` / `zone.ts` / `activity.ts` / `risk.ts` — data shapes
