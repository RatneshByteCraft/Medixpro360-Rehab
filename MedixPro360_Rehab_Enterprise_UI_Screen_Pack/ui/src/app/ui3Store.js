import { useSyncExternalStore } from 'react';
import { addTask } from './crossCuttingStore.js';

const initialState = {
  referrals: [
    { id: 'ref-1001', name: 'Maya Kapoor', dob: '1988-04-16', mobile: '+91 98765 44012', source: 'Hospital partner', service: 'Residential recovery', centre: 'Greater Noida Centre', priority: 'High', status: 'New', assigned: 'Intake team', presenting: 'Support with substance-use recovery and structured residential care.', notes: 'Family requested an initial call this week.', created: 'Today · 08:45', clientId: null, screening: null },
    { id: 'ref-1002', name: 'Leah Wilson', dob: '1994-11-02', mobile: '+44 7700 900118', source: 'Self enquiry', service: 'Outpatient therapy', centre: 'Greater Noida Centre', priority: 'Routine', status: 'Under Review', assigned: 'S. Iyer', presenting: 'Anxiety and adjustment support after relocation.', notes: 'Prefers afternoon appointments.', created: 'Yesterday · 15:20', clientId: null, screening: { eligibility: 'Review', risk: 'No immediate risk', decision: null } },
    { id: 'ref-1003', name: 'Aarav Mehta', dob: '1985-06-19', mobile: '+91 98765 44012', source: 'Community referral', service: 'Residential recovery', centre: 'Residential Unit A', priority: 'High', status: 'Accepted', assigned: 'Dr. Meera Shah', presenting: 'Continuity of residential rehabilitation after a previous episode.', notes: 'Existing client match likely.', created: '18 Sep · 10:05', clientId: 'client-1001', screening: { eligibility: 'Eligible', risk: 'Review on admission', decision: 'Accepted' } },
    { id: 'ref-1004', name: 'Sofia Khan', dob: '1979-02-08', mobile: '+91 98100 77122', source: 'Family enquiry', service: 'Home-care package', centre: 'Community Service', priority: 'Routine', status: 'Waitlisted', assigned: 'Care coordinator', presenting: 'Support needed at home after discharge.', notes: 'Awaiting package availability.', created: '17 Sep · 12:30', clientId: null, screening: { eligibility: 'Eligible', risk: 'No immediate risk', decision: 'Waitlisted' } }
  ],
  clients: [
    { id: 'client-1001', tenant: 'Veda Wellness', name: 'Aarav Mehta', mrn: 'MP-240018', dob: '1985-06-19', age: 41, status: 'Active admission', program: 'Residential recovery', centre: 'Residential Unit A', bed: 'A-12', admissionId: 'adm-1001', primaryClinician: 'Dr. Meera Shah', careCoordinator: 'Arjun Rao', allergies: 'No known allergies', risk: 'Review on admission', consent: 'Current', phone: '+91 98765 44012', email: 'aarav.mehta@example.test', emergency: 'Neha Mehta · +91 98765 44099', events: [{ type: 'Referral', title: 'Community referral accepted', date: '18 Sep · 10:05' }, { type: 'Admission', title: 'Residential admission completed', date: '18 Sep · 14:10' }] },
    { id: 'client-1002', name: 'Leah Wilson', mrn: 'MP-239881', dob: '1994-11-02', age: 31, status: 'Active admission', program: 'Residential recovery', centre: 'Residential Unit A', bed: null, admissionId: 'adm-1002', tenant: 'Veda Wellness', primaryClinician: 'Dr. Meera Shah', careCoordinator: 'Arjun Rao', allergies: 'Penicillin allergy recorded', risk: 'No immediate risk', consent: 'Current', phone: '+44 7700 900118', email: 'leah.wilson@example.test', emergency: 'Wilson family · +44 7700 900119', events: [{ type: 'Admission', title: 'Residential admission completed', date: '18 Sep · 14:20' }] },
    { id: 'client-1003', name: 'Sofia Khan', mrn: 'MP-239999', dob: '1979-02-08', age: 47, status: 'Active admission', program: 'Residential recovery', centre: 'Centre B', bed: null, admissionId: 'adm-1003', tenant: 'Veda Wellness', primaryClinician: 'Dr. Meera Shah', careCoordinator: 'Arjun Rao', allergies: 'No known allergies', risk: 'No immediate risk', consent: 'Current', phone: '+91 98100 77122', email: 'sofia.khan@example.test', emergency: 'Khan family · +91 98100 77123', events: [{ type: 'Admission', title: 'Centre B admission completed', date: '19 Sep · 09:00' }] },
    { id: 'client-2001', name: 'Tara Singh', mrn: 'T2-1001', dob: '1988-03-12', age: 38, status: 'Active admission', program: 'Residential recovery', centre: 'Tenant T2 Centre', bed: null, admissionId: 't2-adm-1001', tenant: 'Tenant T2', primaryClinician: 'Dr. Meera Shah', careCoordinator: 'Arjun Rao', allergies: 'No known allergies', risk: 'No immediate risk', consent: 'Current', phone: '+91 90000 10001', email: 'tara.singh@example.test', emergency: 'T2 family · +91 90000 10002', events: [{ type: 'Admission', title: 'Tenant T2 admission completed', date: '19 Sep · 09:00' }] }
  ],
  admissions: [],
  revision: 0
};

let state = structuredClone(initialState);
const listeners = new Set();
const emit = () => { state = { ...state, revision: state.revision + 1 }; listeners.forEach(listener => listener()); };
const nextId = prefix => `${prefix}-${Date.now().toString(36)}`;

export const ui3Services = {
  referralService: { source: 'MOCK', list: () => state.referrals, get: id => state.referrals.find(item => item.id === id) },
  clientRegistryService: { source: 'MOCK', list: () => state.clients, get: id => state.clients.find(item => item.id === id) },
  admissionService: { source: 'MOCK', list: () => state.admissions, get: id => state.admissions.find(item => item.id === id) },
  documentReadinessService: { source: 'MOCK', get: () => [{ name: 'Identity document', status: 'Received', required: true }, { name: 'Referral document', status: 'Received', required: true }, { name: 'Consent packet', status: 'Pending', required: true }] },
  consentReadinessService: { source: 'MOCK', get: () => ({ status: 'Pending', purpose: 'Admission and care coordination', scope: 'Tenant clinical team' }) },
  staffAssignmentService: { source: 'MOCK', list: () => ['Dr. Meera Shah', 'Arjun Rao', 'Nisha Verma', 'S. Iyer'] },
  bedAvailabilityService: { source: 'MOCK', list: () => ['A-12 · Residential Unit A', 'A-14 · Residential Unit A', 'B-03 · Recovery Wing B'] },
  taskService: { source: 'MOCK', getInitialTasks: () => ['Initial assessment', 'Risk review', 'Treatment-plan preparation'] }
};

export function getUi3State() { return state; }
export function useUi3Store() { return useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, getUi3State, getUi3State); }

export function updateReferral(id, patch) { state.referrals = state.referrals.map(item => item.id === id ? { ...item, ...patch } : item); emit(); }
export function createClientFromReferral(referralId, mode = 'new') {
  const referral = state.referrals.find(item => item.id === referralId);
  if (!referral) return null;
  const existing = state.clients.find(item => item.name.toLowerCase() === referral.name.toLowerCase() || item.phone === referral.mobile);
  if (mode === 'existing' && existing) { updateReferral(referralId, { clientId: existing.id, status: 'Accepted' }); return existing.id; }
  const client = { id: nextId('client'), name: referral.name, mrn: `MP-${Math.floor(240100 + Math.random() * 899)}`, dob: referral.dob, age: new Date().getFullYear() - Number(referral.dob.slice(0, 4)), status: 'Pre-admission', program: referral.service, centre: referral.centre, bed: null, primaryClinician: 'Unassigned', careCoordinator: referral.assigned, allergies: 'Not yet recorded', risk: 'Screening required', consent: 'Pending', phone: referral.mobile, email: 'Pending confirmation', emergency: 'Pending confirmation', events: [{ type: 'Referral', title: 'Referral converted to client record', date: 'Just now' }] };
  state.clients = [...state.clients, client];
  updateReferral(referralId, { clientId: client.id, status: 'Accepted' });
  return client.id;
}
export function decideReferral(id, decision) { updateReferral(id, { status: decision, screening: { ...(state.referrals.find(item => item.id === id)?.screening || {}), eligibility: decision === 'Declined' ? 'Not eligible' : 'Eligible', decision } }); }
export function createAdmission(referralId, clientId, residential) {
  const admission = { id: nextId('adm'), referralId, clientId, residential, status: 'Draft', step: 0, program: residential ? 'Residential recovery' : 'Outpatient therapy', centre: residential ? 'Residential Unit A' : 'Greater Noida Centre', bed: null, documents: ui3Services.documentReadinessService.get(), consent: ui3Services.consentReadinessService.get(), careTeam: ['Dr. Meera Shah', 'Arjun Rao'], tasks: ui3Services.taskService.getInitialTasks() };
  state.admissions = [...state.admissions.filter(item => item.clientId !== clientId), admission]; addTask({ id: nextId('task'), title: 'Complete admission readiness review', owner: 'Intake team', due: 'Today', status: 'Due', sourceModule: 'admissions', sourceRecordType: 'Admission', sourceRecordId: admission.id, clientId, location: admission.centre, permissions: ['admissions.view'], module: 'admissions', destinationRoute: '/work/admissions', sensitivity: 'operational' }); emit(); return admission.id;
}
export function updateAdmission(id, patch) { state.admissions = state.admissions.map(item => item.id === id ? { ...item, ...patch } : item); emit(); }
export function completeAdmission(id) {
  const admission = state.admissions.find(item => item.id === id); if (!admission) return;
  state.admissions = state.admissions.map(item => item.id === id ? { ...item, status: 'Admitted', step: 13 } : item);
  state.clients = state.clients.map(client => client.id === admission.clientId ? { ...client, status: 'Active admission', program: admission.program, centre: admission.centre, bed: admission.bed, consent: 'Current', events: [...client.events, { type: 'Admission', title: 'Admission completed', date: 'Just now' }] } : client);
  state.referrals = state.referrals.map(referral => referral.id === admission.referralId ? { ...referral, status: 'Converted' } : referral); emit();
}
export function closeCanonicalAdmission(clientId, admissionId, patch = {}) {
  state.admissions = state.admissions.map(item => item.id === admissionId || (item.clientId === clientId && item.status === 'Admitted') ? { ...item, status: 'Discharged', ...patch } : item);
  state.clients = state.clients.map(item => item.id === clientId ? { ...item, status: 'Discharged', admissionStatus: 'Discharged', ...patch } : item);
  emit();
  return true;
}
export function resetUi3Store() { state = structuredClone(initialState); emit(); }
