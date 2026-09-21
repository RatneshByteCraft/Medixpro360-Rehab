import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { can, PERMISSIONS } from './access.js';
import { addResidentialNote, completeCheck, useUi6Store } from './ui6Store.js';

function Badge({ children }) { return <span className="statusChip">{children}</span>; }

export function ResidentialContext({ access, navigate, clientId }) {
  const { residents, checks, residentialNotes = [] } = useUi6Store();
  const resident = residents.find(item => item.id === clientId) || residents[0];
  const [note, setNote] = useState('');
  const canDocument = can(access, PERMISSIONS.RESIDENTIAL_DOCUMENT, 'residential');
  const residentChecks = checks.filter(item => item.clientId === resident.id);
  return <>
    <div className="adminHeader"><div><span className="kicker">Residential workspace</span><h2>{resident.name}</h2><p>{resident.location} · {resident.room} · Bed {resident.bed} · Active admission</p></div><div className="pageActions"><button className="secondaryButton" onClick={() => navigate('/residential/my-shift')}><ArrowLeft size={16} /> My shift</button><button className="secondaryButton" onClick={() => navigate(`/incidents?client=${resident.id}`)}>Incidents <ArrowRight size={15} /></button></div></div>
    <div className="ui6Grid"><main>
      <section className="panel"><div className="panelHeader"><div><span className="kicker">Residential care</span><h2>Checks and notes</h2></div></div>{residentChecks.map(item => <div className="moduleRow" key={item.id}><span><b>{item.category}</b><small>Due {item.due} · {item.note || 'No note'}</small></span><button className="secondaryButton" disabled={!canDocument || item.status === 'Completed'} onClick={() => completeCheck(item.id, 'Completed during shift.')}>{item.status === 'Completed' ? 'Completed' : 'Complete'}</button></div>)}<label>Residential note<textarea aria-label="Residential note" disabled={!canDocument} value={note} onChange={event => setNote(event.target.value)} placeholder="Structured wellbeing, participation, sleep or care note" /></label><button className="primary" disabled={!canDocument || !note.trim()} onClick={() => { addResidentialNote(resident.id, { category: 'General wellbeing', observation: note }); setNote(''); }}>Save residential note <Check size={16} /></button>{residentialNotes.filter(item => item.clientId === resident.id).map(item => <div className="moduleRow" key={item.id}><span><b>{item.category}</b><small>{item.observation} · Recorded by {item.recordedBy} · {item.recordedAt}</small></span><Badge>{item.status}</Badge></div>)}</section>
    </main><aside className="panel"><div className="panelHeader"><div><span className="kicker">Canonical context</span><h2>Safety context</h2></div></div><div className="privacyNote">Risk indicator: {resident.risk}</div><div className="privacyNote">Resident identity and operational safety context only.</div></aside></div>
  </>;
}
