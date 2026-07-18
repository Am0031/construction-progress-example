// Generator for mock P6-style section data across a small network of two
// connected routes (simulating a grid upgrade programme with more than one
// circuit converging at a shared node), including P6 scheduling fields
// (predecessors/successors, free float) alongside the custom coordinate
// columns a planner would add to export section geometry.
import { writeFileSync } from 'node:fs';

const R = 6371; // km

function haversine([lon1, lat1], [lon2, lat2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function interpolate([lon1, lat1], [lon2, lat2], t) {
  return [lon1 + (lon2 - lon1) * t, lat1 + (lat2 - lat1) * t];
}

// Deterministic pseudo-random 0..1 from a seed, used for curvature noise.
function pseudoRandom(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Unit vector perpendicular to a-b, in lon/lat space but scaled so a given
// magnitude corresponds to roughly the same real-world distance regardless
// of direction (longitude degrees are shorter than latitude degrees this far
// from the equator, so we correct by cos(latitude) before normalizing).
function perpendicularUnit([lon1, lat1], [lon2, lat2]) {
  const latRad = (((lat1 + lat2) / 2) * Math.PI) / 180;
  const scaledDx = (lon2 - lon1) * Math.cos(latRad);
  const scaledDy = lat2 - lat1;
  const len = Math.hypot(scaledDx, scaledDy) || 1;
  return [(-scaledDy / len) / Math.cos(latRad), scaledDx / len];
}

// Real motorways aren't a sequence of dead-straight lines between junctions —
// they bend gently to follow terrain. This subdivides each waypoint-to-
// waypoint segment and nudges the intermediate points sideways with a smooth
// sine wiggle (zero at both original waypoints, so junctions/connection
// points stay exactly where they were), giving the interpolated route a
// believable curved shape instead of dead-straight chords.
function addCurvature(waypoints, { targetSpacingKm = 1.2, amplitudeDeg = 0.009, seed = 0 } = {}) {
  const curved = [waypoints[0]];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    const segDistKm = haversine(a, b);
    const subdivisions = Math.max(4, Math.round(segDistKm / targetSpacingKm));
    const [px, py] = perpendicularUnit(a, b);
    const segAmplitude = amplitudeDeg * (0.6 + pseudoRandom(seed + i * 7.3) * 0.8);
    const phase = pseudoRandom(seed + i * 3.1 + 1) * Math.PI * 2;
    const wiggleFreq = 1 + Math.floor(pseudoRandom(seed + i * 5.5 + 2) * 2); // 1 or 2 bends per segment

    for (let k = 1; k <= subdivisions; k++) {
      const t = k / subdivisions;
      const base = interpolate(a, b, t);
      const envelope = Math.sin(t * Math.PI); // 0 at both ends, peaks mid-segment
      const wiggle = Math.sin(t * Math.PI * wiggleFreq + phase);
      const offset = envelope * wiggle * segAmplitude;
      curved.push([base[0] + px * offset, base[1] + py * offset]);
    }
  }
  return curved;
}

function buildDistanceLookup(waypoints) {
  const segments = [];
  let cumulative = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    const dist = haversine(a, b);
    segments.push({ a, b, dist, cumStart: cumulative });
    cumulative += dist;
  }
  return { segments, totalDistance: cumulative };
}

function pointAtDistance(segments, d) {
  const seg = segments.find((s) => d >= s.cumStart && d <= s.cumStart + s.dist) ?? segments[segments.length - 1];
  const t = seg.dist === 0 ? 0 : (d - seg.cumStart) / seg.dist;
  return interpolate(seg.a, seg.b, Math.min(Math.max(t, 0), 1));
}

const STATUSES = [
  'not started',
  'preparing',
  'main works ongoing',
  'commissioning',
  'completed',
];

// General site crews exist in pairs (A/B) since there's more than one on the
// programme - occasional overlap is a minor scheduling note, not a crisis.
// HV testing team and Ecology watch are deliberately singular/scarce
// specialist resources, so when several sections need them at once it's a
// genuine flagged conflict (see the Resource Utilisation page and RISK-06 /
// RISK-03 in the risk register, which are written about exactly this).
const GENERAL_RESOURCE_POOL = [
  'Cable jointing crew A',
  'Cable jointing crew B',
  'Excavator team A',
  'Excavator team B',
  'Tower erection gang A',
  'Tower erection gang B',
  'Traffic management crew A',
  'Traffic management crew B',
];

const BLOCKER_POOL = [
  'Awaiting wayleave from landowner',
  'Utility diversion pending (water main)',
  'Environmental survey outstanding',
  'Access track condition unsuitable for cranes',
  'Awaiting outage window from DNO',
];

const COMMENT_POOL = {
  'not started': [
    'Section not yet mobilised. Awaiting resource release from predecessor activity.',
    'Design freeze issued; site establishment pending.',
  ],
  preparing: [
    'Site compound established, welfare units on site.',
    'Access track upgrade underway ahead of foundation works.',
  ],
  'main works ongoing': [
    'Foundation works complete, tower steelwork erection in progress.',
    'Cable pulling in progress between joint bays.',
    'Conductor stringing underway, weather delays on two days this week.',
  ],
  commissioning: [
    'Protection testing in progress, outage scheduled with DNO.',
    'Pre-energisation checks complete, awaiting switching schedule.',
  ],
  completed: [
    'Section energised and handed over to operations.',
    'Snagging closed out, as-built survey submitted.',
  ],
};

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function statusForIndex(i, total, bias = 0) {
  // Tell a believable "progress frontier" story: earlier chunks are
  // further along, later chunks haven't started — but real programmes
  // aren't a clean monotonic wave, so two noise terms of different
  // frequency/amplitude combine to break up long completed/ongoing runs
  // (resourcing gaps, weather delays, crews pulled onto other sections).
  const progressRatio = i / total;
  const noise = Math.sin(i * 1.7) * 0.11 + Math.sin(i * 0.6 + 1) * 0.09;
  const r = progressRatio + noise + bias;
  if (r < 0.28) return 'completed';
  if (r < 0.45) return 'commissioning';
  if (r < 0.68) return 'main works ongoing';
  if (r < 0.82) return 'preparing';
  return 'not started';
}

function dateAdd(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const PROJECT_START = '2025-09-01';

// 5km sections mean less granularity but more scope per section, so the
// schedule pacing scales too: bigger chunks take longer to build and more
// crews work each one at once, but the whole programme still needs to fit
// the same overall contract window (see docs/p6-data.md and contract.json).
const STEP_KM = 5;
const SECTION_SPACING_DAYS = 22; // gap between consecutive sections' planned starts
const SECTION_DURATION_DAYS = 70; // planned duration of a single 5km section

function buildRoute({
  routeId,
  routeName,
  sectionPrefix,
  waypoints,
  stepKm = STEP_KM,
  maxSections,
  activityIdBase,
  dayOffset = 0,
  statusBias = 0,
  externalPredecessorActivityId = null,
  // Explicit narrative overrides keyed by 0-based section index — for
  // specific "this section is out of step with its neighbours" stories
  // that shouldn't depend on the noise formula happening to land there.
  statusOverrides = {},
  commentOverrides = {},
}) {
  const { segments, totalDistance } = buildDistanceLookup(waypoints);
  const numSections = Math.min(maxSections, Math.floor(totalDistance / stepKm));

  const sections = [];
  for (let i = 0; i < numSections; i++) {
    const startKm = i * stepKm;
    const endKm = startKm + stepKm;
    const startCoord = pointAtDistance(segments, startKm).map((v) => Number(v.toFixed(5)));
    const endCoord = pointAtDistance(segments, endKm).map((v) => Number(v.toFixed(5)));
    const status = statusOverrides[i] ?? statusForIndex(i, numSections, statusBias);

    const plannedStart = dateAdd(PROJECT_START, dayOffset + i * SECTION_SPACING_DAYS);
    const plannedFinish = dateAdd(PROJECT_START, dayOffset + i * SECTION_SPACING_DAYS + SECTION_DURATION_DAYS);
    const isStarted = status !== 'not started';
    const isFinished = status === 'completed';
    const actualStart = isStarted ? dateAdd(plannedStart, (i % 5) - 2) : null;
    const actualFinish = isFinished ? dateAdd(plannedFinish, (i % 4) - 1) : null;

    const percentComplete = {
      'not started': 0,
      preparing: 15,
      'main works ongoing': 50,
      commissioning: 85,
      completed: 100,
    }[status];

    let resourcesOnSite = [];
    if (status === 'preparing') {
      resourcesOnSite = [pick(GENERAL_RESOURCE_POOL, i), 'Ecology watch'];
    } else if (status === 'main works ongoing') {
      resourcesOnSite = [pick(GENERAL_RESOURCE_POOL, i), pick(GENERAL_RESOURCE_POOL, i + 4)];
    } else if (status === 'commissioning') {
      resourcesOnSite = ['HV testing team'];
    }

    const blockers = status !== 'completed' && i % 6 === 0 ? [pick(BLOCKER_POOL, i)] : [];

    const comment = commentOverrides[i] ?? pick(COMMENT_POOL[status], i);

    // Free float: 0 on the assumed critical path, a small positive number
    // (in days) where an activity has schedule slack before it would delay
    // its successor — same meaning P6 reports for a normal FS network.
    const isCriticalPath = i % 5 === 2 || (status !== 'completed' && blockers.length > 0);
    const freeFloat = isCriticalPath ? 0 : Math.round(pseudoRandom(i + 1) * 8);

    const activityId = `A${activityIdBase + i * 10}`;
    const p6Predecessors = i === 0 ? [] : [`A${activityIdBase + (i - 1) * 10}`];
    const p6Successors = i === numSections - 1 ? [] : [`A${activityIdBase + (i + 1) * 10}`];

    if (i === 0 && externalPredecessorActivityId) {
      p6Predecessors.push(externalPredecessorActivityId);
    }

    sections.push({
      sectionId: `${sectionPrefix}-${String(i + 1).padStart(3, '0')}`,
      p6ActivityId: activityId,
      wbsPath: `Grid Upgrade > Route ${routeName} > Section ${i + 1}`,
      routeId,
      routeName,
      chainageStartKm: startKm,
      chainageEndKm: endKm,
      startCoord,
      endCoord,
      status,
      plannedStart,
      plannedFinish,
      actualStart,
      actualFinish,
      percentComplete,
      resourcesOnSite,
      blockers,
      comments: comment,
      predecessors: p6Predecessors,
      successors: p6Successors,
      freeFloat,
    });
  }

  return sections;
}

// Route A: real waypoints roughly tracing the M1 motorway from Milton
// Keynes (J14) to Leicester (J21).
const routeAWaypoints = [
  [-0.7594, 52.0783], // J14 Milton Keynes
  [-0.8126, 52.1466], // J15 Northampton
  [-0.9033, 52.2361], // J16
  [-1.0067, 52.3184], // J17 Watford Gap
  [-1.1219, 52.4033], // J18 Crick
  [-1.1852, 52.4869], // J19 Catthorpe
  [-1.2064, 52.5758], // J20 Lutterworth
  [-1.2203, 52.6646], // J21 Leicester Forest East
];

const routeASections = buildRoute({
  routeId: 'M1-A',
  routeName: 'M1-A',
  sectionPrefix: 'RA',
  waypoints: addCurvature(routeAWaypoints, { seed: 1 }),
  maxSections: 30, // generous cap; the real limit is the route's ~74km length at 5km/section
  activityIdBase: 1000,
  dayOffset: 0,
  statusBias: 0,
  statusOverrides: {
    // RA-003 lags behind the otherwise-completed run on either side — a
    // resourcing gap, not every section finishes in lockstep with its
    // neighbours.
    2: 'commissioning',
    // RA-007 is one of the demo sections with a hand-authored child-activity
    // breakdown (src/data/activities.json) written for "commissioning" —
    // pinned so the noise formula can't drift it out of sync with that story.
    6: 'commissioning',
  },
  commentOverrides: {
    2: 'HV testing team was pulled onto Section RA-005 to hit a DNO outage window; energisation testing here resumed but now trails its neighbours.',
  },
});

// Route B branches off Route A at a shared substation node partway along
// the corridor and runs to a second substation near Coventry — this is what
// gives the network its "web of connections" shape rather than one line.
const CONNECTION_INDEX = 3; // branch off Route A's 4th section (~20km in, near Northampton)
const connectionSection = routeASections[CONNECTION_INDEX];

const routeBWaypoints = [
  connectionSection.endCoord,
  [-1.2649, 52.3708], // Rugby
  [-1.3856, 52.3928],
  [-1.5106, 52.4068], // Coventry substation
];

const routeBSections = buildRoute({
  routeId: 'SPUR-B',
  routeName: 'Rugby-Coventry Spur',
  sectionPrefix: 'RB',
  waypoints: addCurvature(routeBWaypoints, { seed: 2 }),
  maxSections: 30, // generous cap; the real limit is the route's ~53km length at 5km/section
  activityIdBase: 2000,
  dayOffset: 60,
  statusBias: -0.15, // spur was started later, so it's earlier in its lifecycle
  externalPredecessorActivityId: connectionSection.p6ActivityId,
  statusOverrides: {
    // RB-007 is one of the demo sections with a hand-authored child-activity
    // breakdown (src/data/activities.json) written for "main works ongoing" —
    // pinned so the noise formula can't drift it out of sync with that story.
    6: 'main works ongoing',
  },
});

// Wire the tee junction: the Route A connection section now also feeds the
// spur's first activity, in addition to continuing along Route A.
connectionSection.successors.push(routeBSections[0].p6ActivityId);

const sections = [...routeASections, ...routeBSections];

writeFileSync(
  new URL('../src/data/sections.json', import.meta.url),
  JSON.stringify(sections, null, 2) + '\n',
);

console.log(
  `Generated ${routeASections.length} Route A sections + ${routeBSections.length} Route B sections (${sections.length} total, ${STEP_KM}km each), connected at ${connectionSection.sectionId}`,
);
