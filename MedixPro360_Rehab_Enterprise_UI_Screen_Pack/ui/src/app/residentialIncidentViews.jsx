import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { can, PERMISSIONS } from './access.js';
import { createIncident, reviewIncident, updateIncident, useUi6Store } from './ui6Store.js';

function Badge({ children }) { return <span className="statusChip">{children}</span>; }
export function ResidentialIncidentView({ access, navigate, incidentId }) {
  const { residents, incidents } = useUi6Store();
  const [clientId, setClientId] = useState(residents[0]?.id || '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Residential observation');
  const [validation, setValidation] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const canCreate = can(access, PERMISSIONS.INCIDENT_CREATE, 'residential');
  const canReview = can(access, PERMISSIONS.INCIDENT_REVIEW, 'residential');
  const focused = incidentId ? incidents.find(item => item.id === incidentId) : null;
  const visible = focused ? [focused] : incidents.filter(item => !item.location || item.location === 'Residential Unit A');
  return <>
    <div className="adminHeader"><div><span className="kicker">Residential safety</span><h2>{focused ? 'Incident review' : 'Incidents'}</h2><p>Record what occurred, preserve the original report, and route review to an authorized supervisor.</p></div><div className="pageActions"><button className="secondaryButton" onClick={() => navigate('/residential/my-shift')}><ArrowLeft size={16} /> My shift</button></div></div>
    {!focused && <section className="panel"><div className="formGrid"><label>Client<select aria-label="Client" value={clientId} onChange={event => setClientId(event.target.value)}>{residents.map(resident => <option key={resident.id} value={resident.id}>{resident.name}</option>)}</select></label><label>Category<input aria-label="Category" value={category} onChange={event => setCategory(event.target.value)} /></label></div><label>Description<textarea aria-label="Description" value={description} onChange={event => { setDescription(event.target.value); setValidation(''); }} placeholder="Describe the incident and immediate action" /></label>{validation && <div role="alert" className="privacyNote">{validation}</div>}<button className="primary" disabled={!canCreate} onClick={() => { if (!description.trim()) { setValidation('A description is required before submitting the incident.'); return; } createIncident({ clientId, location: 'Residential Unit A', category, description }); setDescription(''); }}>Submit incident <Check size={16} /></button></section>}
    <section className="panel">{visible.map(incident => { const resident = residents.find(item => item.id === incident.clientId); return <div className="moduleRow" key={incident.id}><span><b>{incident.category} · {resident?.name}</b><small>{incident.description} · Reported by {incident.createdBy} · {incident.createdAt}</small>{incident.reviewNotes && <small>Review: {incident.reviewNotes} · Reviewed by {incident.reviewedBy} · {incident.reviewedAt}</small>}</span><div className="pageActions"><Badge>{incident.status}</Badge>{canReview && incident.status === 'Submitted' && <><input aria-label="Review notes" value={reviewNotes} onChange={event => setReviewNotes(event.target.value)} placeholder="Review note" /><button className="secondaryButton" onClick={() => { reviewIncident(incident.id, reviewNotes || 'Supervisor review completed.', 'Under Review'); setReviewNotes(''); }}>Review</button></>}{canReview && incident.status === 'Under Review' && <button className="secondaryButton" onClick={() => updateIncident(incident.id, { status: 'Closed', closedBy: 'Centre supervisor', closedAt: 'Just now', closureNote: reviewNotes || 'Incident closed after review.' })}>Close incident</button>}</div></div>})}{!visible.length && <p className="panelCopy">No residential incidents recorded.</p>}</section>
  </>;
}
