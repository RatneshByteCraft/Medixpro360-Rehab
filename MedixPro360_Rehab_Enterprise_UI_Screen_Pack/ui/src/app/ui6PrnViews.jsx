import React, { useState } from 'react';
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import { can, isLocationAllowed, PERMISSIONS } from './access.js';
import { createPrnAdministration, recordMar, recordPrnFollowup, useUi6Store } from './ui6Store.js';

function Badge({ children }) { return <span className="statusChip">{children}</span>; }
function Header({ navigate, clientId }) { return <div className="adminHeader"><div><span className="kicker">Clinical medication</span><h2>PRN medication</h2><p>Administer only under an active PRN order, then complete the required effectiveness review.</p></div><div className="pageActions"><button className="secondaryButton" onClick={() => navigate(`/clients/${clientId}/medications`)}>Medication schedule</button><button className="secondaryButton" onClick={() => navigate('/nursing/my-shift')}><ArrowLeft size={16} /> My shift</button></div></div>; }

export function MedicationPrnView({ access, navigate, clientId, followupId }) {
  const { medicationOrders, residents, mar, prnFollowups } = useUi6Store();
  const resident = residents.find(item => item.id === clientId) || residents[0];
  const order = medicationOrders.find(item => item.clientId === resident.id && item.prn && item.status === 'Active' && isLocationAllowed(access, resident.location));
  const [reason, setReason] = useState('');
  const [validation, setValidation] = useState('');
  const [pendingId, setPendingId] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [response, setResponse] = useState('Effective');
  const [note, setNote] = useState('');
  const followup = prnFollowups.find(item => item.id === followupId) || prnFollowups.find(item => item.marId === pendingId);
  const entry = mar.find(item => item.id === pendingId) || (followup && mar.find(item => item.id === followup.marId)) || mar.find(item => item.orderId === order?.id && item.status === 'Due');
  const canAdmin = can(access, PERMISSIONS.PRN_ADMINISTER, 'medication') && can(access, PERMISSIONS.MAR_ADMINISTER, 'medication');
  const canReview = can(access, PERMISSIONS.PRN_EFFECTIVENESS, 'medication');
  return <>
    <Header navigate={navigate} clientId={resident.id} />
    <section className="panel"><div className="panelHeader"><div><span className="kicker">Active PRN order</span><h2>{resident.name}</h2></div><Badge>{resident.allergies}</Badge></div>{order ? <><div className="moduleRow"><span><b>{order.medication} {order.dose} - {order.route}</b><small>Order {order.id} - Indication {order.indication} - {order.maxFrequency} - Prescriber {order.prescriber}</small></span><Badge>{order.status} - PRN</Badge></div><label>Clinical indication / reason<input aria-label="PRN indication" value={reason} onChange={event => { setReason(event.target.value); setValidation(''); }} placeholder="Why is this PRN medication needed?" /></label>{validation && <div role="alert" className="privacyNote">{validation}</div>}<button className="primary" disabled={!canAdmin} onClick={() => { if (!reason.trim()) { setValidation('A clinical indication is required before administering PRN.'); return; } setPendingId(createPrnAdministration(order.id, reason)); }}>Administer PRN</button></> : <p className="panelCopy">No active PRN order is available for this resident.</p>}</section>
    {entry && <section className="panel"><div className="panelHeader"><div><span className="kicker">PRN administration</span><h2>{entry.status === 'Due' ? 'Confirm administration' : 'Finalized administration'}</h2></div><Badge>{entry.status}</Badge></div><div className="detailRows"><span>Medication</span><b>{order?.medication}</b><span>Dose / route</span><b>{entry.dose} - {entry.route}</b><span>Indication</span><b>{entry.reason}</b><span>Administration time</span><b>{entry.actualTime || 'Now'}</b></div>{entry.status === 'Due' ? <button className="primary" disabled={!canAdmin} onClick={() => recordMar(entry.id, 'Administered')}>Confirm and finalize PRN <Check size={15} /></button> : <div className="privacyNote"><ShieldCheck size={16} /> Finalized PRN administration is immutable; effectiveness is recorded separately.</div>}</section>}
    {followup && <section className="panel"><div className="panelHeader"><div><span className="kicker">Effectiveness follow-up</span><h2>{followup.status === 'Due' ? 'Review response' : 'Follow-up completed'}</h2></div><Badge>{followup.status}</Badge></div><div className="detailRows"><span>Source PRN administration</span><b>{followup.marId}</b><span>Due</span><b>{followup.due}</b><span>Medication</span><b>{order?.medication} {order?.dose}</b></div>{followup.status === 'Due' && canReview && <>{!reviewing && <button className="primary" onClick={() => setReviewing(true)}>Open effectiveness review</button>}{reviewing && <div className="formGrid"><label>Effectiveness outcome<select aria-label="Effectiveness outcome" value={response} onChange={event => setResponse(event.target.value)}><option>Effective</option><option>Partially Effective</option><option>Not Effective</option></select></label><label>Follow-up response<textarea aria-label="Follow-up response" value={note} onChange={event => setNote(event.target.value)} placeholder="Record response and clinical context" /></label><button className="primary" disabled={!note.trim()} onClick={() => { recordPrnFollowup(followup.marId, response, note); setReviewing(false); }}>Complete follow-up</button></div>}</>}{followup.status === 'Completed' && <div className="privacyNote">Outcome {followup.response} - {followup.note} - Reviewed by {followup.recordedBy} - Reviewed at {followup.recordedAt}</div>}</section>}
  </>;
}
