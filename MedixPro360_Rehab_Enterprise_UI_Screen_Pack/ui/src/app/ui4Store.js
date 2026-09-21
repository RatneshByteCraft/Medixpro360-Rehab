import { useSyncExternalStore } from 'react';
import { addTask } from './crossCuttingStore.js';

const sectionNames = ['Presenting Problem', 'Mental Health History', 'Substance Use History', 'Medical / Physical Health', 'Medication Summary', 'Allergies', 'Previous Treatment', 'Family / Social Context', 'Risk / Safety', 'Protective Factors', 'Strengths', 'Goals / Expectations', 'Clinical Formulation', 'Recommendations'];
const initialState = {
  assessments: [{ id: 'assess-1001', clientId: 'client-1001', type: 'Initial Clinical Assessment', status: 'Draft', version: 1, assignedClinician: 'Dr. Meera Shah', started: 'Today · 09:10', due: 'Today · 17:00', lastSaved: 'Today · 09:42', sections: sectionNames.map((name, index) => ({ name, status: index === 0 ? 'Complete' : 'Not Started', required: !['Medication Summary', 'Substance Use History'].includes(name), content: index === 0 ? 'Residential rehabilitation continuation and current treatment needs.' : '' })), riskActionOpen: true, signer: null, signedAt: null, amendments: [] }],
  careTeams: [{ clientId: 'client-1001', assignments: [{ id: 'team-1', person: 'Dr. Meera Shah', responsibility: 'Primary Clinician', from: '18 Sep 2026', to: null, assignedBy: 'Centre Admin', status: 'Active', reason: 'Admission care lead' }, { id: 'team-2', person: 'Arjun Rao', responsibility: 'Care Coordinator', from: '18 Sep 2026', to: null, assignedBy: 'Centre Admin', status: 'Active', reason: 'Continuity coordinator' }] }],
  plans: [{ clientId: 'client-1001', versions: [{ version: 1, status: 'Active', created: '18 Sep 2026 · 09:30', owner: 'Dr. Meera Shah', needs: [{ id: 'need-1001', description: 'Build sustainable recovery routines', priority: 'High', status: 'Open', goals: [{ id: 'goal-1001', statement: 'Build sustainable coping and participation', targetDate: '30 Nov 2026', status: 'Active', progress: 0, objectives: [{ id: 'objective-1001', description: 'Complete weekly coping practice', targetDate: '30 Nov 2026', owner: 'Dr. Meera Shah', status: 'Active', progress: 0, interventions: [{ id: 'intervention-1001', description: 'Weekly structured therapy and care-coordination review', type: 'Therapy support', frequency: 'Weekly', owner: 'Dr. Meera Shah', status: 'Active' }] }] }] }] }], activeVersion: 1 }],
  meetings: [{ id: 'mdt-1001', clientId: 'client-1001', title: 'Aarav Mehta · Initial MDT review', date: 'Tomorrow · 10:00', chair: 'Dr. Meera Shah', status: 'Draft', participants: ['Dr. Meera Shah', 'Arjun Rao', 'Nisha Verma'], discussion: '', decision: '', action: null, signedAt: null }],
  tasks: [],
  events: [],
  revision: 0
};
let state = structuredClone(initialState);
const listeners = new Set();
const emit = () => { state = { ...state, revision: state.revision + 1 }; listeners.forEach(listener => listener()); };
const nextId = prefix => `${prefix}-${Date.now().toString(36)}`;
export function getUi4State() { return state; }
export function useUi4Store() { return useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, getUi4State, getUi4State); }
export const ui4Services = { clinicalAssessmentService: { source: 'MOCK' }, riskAssessmentService: { source: 'MOCK' }, careTeamService: { source: 'MOCK' }, treatmentPlanService: { source: 'MOCK' }, mdtService: { source: 'MOCK' }, clinicalTimelineService: { source: 'MOCK' } };
export { sectionNames };
export function updateAssessment(id, patch) { state.assessments = state.assessments.map(item => item.id === id ? { ...item, ...patch } : item); emit(); }
export function resolveRiskAction(id) { updateAssessment(id, { riskActionOpen: false }); }
export function updateAssessmentSection(id, name, patch) { state.assessments = state.assessments.map(item => item.id === id ? { ...item, sections: item.sections.map(section => section.name === name ? { ...section, ...patch } : section), lastSaved: 'Just now' } : item); emit(); }
export function addAssessmentAmendment(id, reason, content) { state.assessments = state.assessments.map(item => item.id === id ? { ...item, amendments: [...item.amendments, { id: nextId('amend'), version: item.version + 1, reason, content, signedBy: 'Dr. Meera Shah', signedAt: 'Just now' }] } : item); emit(); }
export function assignTeam(clientId, assignment) { const teams = state.careTeams.find(item => item.clientId === clientId) || { clientId, assignments: [] }; const updated = { ...assignment, id: nextId('team'), from: 'Today', to: null, assignedBy: 'Centre Admin', status: 'Active' }; state.careTeams = [...state.careTeams.filter(item => item.clientId !== clientId), { ...teams, assignments: [...teams.assignments.filter(item => item.responsibility !== assignment.responsibility || item.status !== 'Active'), updated] }]; emit(); }
export function endTeamAssignment(clientId, assignmentId) { state.careTeams = state.careTeams.map(team => team.clientId === clientId ? { ...team, assignments: team.assignments.map(item => item.id === assignmentId ? { ...item, status: 'Ended', to: 'Today' } : item) } : team); emit(); }
export function addNeed(clientId) { const plan = state.plans.find(item => item.clientId === clientId); const version = plan.activeVersion; state.plans = state.plans.map(item => item.clientId === clientId ? { ...item, versions: item.versions.map(v => v.version === version ? { ...v, needs: [...v.needs, { id: nextId('need'), description: 'Stabilize recovery and daily functioning', priority: 'High', status: 'Open', goals: [] }] } : v) } : item); emit(); }
export function addGoal(clientId, needId) { mutatePlan(clientId, version => ({ ...version, needs: version.needs.map(need => need.id === needId ? { ...need, goals: [...need.goals, { id: nextId('goal'), statement: 'Build sustainable coping and participation', targetDate: '30 Nov 2026', status: 'Draft', progress: 0, objectives: [] }] } : need) })); }
export function addObjective(clientId, needId, goalId) {
  mutatePlan(clientId, version => ({
    ...version,
    needs: version.needs.map(need => need.id === needId ? {
      ...need,
      goals: need.goals.map(goal => goal.id === goalId ? {
        ...goal,
        objectives: [...goal.objectives, { id: nextId('objective'), description: 'Complete weekly coping practice', targetDate: '30 Nov 2026', owner: 'Dr. Meera Shah', status: 'Draft', progress: 0, interventions: [] }]
      } : goal)
    } : need)
  }));
}
export function addIntervention(clientId, needId, goalId, objectiveId) {
  mutatePlan(clientId, version => ({
    ...version,
    needs: version.needs.map(need => need.id === needId ? {
      ...need,
      goals: need.goals.map(goal => goal.id === goalId ? {
        ...goal,
        objectives: goal.objectives.map(objective => objective.id === objectiveId ? {
          ...objective,
          interventions: [...objective.interventions, { id: nextId('intervention'), description: 'Weekly structured therapy and care-coordination review', type: 'Therapy support', frequency: 'Weekly', owner: 'Dr. Meera Shah', status: 'Draft' }]
        } : objective)
      } : goal)
    } : need)
  }));
}
function mutatePlan(clientId, callback) { const plan = state.plans.find(item => item.clientId === clientId); state.plans = state.plans.map(item => item.clientId === clientId ? { ...item, versions: item.versions.map(v => v.version === item.activeVersion ? callback(v) : v) } : item); emit(); }
export function reviewPlan(clientId) { mutatePlan(clientId, version => ({ ...version, status: 'Clinical Review' })); }
export function approvePlan(clientId) { mutatePlan(clientId, version => ({ ...version, status: 'Approved' })); }
export function activatePlan(clientId) { mutatePlan(clientId, version => ({ ...version, status: 'Active' })); }
export function revisePlan(clientId) { const plan = state.plans.find(item => item.clientId === clientId); const current = plan.versions.find(v => v.version === plan.activeVersion); state.plans = state.plans.map(item => item.clientId === clientId ? { ...item, activeVersion: current.version + 1, versions: [...item.versions, { ...structuredClone(current), version: current.version + 1, status: 'Draft', created: 'Just now' }] } : item); emit(); }
export function addMdtAction(meetingId, action) { state.meetings = state.meetings.map(meeting => meeting.id === meetingId ? { ...meeting, action: { ...action, id: nextId('mdt-action') } } : meeting); emit(); }
export function finalizeMdt(meetingId) { const meeting = state.meetings.find(item => item.id === meetingId); if (!meeting) return; state.meetings = state.meetings.map(item => item.id === meetingId ? { ...item, status: 'Completed', signedAt: 'Just now' } : item); if (meeting.action) { const task = { id: nextId('task'), title: meeting.action.title, owner: meeting.action.owner, due: meeting.action.due, source: 'MDT action', sourceModule: 'mdt', sourceRecordType: 'MDT', sourceRecordId: meetingId, clientId: meeting.clientId, location: 'Greater Noida Centre', permissions: ['mdt.view'], module: 'mdt', destinationRoute: `/mdt/${meetingId}`, status: 'Due', sensitivity: 'clinical' }; state.tasks = [...state.tasks, task]; addTask(task); } emit(); }
export function addGlobalTask(task) { state.tasks = [...state.tasks, task]; addTask(task); emit(); }
export function resetUi4Store() { state = structuredClone(initialState); emit(); }
