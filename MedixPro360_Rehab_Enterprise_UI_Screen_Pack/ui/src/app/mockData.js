export const attentionItems = [
  { id: 'attention-1', tone: 'amber', title: 'Unsigned clinical note', detail: 'Review and sign before the end of shift', href: '/work/clinical' },
  { id: 'attention-2', tone: 'red', title: 'Medication review required', detail: 'Two clients need a clinician review', href: '/nursing/medication' },
  { id: 'attention-3', tone: 'blue', title: 'Unassigned home-care visit', detail: 'Tomorrow · 10:30 · Community team', href: '/home-care/visits' },
  { id: 'attention-4', tone: 'purple', title: 'AI draft awaiting review', detail: 'Human review is required before use', href: '/work/ai-intelligence' }
];

export const taskItems = [
  { title: 'Complete admission readiness review', owner: 'Intake team', due: 'Today · 11:30', status: 'Due today' },
  { title: 'Review treatment-plan action', owner: 'Care team', due: 'Today · 14:00', status: 'In progress' },
  { title: 'Confirm family follow-up', owner: 'Aftercare', due: 'Tomorrow · 09:00', status: 'Upcoming' }
];

export const notificationItems = [
  { title: 'Consent expires in 7 days', detail: 'Client workspace · restricted record', tone: 'amber' },
  { title: 'New MDT action assigned', detail: 'Due today · Greater Noida Centre', tone: 'blue' },
  { title: 'Home-care visit marked late', detail: 'Community service · Visit HC-2408', tone: 'red' }
];

export const searchResults = [
  { type: 'Client', label: 'Aarav Mehta', detail: 'MRN MP-240018 · Residential Unit A', href: '/work/clients' },
  { type: 'Task', label: 'Admission readiness review', detail: 'Due today · Intake team', href: '/work/tasks' },
  { type: 'Location', label: 'Greater Noida Centre', detail: 'Veda Wellness · Centre context', href: '/admin/locations' }
];
