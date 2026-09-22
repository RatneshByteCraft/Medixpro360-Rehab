import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, ArrowUpRight, Bell, BedDouble, Boxes, Building2, CalendarDays, Check, ChevronDown,
  ClipboardList, FileCheck2, Grid2X2, LayoutDashboard, Menu, Package, Pin, Receipt, Search, Settings2,
  ShieldCheck, Sparkles, Stethoscope, UserCircle2, Users, WalletCards, X
} from 'lucide-react';
import { can, demoProfiles, getAccessProfile, hasModule, PERMISSIONS, WORKSPACES } from './app/access';
import { getEffectiveNavigation, getWorkspaceLabel } from './app/navigation';
import { attentionItems } from './app/mockData';
import { getSearchResults, getVisibleNotifications, getVisibleTasks, useCrossCuttingStore } from './app/crossCuttingStore.js';
import { AdminOverview } from './app/adminViews';
import { Ui3Router } from './app/ui3Views';
import { Ui4Router } from './app/ui4Views';
import { Ui5Router } from './app/ui5Views';
import { Ui6Router as LegacyUi6Router } from './app/ui6Views';
import { MedicationMarView, MedicationScheduleView } from './app/ui6MedicationViews.jsx';
import { MedicationPrnView } from './app/ui6PrnViews.jsx';
import { ResidentialContext } from './app/residentialViews.jsx';
import { ResidentialIncidentView } from './app/residentialIncidentViews.jsx';
import { FacilityAssignmentView } from './app/facilityAssignmentView.jsx';
import { FacilityTransferView } from './app/facilityTransferView.jsx';
import { FacilityLeaveView } from './app/facilityLeaveView.jsx';
import { HomeCareRouter } from './app/homeCareViews.jsx';
import { Ui8Router } from './app/ui8Views.jsx';
import { Ui9Router } from './app/ui9Views.jsx';
import { Ui10Router } from './app/ui10Views.jsx';
import { Ui11Router } from './app/ui11Views.jsx';
import { Ui12Router } from './app/ui12Views.jsx';
import { Ui13Router } from './app/ui13Views.jsx';
import { Ui14Router } from './app/ui14Views.jsx';
import { activateStaffSession, getSessionMode, SESSION_MODES, useUi14Store } from './app/ui14Store.js';
import { getActiveTenantAccess, getOnboardingAccess, hasValidOnboardingContext } from './app/ui13Store.js';
import './styles.css';
import './styles-ui2.css';
import './styles-ui3.css';
import './styles-ui4.css';
import './styles-ui5.css';
import './styles-ui6.css';

function Ui6Router({ access, path, navigate }) {
  const clientId = path.match(/^\/clients\/([^/]+)/)?.[1];
  const followupId = path.match(/^\/clients\/[^/]+\/prn-followup\/([^/]+)/)?.[1];
  const medicationPath = path === '/medication/mar' || path === '/medication' || (clientId && (path.endsWith('/medications') || path.endsWith('/mar') || path.endsWith('/prn') || followupId));
  if (medicationPath && !can(access, PERMISSIONS.MAR_VIEW, 'medication') && !can(access, PERMISSIONS.MEDICATION_VIEW, 'medication')) return <AccessDenied onReturn={() => navigate('/nursing/my-shift')} />;
  if (clientId && path.endsWith('/nursing') && !can(access, PERMISSIONS.NURSING_VIEW, 'nursing') && !can(access, PERMISSIONS.RESIDENTIAL_VIEW, 'residential')) return <AccessDenied onReturn={() => navigate('/nursing/my-shift')} />;
  if (clientId && path.endsWith('/nursing') && can(access, PERMISSIONS.RESIDENTIAL_VIEW, 'residential') && !can(access, PERMISSIONS.NURSING_VIEW, 'nursing')) return <ResidentialContext access={access} navigate={navigate} clientId={clientId} />;
  if (path.startsWith('/incidents') && can(access, PERMISSIONS.RESIDENTIAL_VIEW, 'residential')) return <ResidentialIncidentView access={access} navigate={navigate} incidentId={path.split('/')[2]} />;
  if (path === '/facility/bed-board') { if (!can(access, PERMISSIONS.FACILITY_VIEW, 'facility')) return <AccessDenied onReturn={() => navigate('/nursing/my-shift')} />; return <FacilityAssignmentView access={access} />; }
  if (path === '/facility/transfers') { if (!can(access, PERMISSIONS.FACILITY_VIEW, 'facility')) return <AccessDenied onReturn={() => navigate('/nursing/my-shift')} />; return <FacilityTransferView access={access} navigate={navigate} />; }
  if (path === '/facility/leave') { if (!can(access, PERMISSIONS.FACILITY_VIEW, 'facility')) return <AccessDenied onReturn={() => navigate('/nursing/my-shift')} />; return <FacilityLeaveView access={access} navigate={navigate} />; }
  if (clientId && path.endsWith('/medications')) return <MedicationScheduleView access={access} navigate={navigate} clientId={clientId} />;
  if (clientId && (path.endsWith('/prn') || followupId)) return <MedicationPrnView access={access} navigate={navigate} clientId={clientId} followupId={followupId} />;
  if (path === '/medication/mar' || path === '/medication' || (clientId && path.endsWith('/mar'))) return <MedicationMarView access={access} navigate={navigate} clientId={clientId} />;
  return <LegacyUi6Router access={access} path={path} navigate={navigate} />;
}

const icons = { grid: Grid2X2, building: Building2, users: Users, pulse: Activity, sparkles: Sparkles, shield: ShieldCheck, pin: Pin, sliders: Settings2, inbox: FileCheck2, bed: BedDouble, calendar: CalendarDays, check: Check, sun: LayoutDashboard, clipboard: ClipboardList, pill: Package, activity: Activity, arrow: ArrowUpRight, alert: AlertTriangle, wallet: WalletCards, receipt: Receipt, boxes: Boxes, package: Package, bell: Bell };

function Icon({ name, size = 17 }) {
  const Component = icons[name] || Grid2X2;
  return <Component size={size} strokeWidth={1.8} aria-hidden="true" />;
}

function getUi3Title(path) {
  if (path === '/referrals') return 'Referrals';
  if (path === '/referrals/new') return 'New referral';
  if (path.includes('/screening')) return 'Initial screening';
  if (path.includes('/match')) return 'Client matching';
  if (path === '/clients') return 'Clients';
  if (path === '/clients/new') return 'New client';
  if (path.includes('/clients/')) return 'Client workspace';
  if (path.startsWith('/admissions/')) return 'Admission workflow';
  return null;
}

function getUi4Title(path) {
  if (path === '/clinical/work' || path === '/work/clinical') return 'Clinical work';
  if (path === '/mdt' || path === '/work/mdt' || path.startsWith('/mdt/')) return 'MDT';
  if (path.includes('/assessments')) return 'Assessments';
  if (path.includes('/care-team')) return 'Care team';
  if (path.includes('/treatment-plan')) return 'Treatment plan';
  return null;
}

function getUi5Title(path) {
  if (path === '/therapy' || path === '/work/my-day') return 'My day';
  if (path.startsWith('/therapy/sessions')) return 'Therapy sessions';
  if (path.startsWith('/therapy/groups')) return 'Group therapy';
  if (path.startsWith('/therapy/family')) return 'Family therapy';
  if (path.startsWith('/assessments/standardized')) return 'Standardized assessments';
  if (path.includes('/assessments')) return 'Assessment history';
  return null;
}

function getUi6Title(path) {
  if (path.includes('/nursing')) return 'Nursing';
  if (path.includes('/medication') || path.includes('/mar')) return 'Medication / MAR';
  if (path.includes('/residential')) return 'Residential care';
  if (path.includes('/handover')) return 'Shift handover';
  if (path.includes('/facility')) return 'Facility / beds';
  if (path.includes('/incidents')) return 'Residential incidents';
  return null;
}

function getHomeCareTitle(path) {
  if (path.includes('/enrollments')) return 'Home Care enrollment';
  if (path.includes('/visits')) return 'Home Care visits';
  if (path.includes('/caregivers')) return 'Caregiver coverage';
  if (path.includes('/escalations')) return 'Home Care escalations';
  return 'Home Care control centre';
}

function getUi8Title(path) {
  if (path.startsWith('/nutrition')) return 'Nutrition';
  if (path.startsWith('/family')) return 'Family & caregivers';
  if (path.startsWith('/telehealth')) return 'Telehealth';
  if (path.startsWith('/discharge')) return 'Discharge';
  if (path.startsWith('/aftercare')) return 'Aftercare';
  return 'Extended care continuum';
}

function getUi9Title(path) {
  if (path.startsWith('/billing')) return 'Billing';
  return 'Inventory';
}
function getUi10Title(path) { if (path.startsWith('/documents')) return 'Documents'; if (path.startsWith('/consent')) return 'Consent'; if (path.startsWith('/compliance')) return 'Compliance'; if (path.startsWith('/audit')) return 'Audit'; if (path.startsWith('/reports')) return 'Reports'; return 'Analytics'; }

function PageState({ title, detail, action, onAction, tone = 'neutral' }) {
  return <section className={`pageState ${tone}`}>
    <div className="stateIcon"><AlertTriangle size={22} /></div>
    <div><h2>{title}</h2><p>{detail}</p></div>
    {action && <button className="primary" onClick={onAction}>{action}<ArrowUpRight size={16} /></button>}
  </section>;
}

function AccessDenied({ onReturn }) {
  return <PageState tone="amber" title="Access restricted" detail="This workspace or record is outside the permissions and scope of the current persona." action="Return to workspace" onAction={onReturn} />;
}

function SessionRouteDenied({ navigate }) {
  return <main className="pageCanvas"><PageState tone="amber" title="Access restricted" detail="This route requires an active staff session. Client Portal sessions cannot access staff workspaces." action="Return to Client Portal" onAction={() => navigate('/portal')} /></main>;
}

function MetricCard({ label, value, detail, tone = 'teal' }) {
  return <article className={`metricCard ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function WorkQueue({ items, title = 'Attention required' }) {
  const navigate = useNavigate();
  return <section className="panel queue"><div className="panelHeader"><div><span className="kicker">Live queue</span><h2>{title}</h2></div><button className="textButton">View all <ArrowUpRight size={15} /></button></div><div className="queueList">{items.map(item => <button className="queueItem" key={item.id || item.title} onClick={() => navigate(item.href || '#')}><span className={`queueDot ${item.tone || 'blue'}`} /><span><b>{item.title}</b><small>{item.detail || item.owner}</small></span><ArrowUpRight size={15} /></button>)}</div></section>;
}

function TasksPanel({ access }) {
  const tasks = getVisibleTasks(access);
  return <section className="panel"><div className="panelHeader"><div><span className="kicker">Scoped workload</span><h2>My tasks</h2></div><span className="countBadge">{tasks.length}</span></div><div className="taskList">{tasks.map(task => <div className="taskItem" key={task.id}><div className="taskCheck"><Check size={14} /></div><div><b>{task.title}</b><small>{task.owner} · {task.due}</small></div><em>{task.status}</em></div>)}</div></section>;
}

function WorkspaceOverview({ access }) {
  const navigate = useNavigate();
  const isHomeCare = access.workspace === WORKSPACES.HOME_CARE_OPERATIONS;
  const isNursing = access.workspace === WORKSPACES.NURSING_WORKSPACE;
  const isPlatform = access.workspace === WORKSPACES.PLATFORM_OPERATIONS;
  const isAdmin = access.workspace === WORKSPACES.TENANT_ADMINISTRATION;
  const isBilling = access.workspace === WORKSPACES.BILLING_OPERATIONS;
  const metrics = isHomeCare ? [['Visits today', '28', '4 need attention'], ['Unassigned', '3', 'Dispatch now'], ['Late visits', '2', 'Review route'], ['Caregivers', '16', 'Available today']]
    : isNursing ? [['Assigned clients', '18', '3 observations due'], ['Medication due', '12', 'Next round 12:00'], ['Handover items', '5', 'Review before shift'], ['Incidents', '1', 'Needs follow-up']]
      : isPlatform ? [['Active tenants', '42', '2 onboarding'], ['Platform health', '99.8%', 'Within target'], ['Open support cases', '7', '2 urgent'], ['AI reviews', '14', 'Governance queue']]
        : isAdmin ? [['Users', '128', '6 invitations'], ['Locations', '4', 'All operational'], ['Modules enabled', '9', '1 pending review'], ['Audit events', '24', 'Today']]
          : isBilling ? [['Open accounts', '84', '12 need review'], ['Pending invoices', '17', 'Due this week'], ['Payment holds', '3', 'Action required'], ['Cleared today', '9', 'Healthy']]
            : [['Clients today', '248', '12 need attention'], ['Pending tasks', '17', 'Needs review'], ['Alerts', '3', 'Action required'], ['Documentation', '98.7%', 'Healthy']];
  const quick = isHomeCare ? [['Open control centre', '/home-care/control-centre'], ['Review visits', '/home-care/visits']] : isNursing ? [['Open my shift', '/nursing/shift'], ['Review handover', '/nursing/handover']] : isPlatform ? [['Open organizations', '/platform/organizations'], ['Review AI governance', '/platform/ai-governance']] : [['Open my day', '/work/my-day'], ['Open clients', '/work/clients']];
  return <>
    <div className="metrics">{metrics.map(([label, value, detail], index) => <MetricCard key={label} label={label} value={value} detail={detail} tone={['teal', 'blue', 'amber', 'purple'][index]} />)}</div>
    <div className="dashboardGrid"><WorkQueue items={attentionItems} /><TasksPanel access={access} /><section className="panel quickPanel"><div className="panelHeader"><div><span className="kicker">Next best action</span><h2>Quick actions</h2></div></div>{quick.map(([label, href]) => <button className="quickAction" key={href} onClick={() => navigate(href)}>{label}<ArrowUpRight size={16} /></button>)}<div className="privacyNote"><ShieldCheck size={16} /><span>Data shown is scoped to <b>{access.location}</b> and the permissions of this workspace.</span></div></section></div>
  </>;
}

function AiWorkspace() {
  return <div className="aiQueue"><div className="aiHero"><div className="aiMark"><Sparkles size={24} /></div><div><span className="kicker">Human-reviewed intelligence</span><h2>AI Intelligence</h2><p>Assistance appears here as a review queue. Clinical responsibility stays with the authorized user.</p></div><span className="demoTag">DEMO DATA</span></div><div className="metrics"><MetricCard label="Pending reviews" value="6" detail="Human review required" tone="purple" /><MetricCard label="Recent assistance" value="18" detail="Last 7 days" tone="blue" /><MetricCard label="Reported issues" value="1" detail="Needs triage" tone="amber" /></div><WorkQueue items={attentionItems.filter(item => item.tone === 'purple' || item.tone === 'amber')} title="Review queue" /></div>;
}

function LegacyState({ path, onReturn }) {
  return <PageState tone="blue" title="Workflow not implemented in UI Phase 1" detail={`The legacy route ${path} remains available for traceability, but this workflow will be rebuilt as a contextual workspace in a later UI phase.`} action="Return to workspace" onAction={onReturn} />;
}

function SearchPanel({ onClose, access }) {
  const navigate = useNavigate();
  const results = getSearchResults(access);
  return <div className="overlay" onClick={onClose}><section className="searchPanel" onClick={event => event.stopPropagation()}><div className="searchPanelHeader"><div><span className="kicker">Scoped workspace search</span><h2>Search workspace</h2></div><button className="iconButton" onClick={onClose} aria-label="Close search"><X size={18} /></button></div><div className="searchInput"><Search size={18} /><input autoFocus placeholder="Clients, tasks, admissions, documents..." /></div><div className="searchResults">{results.map(result => <button key={result.id} onClick={() => { onClose(); navigate(result.href); }}><span className="resultType">{result.type}</span><span><b>{result.label}</b><small>{result.detail}</small></span><ArrowUpRight size={16} /></button>)}</div>{!results.length && <div className="privacyNote">No records are available in the current permission and location scope.</div>}<div className="searchFooter">Mock adapter · results filtered by permission, module and location scope.</div></section></div>;
}

function TaskQueue({ access, navigate }) {
  const tasks = getVisibleTasks(access);
  return <section className="panel"><div className="panelHeader"><div><span className="kicker">Global TaskService</span><h2>Scoped task queue</h2></div><span className="countBadge">{tasks.length}</span></div>{tasks.map(task => <button className="quickAction" key={task.id} onClick={() => navigate(task.destinationRoute)}><span><b>{task.title}</b><small>{task.sourceModule} · {task.owner} · {task.due} · {task.status}{task.completedBy ? ` · ${task.completedBy} · ${task.completedAt}` : ''}</small></span><ArrowUpRight size={15} /></button>)}</section>;
}

function workspaceRouteAllowed(access, path) {
  if (path === '/register') return true;
  if (path === '/portal/login' || path === '/portal' || path.startsWith('/portal/')) return true;
  if (path.startsWith('/admission-documents/')) return [WORKSPACES.CENTRE_OPERATIONS, WORKSPACES.TENANT_ADMINISTRATION].includes(access.workspace);
  if (path === '/subscription/checkout' && access.workspace === 'TENANT_ONBOARDING') return true;
  if (path.startsWith('/super-admin/')) return access.workspace === WORKSPACES.PLATFORM_OPERATIONS;
  if (path.startsWith('/settings/subscription') || path.startsWith('/settings/facilities') || path.startsWith('/subscription/checkout')) return access.workspace === WORKSPACES.TENANT_ADMINISTRATION;
  if (path.startsWith('/platform/')) return access.workspace === WORKSPACES.PLATFORM_OPERATIONS;
  if (path.startsWith('/admin/configuration')) return [WORKSPACES.TENANT_ADMINISTRATION, WORKSPACES.CENTRE_OPERATIONS].includes(access.workspace);
  if (path.startsWith('/admin/')) return access.workspace === WORKSPACES.TENANT_ADMINISTRATION;
  if (path.startsWith('/nursing/')) return access.workspace === WORKSPACES.NURSING_WORKSPACE;
  if (path.startsWith('/residential/')) return access.workspace === WORKSPACES.RESIDENTIAL_WORKSPACE;
  if (path.startsWith('/home-care/')) return [WORKSPACES.HOME_CARE_OPERATIONS, WORKSPACES.CENTRE_OPERATIONS, WORKSPACES.TENANT_ADMINISTRATION].includes(access.workspace);
  if (path.startsWith('/ui8') || path.startsWith('/nutrition/') || path.startsWith('/family/') || path.startsWith('/telehealth/') || path.startsWith('/discharge/') || path.startsWith('/aftercare/')) return [WORKSPACES.CLINICIAN_WORKSPACE, WORKSPACES.CENTRE_OPERATIONS].includes(access.workspace);
  if (path.startsWith('/billing/')) return access.workspace === WORKSPACES.BILLING_OPERATIONS;
  if (path.startsWith('/inventory/')) return access.workspace === WORKSPACES.INVENTORY_OPERATIONS;
  if (path.startsWith('/ai/')) return access.workspace === WORKSPACES.CLINICIAN_WORKSPACE;
  if (path.startsWith('/documents/') || path.startsWith('/consent/') || path.startsWith('/compliance/') || path.startsWith('/audit/') || path.startsWith('/analytics/') || path.startsWith('/reports/')) return [WORKSPACES.CLINICIAN_WORKSPACE, WORKSPACES.TENANT_ADMINISTRATION, WORKSPACES.COMPLIANCE_OPERATIONS].includes(access.workspace);
  if (['/work/centre-overview', '/work/admissions', '/work/discharges', '/work/occupancy', '/work/schedule', '/work/staff-assignments', '/work/home-care-visits', '/work/operational-alerts', '/work/reports'].includes(path)) return access.workspace === WORKSPACES.CENTRE_OPERATIONS;
  return true;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  useUi14Store();
  const [profileId, setProfileId] = useState(() => sessionStorage.getItem('medixpro-profile') || 'clinician');
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window === 'undefined' || window.innerWidth > 900);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawer, setDrawer] = useState(null);
  const baseAccess = getAccessProfile(profileId);
  const access = location.pathname === '/subscription/checkout' && hasValidOnboardingContext('/subscription/checkout') ? getOnboardingAccess(baseAccess) : getActiveTenantAccess(baseAccess);
  useCrossCuttingStore();
  const navigation = useMemo(() => getEffectiveNavigation(access), [access]);
  const current = navigation.find(item => item.href === location.pathname) || navigation[0];
  const workspaceLabel = getWorkspaceLabel(access.workspace);
  const isLegacy = location.pathname.startsWith('/screens/');
  const isUi3Route = location.pathname.startsWith('/referrals') || location.pathname.startsWith('/clients') || location.pathname.startsWith('/admissions');
  const isUi4Route = location.pathname === '/clinical/work' || location.pathname === '/work/clinical' || location.pathname === '/mdt' || location.pathname === '/work/mdt' || location.pathname.startsWith('/mdt/') || /\/clients\/[^/]+\/(assessments|care-team|treatment-plan)/.test(location.pathname);
  const isUi5Route = location.pathname === '/therapy' || location.pathname === '/work/my-day' || location.pathname.startsWith('/therapy/') || location.pathname.startsWith('/assessments/standardized') || /\/clients\/[^/]+\/(assessments\/standardized|sessions)/.test(location.pathname);
  const isUi6Route = location.pathname === '/nursing/my-shift' || location.pathname === '/nursing/shift' || location.pathname.startsWith('/nursing/') || location.pathname.startsWith('/medication') || location.pathname.startsWith('/residential/') || location.pathname.startsWith('/handover') || location.pathname.startsWith('/facility') || location.pathname.startsWith('/incidents') || /\/clients\/[^/]+\/(nursing|medications|mar|prn|prn-followup|residential)/.test(location.pathname);
  const isUi7Route = location.pathname.startsWith('/home-care/');
  const isUi8Route = location.pathname.startsWith('/ui8') || location.pathname.startsWith('/nutrition/') || location.pathname.startsWith('/family/') || location.pathname.startsWith('/telehealth/') || location.pathname.startsWith('/discharge/') || location.pathname.startsWith('/aftercare/');
  const isUi9Route = location.pathname.startsWith('/billing/') || location.pathname.startsWith('/inventory/');
  const isUi10Route = location.pathname.startsWith('/documents/') || location.pathname.startsWith('/consent/') || location.pathname.startsWith('/compliance/') || location.pathname.startsWith('/audit/') || location.pathname.startsWith('/analytics/') || location.pathname.startsWith('/reports/');
  const isUi11Route = location.pathname.startsWith('/ai/');
  const isUi12Route = location.pathname.startsWith('/admin/configuration');
  const isUi13Route = location.pathname === '/register' || location.pathname.startsWith('/super-admin/') || location.pathname.startsWith('/settings/subscription') || location.pathname.startsWith('/settings/facilities') || location.pathname.startsWith('/subscription/checkout');
  const isUi14Route = location.pathname === '/portal/login' || location.pathname === '/portal' || location.pathname.startsWith('/portal/') || location.pathname.startsWith('/admission-documents/');
  const isPortalRoute = location.pathname === '/portal' || location.pathname.startsWith('/portal/');
  const isPortalLoginRoute = location.pathname === '/portal/login';
  const pageLabel = isUi14Route ? 'Client Portal' : isUi13Route ? 'SaaS subscription' : isUi12Route ? 'Configuration Centre' : isUi11Route ? 'AI Assistant' : isUi10Route ? getUi10Title(location.pathname) : isUi9Route ? getUi9Title(location.pathname) : isUi8Route ? getUi8Title(location.pathname) : isUi7Route ? getHomeCareTitle(location.pathname) : getUi6Title(location.pathname) || getUi5Title(location.pathname) || getUi4Title(location.pathname) || getUi3Title(location.pathname) || current?.label || workspaceLabel;
  const activeNavigation = isUi3Route ? navigation.find(item => (location.pathname.startsWith('/referrals') && item.id === 'referrals') || (location.pathname.startsWith('/clients') && item.id === 'clients') || (location.pathname.startsWith('/admissions') && item.id === 'admissions')) || current : current;
  const isAdminRoute = location.pathname === '/register' || location.pathname.startsWith('/super-admin/') || location.pathname.startsWith('/settings/subscription') || location.pathname.startsWith('/settings/facilities') || location.pathname.startsWith('/subscription/checkout') || location.pathname.startsWith('/platform/') || location.pathname.startsWith('/admin/') || (location.pathname.startsWith('/work/') && !['/work/my-day', '/work/clients', '/work/clinical', '/work/mdt', '/work/ai-intelligence', '/work/tasks'].includes(location.pathname));
  const sessionMode = getSessionMode();

  const switchProfile = event => {
    const next = event.target.value;
    activateStaffSession();
    setProfileId(next);
    sessionStorage.setItem('medixpro-profile', next);
    const profile = getAccessProfile(next);
    const first = getEffectiveNavigation(profile)[0];
    navigate(first.href);
  };

  if (sessionMode === SESSION_MODES.PORTAL) return isPortalRoute ? <Ui14Router access={null} path={location.pathname} navigate={navigate} /> : <SessionRouteDenied navigate={navigate} />;
  if (sessionMode === SESSION_MODES.ANONYMOUS) return isPortalLoginRoute ? <Ui14Router access={null} path={location.pathname} navigate={navigate} /> : <SessionRouteDenied navigate={navigate} />;
  if (sessionMode === SESSION_MODES.STAFF && isPortalRoute) return isPortalLoginRoute ? <Ui14Router access={null} path={location.pathname} navigate={navigate} /> : <SessionRouteDenied navigate={navigate} />;
  return <div className={`appShell ${sidebarOpen ? '' : 'sidebarCollapsed'}`}>
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand"><div className="brandGlyph">M</div><div><strong>MedixPro360</strong><span>REHABILITATION PLATFORM</span></div><button className="iconButton sidebarToggle" onClick={() => setSidebarOpen(false)} aria-label="Collapse navigation"><X size={17} /></button></div>
      <div className="workspaceSwitcher"><span className="fieldLabel">Effective workspace</span><div className="workspaceName"><Icon name="grid" /><b>{workspaceLabel}</b></div></div>
      <nav className="navList">{navigation.map(item => <button key={item.id} className={`navItem ${activeNavigation?.id === item.id ? 'active' : ''}`} onClick={() => navigate(item.href)}><Icon name={item.icon} /><span>{item.label}</span>{item.id === 'clinician-ai' && <span className="navBadge">6</span>}</button>)}</nav>
      <div className="sidebarFooter"><div className="scopeLine"><Pin size={14} /><span>{access.location}</span></div><span className="demoTag">DEMO ACCESS</span></div>
    </aside>
    {!sidebarOpen && <button className="expandButton" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>}
    <main className="mainArea">
      <header className="topbar"><div className="contextBlock"><span className="contextEyebrow">TENANT CONTEXT</span><strong>{access.tenant}</strong><span>{access.location}</span></div><div className="topbarActions"><button className="searchTrigger" aria-label="Search workspace" onClick={() => setSearchOpen(true)}><Search size={17} /><span>Search workspace</span><kbd>⌘ K</kbd></button><button className="topIcon" onClick={() => setDrawer('tasks')} aria-label="Open tasks"><ClipboardList size={19} /><span className="indicator">3</span></button><button className="topIcon" onClick={() => setDrawer('notifications')} aria-label="Open notifications"><Bell size={19} /><span className="indicator red">3</span></button><div className="profileBlock"><UserCircle2 size={25} /><div><b>{access.label}</b><span>Demo access</span></div><ChevronDown size={15} /></div></div></header>
      <div className="demoBar"><span><Sparkles size={14} /> Development-only persona switcher</span><select value={profileId} onChange={switchProfile} aria-label="Choose demo effective access profile">{Object.entries(demoProfiles).map(([id, profile]) => <option key={id} value={id}>{profile.label}</option>)}</select></div>
      <section className="pageCanvas"><div className="breadcrumbs"><span>MedixPro360 Rehab</span><span>/</span><b>{workspaceLabel}</b><span>/</span><b>{pageLabel}</b></div><div className="pageHeader"><div><span className="kicker">{access.location}</span><h1>{pageLabel}</h1><p>{isLegacy ? 'Legacy route retained for migration traceability.' : 'Your operational view is scoped to effective access, module entitlement and current location.'}</p></div><div className="pageActions"><button className="secondaryButton" onClick={() => setDrawer('notifications')}><Bell size={16} /> Alerts <span className="buttonCount">{getVisibleNotifications(access).length}</span></button><button className="primary" onClick={() => setDrawer('tasks')}><ClipboardList size={16} /> My tasks</button></div></div>{isLegacy ? <LegacyState path={location.pathname} onReturn={() => navigate(current.href)} /> : !workspaceRouteAllowed(access, location.pathname) ? <AccessDenied onReturn={() => navigate(current.href)} /> : isUi14Route ? <Ui14Router access={access} path={location.pathname} navigate={navigate} /> : location.pathname === '/work/tasks' ? <TaskQueue access={access} navigate={navigate} /> : isUi11Route ? <Ui11Router access={access} path={location.pathname} navigate={navigate} /> : isUi10Route ? <Ui10Router access={access} path={location.pathname} navigate={navigate} /> : isUi9Route ? <Ui9Router access={access} path={location.pathname} navigate={navigate} /> : isUi8Route ? <Ui8Router access={access} path={location.pathname} navigate={navigate} /> : isUi7Route ? <HomeCareRouter access={access} path={location.pathname} navigate={navigate} /> : isUi6Route ? <Ui6Router access={access} path={location.pathname} navigate={navigate} /> : isUi5Route ? <Ui5Router access={access} path={location.pathname} navigate={navigate} /> : isUi4Route ? <Ui4Router access={access} path={location.pathname} navigate={navigate} /> : isUi3Route ? <Ui3Router access={access} path={location.pathname} navigate={navigate} /> : isAdminRoute ? <AdminOverview access={access} path={location.pathname} navigate={navigate} /> : location.pathname.endsWith('ai-intelligence') ? <AiWorkspace /> : <WorkspaceOverview access={access} />}</section>
    </main>
    {drawer && <aside className="rightDrawer" aria-label={drawer === 'tasks' ? 'Tasks' : 'Notifications'}><div className="drawerHeader"><div><span className="kicker">Scoped workspace queue</span><h2>{drawer === 'tasks' ? 'My tasks' : 'Notifications'}</h2></div><button className="iconButton" onClick={() => setDrawer(null)} aria-label="Close drawer"><X size={18} /></button></div>{drawer === 'tasks' ? <div className="drawerList">{getVisibleTasks(access).map(item => <button className="drawerItem" key={item.id} onClick={() => { setDrawer(null); navigate(item.destinationRoute); }}><div className="taskCheck"><Check size={14} /></div><div><b>{item.title}</b><small>{item.owner} · {item.due}</small></div></button>)}</div> : <div className="drawerList">{getVisibleNotifications(access).map(item => <button className="drawerItem notification" key={item.id} onClick={() => { setDrawer(null); navigate(item.destinationRoute); }}><span className="queueDot blue" /><div><b>{item.title}</b><small>{item.detail}</small></div></button>)}</div>}<button className="drawerLink" onClick={() => { setDrawer(null); navigate('/work/tasks'); }}>Open full queue <ArrowUpRight size={16} /></button></aside>}
    {searchOpen && <SearchPanel access={access} onClose={() => setSearchOpen(false)} />}
  </div>;
}

const root = globalThis.__medixproRoot || createRoot(document.getElementById('root'));
globalThis.__medixproRoot = root;
root.render(<BrowserRouter><App /></BrowserRouter>);
