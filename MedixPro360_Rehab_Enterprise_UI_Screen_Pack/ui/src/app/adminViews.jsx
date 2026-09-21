import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronRight, CircleAlert, CircleCheck, ExternalLink, Filter, Plus, Search, ShieldCheck } from 'lucide-react';
import { WORKSPACES } from './access.js';
import { Ui12Router } from './ui12Views.jsx';
import { Ui13Router } from './ui13Views.jsx';
import { OnboardingRegistration } from './ui13Registration.jsx';
import { CapacityPolicyView, CapacityPurchaseView } from './ui13CapacityViews.jsx';

const tenants = [
  { id: 'tenant-veda', name: 'Veda Wellness', region: 'EU-DE', plan: 'Enterprise', status: 'Active', admins: 6, locations: 4 },
  { id: 'tenant-hope', name: 'Hope Recovery Network', region: 'EU-NL', plan: 'Professional', status: 'Onboarding', admins: 2, locations: 1 },
  { id: 'tenant-horizon', name: 'Horizon Community Care', region: 'EU-IE', plan: 'Enterprise', status: 'Suspended', admins: 4, locations: 3 }
];

const locations = [
  { name: 'Greater Noida Centre', type: 'Rehabilitation centre', status: 'Operational', capacity: '42 / 56', lead: 'Dr. Meera Shah' },
  { name: 'Residential Unit A', type: 'Residential rehabilitation', status: 'Operational', capacity: '18 / 20', lead: 'Nisha Verma' },
  { name: 'Greater Noida Community Service', type: 'Home-care service', status: 'Operational', capacity: '28 visits', lead: 'Arjun Rao' }
];

const users = [
  { name: 'Dr. Meera Shah', access: 'Clinical Director', scope: 'All centres', status: 'Active', lastSeen: 'Today · 09:12' },
  { name: 'Nisha Verma', access: 'Nurse / Residential', scope: 'Residential Unit A', status: 'Active', lastSeen: 'Today · 08:54' },
  { name: 'Arjun Rao', access: 'Home-care Coordinator', scope: 'Community Service', status: 'Invited', lastSeen: 'Not yet' },
  { name: 'Priya Malhotra', access: 'Billing User', scope: 'Greater Noida Centre', status: 'Active', lastSeen: 'Yesterday' }
];

const platformModules = [
  { name: 'Client Registry', enabled: 42, total: 42, health: 'Healthy' },
  { name: 'Clinical Workspace', enabled: 39, total: 42, health: 'Healthy' },
  { name: 'Home Care', enabled: 21, total: 42, health: 'Review 2 tenants' },
  { name: 'AI Intelligence', enabled: 18, total: 42, health: 'Governance review' }
];

function PageState({ title, detail }) { return <section className="pageState blue"><div className="stateIcon"><CircleAlert size={22} /></div><div><h2>{title}</h2><p>{detail}</p></div></section>; }
function MetricCard({ label, value, detail, tone = 'teal' }) { return <article className={`metricCard ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>; }

const centreQueues = {
  '/work/admissions': { title: 'Today’s admissions', kicker: 'Centre operations', columns: ['Client / referral', 'Program', 'Readiness', 'Owner'], rows: [['Aarav Mehta · MP-240018', 'Residential recovery', 'Ready for review', 'Intake team'], ['Maya Kapoor · MP-240022', 'Outpatient therapy', 'Documents missing', 'S. Iyer'], ['Rohan Singh · MP-240024', 'Home-care package', 'Eligibility review', 'Care coordinator']] },
  '/work/discharges': { title: 'Today’s discharges', kicker: 'Discharge coordination', columns: ['Client', 'Readiness', 'Blocker', 'Owner'], rows: [['Leah Wilson · MP-239881', 'Final review', 'Medication reconciliation', 'Dr. Shah'], ['Kabir Anand · MP-239912', 'Ready', 'None', 'Care coordinator']] },
  '/work/occupancy': { title: 'Occupancy & available capacity', kicker: 'Facility operations', columns: ['Unit', 'Occupied', 'Available', 'Status'], rows: [['Residential Unit A', '18 / 20', '2 beds', 'Operational'], ['Recovery Wing B', '21 / 28', '7 beds', 'Operational'], ['Short Stay Unit', '7 / 8', '1 bed', 'Review maintenance']] },
  '/work/schedule': { title: 'Appointments today', kicker: 'Centre schedule', columns: ['Time', 'Client / session', 'Owner', 'Status'], rows: [['09:30', 'Aarav Mehta · Intake review', 'Dr. Shah', 'Confirmed'], ['11:00', 'Group therapy · Recovery Wing B', 'T. Joseph', 'Confirmed'], ['14:30', 'Family session · MP-240022', 'S. Iyer', 'Needs confirmation']] },
  '/work/staff-assignments': { title: 'Staff & assignments', kicker: 'Operational coverage', columns: ['Team member', 'Role', 'Scope', 'Coverage'], rows: [['Nisha Verma', 'Nurse', 'Residential Unit A', 'Covered'], ['T. Joseph', 'Therapist', 'Recovery Wing B', '2 open tasks'], ['Arjun Rao', 'Home-care Coordinator', 'Community Service', 'Covered']] },
  '/work/operational-alerts': { title: 'Operational alerts', kicker: 'Needs attention', columns: ['Alert', 'Scope', 'Severity', 'Owner'], rows: [['Unassigned home-care visit', 'Community Service', 'High', 'Dispatch'], ['Documentation completion below target', 'Recovery Wing B', 'Medium', 'Centre admin'], ['Maintenance review due', 'Short Stay Unit', 'Low', 'Facilities']] },
  '/work/reports': { title: 'Centre reports', kicker: 'Operational reporting', columns: ['Report', 'Period', 'Owner', 'Status'], rows: [['Occupancy and capacity', 'Today', 'Operations', 'Ready'], ['Documentation completion', 'This week', 'Quality', 'Ready'], ['Admissions funnel', 'This month', 'Intake', 'Ready']] }
};

function Status({ children }) { return <span className={`statusChip ${String(children).toLowerCase().replaceAll(' ', '-')}`}>{children}</span>; }

function AdminHeader({ kicker, title, detail, action, onAction }) {
  return <div className="adminHeader"><div><span className="kicker">{kicker}</span><h2>{title}</h2><p>{detail}</p></div>{action && <button className="primary" onClick={onAction}><Plus size={16} /> {action}</button>}</div>;
}

function AdminTable({ columns, rows, onRow }) {
  return <div className="adminTable"><div className="adminTr adminTh">{columns.map(column => <span key={column}>{column}</span>)}</div>{rows.map((row, index) => <button className="adminTr" key={`${row[0]}-${index}`} onClick={() => onRow?.(row)}>{row.map((cell, cellIndex) => <span key={`${cell}-${cellIndex}`}>{cellIndex === row.length - 1 ? <Status>{cell}</Status> : cell}</span>)}<ExternalLink size={15} /></button>)}</div>;
}

function PlatformOrganizations({ navigate }) {
  const [query, setQuery] = useState('');
  const filtered = tenants.filter(tenant => `${tenant.name} ${tenant.region} ${tenant.plan}`.toLowerCase().includes(query.toLowerCase()));
  return <><AdminHeader kicker="Platform operations" title="Organizations" detail="Manage tenant lifecycle, entitlement posture and platform support access." action="Create tenant" onAction={() => navigate('/platform/onboarding')} /><div className="adminToolbar"><div className="adminSearch"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search organizations" /></div><button className="secondaryButton"><Filter size={15} /> Filters</button></div><AdminTable columns={['Organization', 'Region', 'Plan', 'Status', 'Admins', 'Locations']} rows={filtered.map(tenant => [tenant.name, tenant.region, tenant.plan, tenant.status, String(tenant.admins), String(tenant.locations)])} onRow={() => navigate('/platform/organizations/tenant-veda')} /></>;
}

function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const steps = ['Organization', 'Subscription', 'Entitlements', 'Data region', 'Initial admin', 'Review & activate'];
  const details = [
    ['Organization details', 'Capture the organization identity and primary operating contact.'],
    ['Subscription status', 'Choose the commercial package used to calculate available modules and limits.'],
    ['Module entitlements', 'Enable only purchased capabilities. Clinical access remains permission-scoped.'],
    ['Data region / isolation', 'Set the residency profile before any tenant data is connected.'],
    ['Initial tenant administrator', 'Invite the first tenant administrator with a scoped activation link.'],
    ['Review & activate', 'Confirm the onboarding record before activating the tenant workspace.']
  ];
  return <><AdminHeader kicker="Tenant onboarding" title="Create tenant" detail="A guided platform workflow for safely activating a new organization." /><div className="wizard"><div className="stepRail">{steps.map((item, index) => <button className={index === step ? 'active' : index < step ? 'complete' : ''} key={item} onClick={() => setStep(index)}><span>{index < step ? <Check size={14} /> : index + 1}</span>{item}</button>)}</div><section className="wizardBody"><span className="kicker">Step {step + 1} of {steps.length}</span><h3>{details[step][0]}</h3><p>{details[step][1]}</p><div className="formPreview"><label>Workspace field <input placeholder="Synthetic UI-1 field" /></label><label>Review owner <select><option>Platform Operations</option><option>Tenant Administration</option></select></label><div className="privacyNote"><ShieldCheck size={16} /><span>This is mock onboarding data. No tenant is created by the UI-1 prototype.</span></div></div><div className="wizardActions"><button className="secondaryButton" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>{step < steps.length - 1 ? <button className="primary" onClick={() => setStep(step + 1)}>Continue <ArrowRight size={16} /></button> : <button className="primary" onClick={() => setStep(0)}>Activation review complete <Check size={16} /></button>}</div></section></div></>;
}

function TenantUsers({ navigate }) {
  return <><AdminHeader kicker="Tenant administration" title="Users & access" detail="Memberships, location scope and access status for the tenant workforce." action="Invite user" onAction={() => navigate('/admin/users/invite')} /><div className="adminToolbar"><div className="adminSearch"><Search size={16} /><input placeholder="Search users, roles or locations" /></div><button className="secondaryButton"><Filter size={15} /> Filters</button></div><AdminTable columns={['User', 'Access', 'Scope', 'Status', 'Last seen']} rows={users.map(user => [user.name, user.access, user.scope, user.status, user.lastSeen])} /></>;
}

function AdminSection({ type, navigate }) {
  const sections = {
    platform: {
      '/platform/subscriptions': ['Subscriptions', 'Commercial status and plan posture across tenants.', ['Plan', 'Tenants', 'Renewal', 'Status'], [['Enterprise', '22', '2027-01-01', 'Healthy'], ['Professional', '18', '2026-11-14', 'Healthy'], ['Onboarding', '2', 'Pending', 'Review']]],
      '/platform/modules': ['Module catalogue', 'Entitlements are enabled per tenant and remain permission-scoped.', ['Module', 'Enabled tenants', 'Governance', 'Status'], platformModules.map(item => [item.name, `${item.enabled} / ${item.total}`, 'Policy checked', item.health])],
      '/platform/access': ['Platform access', 'Purpose-bound support access and platform membership review.', ['User', 'Access level', 'Scope', 'Status'], [['A. Singh', 'Platform support', 'Tenant support', 'Active'], ['S. Verma', 'Security audit', 'All platform', 'Active'], ['M. Rao', 'Operations', 'Platform', 'Review']]],
      '/platform/configuration': ['Platform configuration', 'Provider, region and feature controls for the SaaS platform.', ['Setting', 'Current value', 'Owner', 'Status'], [['Default data region', 'EU-DE', 'Security', 'Configured'], ['Support access policy', 'Purpose-bound', 'Security', 'Configured'], ['AI provider posture', 'Governed mock', 'AI Governance', 'Review']]],
      '/platform/operations': ['Operational health', 'Deployment, service and support posture without clinical record access.', ['Signal', 'Scope', 'Last check', 'Status'], [['API foundation', 'Platform', 'Today · 10:14', 'Healthy'], ['Integration health', 'Platform', 'Today · 10:10', 'Healthy'], ['Support backlog', 'Tenant support', 'Today · 09:52', 'Review']]],
      '/platform/integrations': ['Integration status', 'Provider connections and delivery health for platform operations.', ['Integration', 'Region', 'Last delivery', 'Status'], [['Identity provider', 'Global', 'Today · 10:12', 'Healthy'], ['Messaging provider', 'EU-DE', 'Today · 10:04', 'Healthy'], ['Analytics export', 'EU-DE', 'Yesterday', 'Review']]],
      '/platform/security': ['Platform security', 'Security posture, access review and controlled support operations.', ['Control', 'Owner', 'Review due', 'Status'], [['Privileged access', 'Security', 'Today', 'Healthy'], ['Tenant isolation', 'Platform', 'This week', 'Healthy'], ['Support sessions', 'Audit', 'Today', 'Review']]],
      '/platform/ai-governance': ['AI governance', 'Provider, model, use-case and safety oversight for authorized platform users.', ['Control', 'Scope', 'Owner', 'Status'], [['Use-case registry', 'Platform', 'AI Governance', 'Ready'], ['Provider status', 'Global', 'Platform Ops', 'Review'], ['AI incidents', 'Platform', 'Security', '1 open']]],
      '/platform/audit': ['Platform audit', 'Immutable platform events with purpose-bound tenant support visibility.', ['Event', 'Actor', 'Scope', 'Outcome'], [['Tenant activated', 'Platform Ops', 'Hope Recovery', 'Success'], ['Support access reviewed', 'Security', 'Veda Wellness', 'Success'], ['Module entitlement changed', 'Platform Admin', '3 tenants', 'Success']]]
    },
    tenant: {
      '/admin/organization': ['Organization profile', 'Tenant identity, operating details and ownership.', ['Field', 'Value', 'Last updated', 'Status'], [['Organization', 'Veda Wellness', 'Today', 'Configured'], ['Primary region', 'EU-DE', 'Today', 'Configured'], ['Operating model', 'Rehab + home care', 'Yesterday', 'Configured']]],
      '/admin/locations': ['Locations & centres', 'Location scope controls where users can work and what they can see.', ['Location', 'Type', 'Capacity', 'Status'], locations.map(location => [location.name, location.type, location.capacity, location.status])],
      '/admin/roles': ['Roles & permissions', 'Permission templates and role assignments for the tenant workforce.', ['Role', 'Members', 'Scope', 'Status'], [['Tenant Administrator', '4', 'All centres', 'Active'], ['Clinical Director', '2', 'Clinical', 'Active'], ['Home-care Coordinator', '6', 'Community Service', 'Active'], ['Read-only Auditor', '3', 'All centres', 'Active']]],
      '/admin/module-access': ['Module access', 'Tenant entitlements and access posture for enabled capabilities.', ['Module', 'Entitlement', 'Users with access', 'Status'], [['Clinical Workspace', 'Enabled', '39', 'Healthy'], ['Home Care', 'Enabled', '21', 'Healthy'], ['AI Intelligence', 'Enabled', '18', 'Review'], ['Billing', 'Enabled', '8', 'Healthy']]],
      '/admin/configuration': ['Master configuration', 'Configuration areas that shape the tenant operating model.', ['Area', 'Owner', 'Last review', 'Status'], [['Working hours', 'Operations', 'Today', 'Configured'], ['Consent configuration', 'Privacy', 'This week', 'Review'], ['Document templates', 'Administration', 'Yesterday', 'Configured']]],
      '/admin/forms': ['Forms & templates', 'Reusable configuration for future admission and clinical workflows.', ['Template', 'Use', 'Version', 'Status'], [['Admission readiness', 'Admission', 'v3', 'Draft'], ['Progress review', 'Clinical', 'v2', 'Active'], ['Home-care visit note', 'Home Care', 'v1', 'Active']]],
      '/admin/scheduling': ['Scheduling configuration', 'Working hours, appointment types and service availability.', ['Configuration', 'Scope', 'Owner', 'Status'], [['Centre hours', 'Greater Noida', 'Operations', 'Configured'], ['Home-care coverage', 'Community Service', 'Coordinator', 'Review'], ['Appointment types', 'All centres', 'Administration', 'Configured']]],
      '/admin/notifications': ['Notification configuration', 'Actionable alerts and escalation preferences.', ['Notification', 'Audience', 'Trigger', 'Status'], [['Unsigned documentation', 'Clinical', 'Due today', 'Active'], ['Consent expiry', 'Administration', '7 days', 'Active'], ['Visit missed', 'Home Care', 'Immediate', 'Active']]],
      '/admin/integrations': ['Tenant integrations', 'Tenant-level provider configuration and delivery status.', ['Integration', 'Scope', 'Last delivery', 'Status'], [['Identity provider', 'Tenant', 'Today · 10:12', 'Healthy'], ['Messaging', 'Tenant', 'Today · 10:04', 'Healthy'], ['Data export', 'Tenant', 'Yesterday', 'Review']]],
      '/admin/privacy-security': ['Privacy & security', 'Retention, sensitive-record and access-review configuration.', ['Control', 'Scope', 'Review due', 'Status'], [['Sensitive record access', 'Tenant', 'Today', 'Configured'], ['Retention profile', 'Tenant', 'This month', 'Review'], ['Break-glass review', 'Clinical', 'Weekly', 'Configured']]],
      '/admin/audit': ['Tenant audit', 'Tenant-scoped audit events and access review.', ['Event', 'Actor', 'Resource', 'Outcome'], [['User invited', 'Tenant Admin', 'Arjun Rao', 'Success'], ['Role changed', 'Tenant Admin', 'Home-care Coordinator', 'Success'], ['Access reviewed', 'Quality', 'Veda Wellness', 'Success']]],
      '/admin/subscription': ['Subscription status', 'Read-only commercial and entitlement status for the tenant.', ['Plan', 'Renewal', 'Modules', 'Status'], [['Enterprise', '2027-01-01', '9 enabled', 'Healthy']]]
    }
  };
  const data = sections[type][window.location.pathname];
  if (!data) return null;
  return <><AdminHeader kicker={type === 'platform' ? 'Platform operations' : 'Tenant administration'} title={data[0]} detail={data[1]} /><AdminTable columns={data[2]} rows={data[3]} onRow={() => navigate(type === 'platform' ? '/platform/overview' : '/admin/overview')} /></>;
}

function InviteUserView() {
  return <><AdminHeader kicker="Tenant administration" title="Invite user" detail="Create an invitation with role and location scope before it is sent." action="Send invitation" onAction={() => {}} /><div className="wizard"><section className="wizardBody"><span className="kicker">Draft invitation</span><h3>Access scope</h3><p>Invitation delivery is a UI-2 mock action. No account is created until a future identity API is connected.</p><div className="formPreview"><label>Email address<input placeholder="person@example.test" /></label><label>Role<select><option>Clinical Director</option><option>Home-care Coordinator</option><option>Billing User</option></select></label><label>Location scope<select><option>Greater Noida Centre</option><option>All centres</option></select></label><label>Expiry<select><option>7 days</option><option>14 days</option></select></label></div></section></div></>;
}

function CentreQueue({ path }) {
  const queue = centreQueues[path] || centreQueues['/work/operational-alerts'];
  return <><AdminHeader kicker={queue.kicker} title={queue.title} detail="Synthetic operational data for UI-2. Each row is a future workflow entry point." /><div className="adminToolbar"><div className="adminSearch"><Search size={16} /><input placeholder="Search queue" /></div><button className="secondaryButton"><Filter size={15} /> Filters</button><button className="secondaryButton">Saved view</button></div><AdminTable columns={queue.columns} rows={queue.rows} /></>;
}

function AdminOverview({ access, path, navigate }) {
  if (path === '/settings/subscription/capacity') return <CapacityPurchaseView access={access} />;
  if (path === '/super-admin/subscriptions/capacity-policy') return <CapacityPolicyView access={access} />;
  if (path === '/register') return <OnboardingRegistration navigate={navigate} />;
  if (path === '/register' || path.startsWith('/super-admin/') || path.startsWith('/settings/subscription') || path.startsWith('/settings/facilities') || path.startsWith('/subscription/checkout')) return <Ui13Router access={access} path={path} navigate={navigate} />;
  if (path.startsWith('/admin/configuration')) return <Ui12Router access={access} path={path} navigate={navigate} />;
  if (path === '/platform/onboarding') return <OnboardingWizard />;
  if (path === '/platform/organizations') return <PlatformOrganizations navigate={navigate} />;
  if (path === '/admin/users') return <TenantUsers navigate={navigate} />;
  if (path === '/admin/users/invite') return <InviteUserView />;
  if (path.startsWith('/work/') && !['/work/tasks', '/work/centre-overview'].includes(path)) return <CentreQueue path={path} />;
  if (path === '/platform/organizations/tenant-veda') return <><AdminHeader kicker="Organization detail" title="Veda Wellness" detail="Enterprise tenant · EU-DE · 4 locations · 6 administrators" action="Suspend tenant" /><div className="adminCards"><div className="panel"><div className="panelHeader"><div><span className="kicker">Lifecycle</span><h2>Tenant status</h2></div><Status>Active</Status></div><div className="detailRows"><span>Subscription</span><b>Enterprise</b><span>Data region</span><b>EU-DE</b><span>Module posture</span><b>9 enabled</b><span>Support access</span><b>Purpose-bound only</b></div></div><div className="panel"><div className="panelHeader"><div><span className="kicker">Entitlements</span><h2>Enabled modules</h2></div></div>{platformModules.map(module => <div className="moduleRow" key={module.name}><span><b>{module.name}</b><small>{module.enabled} of {module.total} tenants</small></span><Status>{module.health}</Status></div>)}</div></div></>;
  const isPlatform = access.workspace === WORKSPACES.PLATFORM_OPERATIONS;
  const isTenant = access.workspace === WORKSPACES.TENANT_ADMINISTRATION;
  const isCentre = access.workspace === WORKSPACES.CENTRE_OPERATIONS;
  if (isPlatform && path !== '/platform/overview') return <AdminSection type="platform" navigate={navigate} />;
  if (isTenant && path !== '/admin/overview') return <AdminSection type="tenant" navigate={navigate} />;
  if (isPlatform) return <><AdminHeader kicker="Platform operations" title="Platform overview" detail="Tenant lifecycle, operational health and governed support access." /><div className="metrics"><MetricCard label="Active tenants" value="42" detail="2 onboarding" /><MetricCard label="Operational health" value="99.8%" detail="Within target" tone="blue" /><MetricCard label="Open support cases" value="7" detail="2 urgent" tone="amber" /><MetricCard label="AI reviews" value="14" detail="Governance queue" tone="purple" /></div><div className="adminCards"><div className="panel"><div className="panelHeader"><div><span className="kicker">Lifecycle queue</span><h2>Tenant attention</h2></div><button className="textButton" onClick={() => navigate('/platform/organizations')}>Organizations <ArrowRight size={15} /></button></div><div className="moduleRow"><span><b>Hope Recovery Network</b><small>Onboarding · Initial admin pending</small></span><Status>Onboarding</Status></div><div className="moduleRow"><span><b>Horizon Community Care</b><small>Suspended · Review requested</small></span><Status>Suspended</Status></div></div><div className="panel"><div className="panelHeader"><div><span className="kicker">Governance</span><h2>Control posture</h2></div></div><div className="privacyNote"><ShieldCheck size={16} /><span>Platform support access is purpose-bound, scoped and audited. Patient records are not part of this workspace.</span></div></div></div></>;
  if (isTenant) return <><AdminHeader kicker="Tenant administration" title="Administration overview" detail="Configure the organization without exposing platform-only controls." action="Invite user" onAction={() => navigate('/admin/users')} /><div className="metrics"><MetricCard label="Users" value="128" detail="6 invitations" /><MetricCard label="Locations" value="4" detail="All operational" tone="blue" /><MetricCard label="Modules enabled" value="9" detail="1 pending review" tone="purple" /><MetricCard label="Audit events" value="24" detail="Today" tone="amber" /></div><div className="adminCards"><div className="panel"><div className="panelHeader"><div><span className="kicker">Configuration health</span><h2>Administration checklist</h2></div></div>{['Organization profile', 'Locations and scope', 'Users and memberships', 'Privacy and security'].map((item, index) => <div className="moduleRow" key={item}><span><b>{item}</b><small>{index === 3 ? 'Review required' : 'Configured'}</small></span><Status>{index === 3 ? 'Review' : 'Ready'}</Status></div>)}</div><div className="panel"><div className="panelHeader"><div><span className="kicker">Next best action</span><h2>Access administration</h2></div></div><button className="quickAction" onClick={() => navigate('/admin/users')}>Review users & invitations <ArrowRight size={15} /></button><button className="quickAction" onClick={() => navigate('/admin/roles')}>Review roles & permissions <ArrowRight size={15} /></button></div></div></>;
  if (isCentre) return <><AdminHeader kicker="Centre operations" title="Centre overview" detail="Operational queues for admissions, discharges, occupancy and staffing." /><div className="metrics"><MetricCard label="Today's admissions" value="3" detail="1 missing document" /><MetricCard label="Today's discharges" value="2" detail="1 blocker" tone="blue" /><MetricCard label="Occupancy" value="82%" detail="9 beds available" tone="amber" /><MetricCard label="Operational alerts" value="4" detail="2 high priority" tone="purple" /></div><div className="adminCards"><div className="panel"><div className="panelHeader"><div><span className="kicker">Action queues</span><h2>Centre operations</h2></div></div>{[['Admissions', '/work/admissions'], ['Discharges', '/work/discharges'], ['Occupancy & beds', '/work/occupancy'], ['Operational alerts', '/work/operational-alerts']].map(([label, href]) => <button className="quickAction" key={href} onClick={() => navigate(href)}>{label}<ArrowRight size={15} /></button>)}</div><div className="panel"><div className="panelHeader"><div><span className="kicker">Coverage</span><h2>Staff & assignments</h2></div></div><div className="moduleRow"><span><b>Residential Unit A</b><small>18 residents · 2 checks due</small></span><Status>Covered</Status></div><div className="moduleRow"><span><b>Community Service</b><small>28 visits · 3 unassigned</small></span><Status>Review</Status></div></div></div></>;
  return <PageState title="Workspace available" detail="This UI-2 workspace is permission-aware, but its next workflow phase has not been implemented." />;
}

export { AdminOverview };
