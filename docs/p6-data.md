# Where this data would really come from (Primavera P6)

This app's `src/data/*.json` files are static stand-ins for what would normally
be live queries against a P6 database. These notes describe the real shape of
that data, how you'd query it, and how the app would need to change to consume
it for real. Table/column names below are from Primavera P6's standard schema
(P6 Professional and P6 EPPM share the same core tables) — exact availability
depends on your P6 version and whatever reporting access your PMO grants.

## 1. The relevant P6 tables

P6 stores schedule data across many normalized tables. The ones this app's
data model touches:

| Table | What it holds | Maps to |
|---|---|---|
| `PROJECT` | One row per project: project ID, planned/must-finish dates | Programme-level dates (`contract.json`'s milestones, in a real system, would be cross-checked against this) |
| `PROJWBS` | The WBS hierarchy (`WBS_ID`, `WBS_NAME`, `PARENT_WBS_ID`) | `wbsPath` / `sectionSummary` |
| `TASK` | One row per activity: `TASK_ID`, `TASK_CODE` (the human-readable activity ID like `A1120`), `TASK_NAME`, `TARGET_START_DATE`, `TARGET_END_DATE`, `ACT_START_DATE`, `ACT_END_DATE`, `PHYS_COMPLETE_PCT`, `STATUS_CODE`, `TOTAL_FLOAT_HR_CNT`, `FREE_FLOAT_HR_CNT` | `p6ActivityId`, `plannedStart/Finish`, `actualStart/Finish`, `percentComplete`, `status`, `freeFloat` |
| `TASKPRED` | Activity relationships: `TASK_ID`, `PRED_TASK_ID`, `PRED_TYPE` (`PR_FS`/`PR_SS`/`PR_FF`/`PR_SF`), `LAG_HR_CNT` | `predecessors` / `successors` |
| `TASKRSRC` | Resource assignments per activity: `TASK_ID`, `RSRC_ID`, `TARGET_QTY`, `ACT_REG_QTY` | `resourcesOnSite` |
| `RSRC` | Resource master data: `RSRC_ID`, `RSRC_NAME`, `RSRC_TYPE` | Resource names |
| `TASKNOTE` / `MEMOTYPE` | Free-text activity notes | `comments` |
| `UDFTYPE` | Definitions of custom fields your planners added: `UDF_TYPE_ID`, `TABLE_NAME`, `UDF_TYPE_LABEL` (e.g. `"Start Latitude"`) | — |
| `UDFVALUE` | The actual custom-field values: `UDF_TYPE_ID`, `FK_ID` (the `TASK_ID`), plus one of `UDF_TEXT` / `UDF_NUMBER` / `UDF_DATE` depending on the field's type | `startCoord` / `endCoord` |

**The coordinate columns are User Defined Fields (UDFs), not native P6
fields.** P6 has no concept of geometry — a planner adds four numeric UDFs at
the activity level (e.g. "Start Lat", "Start Lon", "End Lat", "End Lon"), and
someone on site or in GIS populates them per activity. That's the "custom
columns" this app's mock data simulates.

`freeFloat` (`FREE_FLOAT_HR_CNT`) and `status` are both native scheduling
outputs P6 computes for you from the network of relationships — you don't
maintain them by hand, the scheduler (or P6's own engine) recalculates them
every time the programme is progressed and re-scheduled.

## 2. Querying it

In most organisations you won't get write access to the live P6 database —
you'll query a **read-only reporting replica** (P6 ships one, often called the
"BI/reporting database" or accessed via P6's REST API instead of raw SQL). The
query below is illustrative of the joins involved, assuming direct SQL access
to a reporting schema:

```sql
SELECT
    t.task_code                                        AS p6_activity_id,
    t.task_name,
    wbs.wbs_name                                        AS wbs_leaf_name,
    t.target_start_date                                 AS planned_start,
    t.target_end_date                                   AS planned_finish,
    t.act_start_date                                    AS actual_start,
    t.act_end_date                                      AS actual_finish,
    t.phys_complete_pct                                 AS percent_complete,
    t.free_float_hr_cnt / 8.0                           AS free_float_days,  -- P6 stores float in hours
    lat_start.udf_number                                AS start_lat,
    lon_start.udf_number                                AS start_lon,
    lat_end.udf_number                                  AS end_lat,
    lon_end.udf_number                                  AS end_lon,
    (
        SELECT STRING_AGG(pred.task_code, ',')          -- LISTAGG on Oracle
        FROM taskpred tp
        JOIN task pred ON pred.task_id = tp.pred_task_id
        WHERE tp.task_id = t.task_id
    )                                                    AS predecessor_ids,
    (
        SELECT STRING_AGG(succ.task_code, ',')
        FROM taskpred tp
        JOIN task succ ON succ.task_id = tp.task_id
        WHERE tp.pred_task_id = t.task_id
    )                                                    AS successor_ids
FROM task t
JOIN projwbs wbs           ON wbs.wbs_id = t.wbs_id
JOIN udfvalue lat_start     ON lat_start.fk_id = t.task_id
                            AND lat_start.udf_type_id = (SELECT udf_type_id FROM udftype WHERE udf_type_label = 'Start Latitude')
JOIN udfvalue lon_start     ON lon_start.fk_id = t.task_id
                            AND lon_start.udf_type_id = (SELECT udf_type_id FROM udftype WHERE udf_type_label = 'Start Longitude')
JOIN udfvalue lat_end       ON lat_end.fk_id = t.task_id
                            AND lat_end.udf_type_id = (SELECT udf_type_id FROM udftype WHERE udf_type_label = 'End Latitude')
JOIN udfvalue lon_end       ON lon_end.fk_id = t.task_id
                            AND lon_end.udf_type_id = (SELECT udf_type_id FROM udftype WHERE udf_type_label = 'End Longitude')
WHERE t.proj_id = :project_id
  AND wbs.wbs_name LIKE 'Section %'   -- only leaf activities representing a single route section
ORDER BY t.task_code;
```

Notes on this query:
- `STRING_AGG`/`LISTAGG` collapses the many-to-many `TASKPRED` relationship
  into a comma-separated list per activity, matching the `predecessors`/
  `successors` arrays this app's `Section` type uses. You'd split that string
  in application code (or use `JSON_AGG` on Postgres/SQL Server for a real
  array).
- Resources (`resourcesOnSite`) and free-text comments (`blockers`, general
  narrative) would need their own queries against `TASKRSRC`/`RSRC` and
  `TASKNOTE` respectively — they're one-to-many per activity, so they're
  naturally separate result sets rather than columns on this main query.
- P6's own `status` isn't a single friendly enum like the one this app uses
  (`not started` / `preparing` / ... / `completed`) — P6 tracks `STATUS_CODE`
  (`TK_NotStart`, `TK_Active`, `TK_Complete`) plus percent complete. The
  richer 5-value status in this app is a **derived** field your reporting
  layer would compute from P6's raw status + percent complete + maybe a
  custom UDF for finer-grained phase tracking (P6's 3 native states don't
  distinguish "preparing" from "main works ongoing", for instance).

## 3. How the app would consume it for real

Right now every page does something like:

```ts
import sectionsData from '../data/sections.json';
const sections = sectionsData as Section[];
```

To go from mock data to live P6 data, that import would be replaced by a
fetch to a backend endpoint your team controls — the frontend should never
query the P6 database directly:

```
Browser (React app)  →  Your backend API  →  P6 reporting DB / P6 REST API
```

A minimal backend would expose:
- `GET /api/sections` — runs the query above (or calls P6's REST API's
  `activity` resource with UDF fields included) and reshapes the result into
  this app's `Section[]` shape.
- `GET /api/sections/:sectionId/activities` — the equivalent query scoped to
  child activities under a section's WBS node, for the Gantt page.
- `GET /api/contract` — this one likely wouldn't come from P6 at all; contract
  terms usually live in a separate contracts/commercial system, not the
  scheduling tool.

Practical points for that integration:
- **Poll or scheduled sync, not live queries per request.** P6 programmes are
  usually only re-scheduled and progressed periodically (daily/weekly), so
  the backend should cache results (or sync into its own app database) rather
  than hitting the P6 reporting DB on every page load.
- **Read-only.** Nothing in this app should ever write back to P6 — updates to
  progress, dates, or resources happen through the scheduling tool by the
  planner, and flow downstream into this app, never the other way.
- **UDFs are per-deployment.** The UDF field labels/types used above (`"Start
  Latitude"`, etc.) are whatever your organisation's planners actually named
  them — check `UDFTYPE` in your instance rather than assuming these exact
  labels.
- **The Groq assistant's context (`src/lib/projectContext.ts`)** would need
  its summarization logic re-pointed at the same backend endpoints, but the
  approach (summarize the programme instead of dumping every row) stays the
  same regardless of where the data originates.
