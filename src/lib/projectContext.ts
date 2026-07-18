import sectionsData from '../data/sections.json';
import activitiesData from '../data/activities.json';
import contractData from '../data/contract.json';
import type { Section } from '../types/section';
import type { SectionActivities } from '../types/activity';

const sections = sectionsData as Section[];
const activityGroups = activitiesData as SectionActivities[];

function summarizeStatusCounts(items: Section[]): string {
  const counts = new Map<string, number>();
  for (const s of items) counts.set(s.status, (counts.get(s.status) ?? 0) + 1);
  return [...counts.entries()].map(([status, count]) => `${count} ${status}`).join(', ');
}

function summarizeRoute(routeName: string): string {
  const routeSections = sections.filter((s) => s.routeName === routeName);
  const sectionLengthKm = routeSections[0].chainageEndKm - routeSections[0].chainageStartKm;
  const blockers = routeSections.filter((s) => s.blockers.length > 0);
  const critical = routeSections.filter((s) => s.freeFloat === 0);
  const lines = [
    `Route "${routeName}": ${routeSections.length} sections (${sectionLengthKm}km each). Status breakdown: ${summarizeStatusCounts(routeSections)}.`,
    `${critical.length} sections are on the critical path (zero free float): ${critical.map((s) => s.sectionId).join(', ') || 'none'}.`,
  ];
  if (blockers.length > 0) {
    lines.push(
      `Sections with reported blockers: ${blockers.map((s) => `${s.sectionId} (${s.blockers.join('; ')})`).join(' | ')}.`,
    );
  }
  return lines.join('\n');
}

function summarizeActivityExamples(): string {
  return activityGroups
    .map((group) => {
      const late = group.activities.filter((a) => a.status === 'late');
      const lateSummary =
        late.length > 0
          ? `Late child activities: ${late.map((a) => `${a.name} (${a.activityId})`).join(', ')}.`
          : 'No late child activities.';
      return `Section ${group.sectionId} (P6 summary ${group.p6ActivityId}, ${group.sectionSummary}): ${group.activities.length} child activities tracked. ${lateSummary}`;
    })
    .join('\n');
}

/**
 * Builds the system prompt context for the AI assistant: a compact summary
 * of the programme (not the full row-by-row dataset, to keep token usage
 * sane) plus the full contract terms, since those are small and the
 * assistant needs exact figures for penalty/date questions.
 */
export function buildSystemPrompt(): string {
  const routeNames = [...new Set(sections.map((s) => s.routeName))];

  return `You are a programme assistant for a National Grid electricity infrastructure upgrade project. You answer questions from the project team about construction progress and contract terms. Be concise, cite section IDs (e.g. "RA-013") and dates when relevant, and say clearly when something isn't covered by the data provided instead of guessing.

PROJECT OVERVIEW
Total sections modeled: ${sections.length} across ${routeNames.length} routes.

${routeNames.map(summarizeRoute).join('\n\n')}

DETAILED ACTIVITY EXAMPLES (only these sections have child-activity breakdowns in this demo)
${summarizeActivityExamples()}

CONTRACT TERMS (source of truth for any commercial/contractual question)
${JSON.stringify(contractData, null, 2)}

If asked about a section's status, resources, or blockers, use the summaries above. If asked about penalties, completion dates, maintenance, or damages, use the contract terms JSON exactly — quote the relevant figure. If a question can't be answered from the data above, say so rather than inventing figures.`;
}
