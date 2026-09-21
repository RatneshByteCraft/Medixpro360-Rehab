import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { can, isLocationAllowed, PERMISSIONS } from './access.js';
import { activateMedicationOrder, addMedicationOrder, correctMar, createPrnAdministration, discontinueMedicationOrder, getMedicationSchedule, recordMar, recordMedicationTimeline, recordPrnFollowup, useUi6Store } from './ui6Store.js';

function Badge({ children }) {
  return <span className="statusChip">{children}</span>;
}

function Header({ title, detail, navigate, clientId }) {
  return <div className="adminHeader">
    <div><span className="kicker">Clinical medication</span><h2>{title}</h2><p>{detail}</p></div>
    <div className="pageActions">{clientId && <button className="secondaryButton" onClick={() => navigate(`/clients/${clientId}/medications`)}>Medication schedule</button>}<button className="secondaryButton" onClick={() => navigate('/nursing/my-shift')}><ArrowLeft size={16} /> My shift</button></div>
  </div>;
}

export function MedicationScheduleView({ access, navigate, clientId }) {
  const { medicationOrders, residents } = useUi6Store();
  const resident = residents.find(item => item.id === clientId) || residents[0];
  const orders = medicationOrders.filter(order => order.clientId === resident.id && isLocationAllowed(access, resident.location));
  const schedule = getMedicationSchedule(resident.id);
  const canOrder = can(access, PERMISSIONS.MEDICATION_ORDER, 'medication');
  const canDiscontinue = can(access, PERMISSIONS.MEDICATION_DISCONTINUE, 'medication');
  const [medication, setMedication] = useState('');
  const [dose, setDose] = useState('');

  return <>
    <Header title="Medication schedule" detail="Scheduled administrations are derived from active medication orders." navigate={navigate} />
    {canOrder && <section className="panel"><div className="panelHeader"><div><span className="kicker">Prescriber workflow</span><h2>New medication order</h2></div></div><div className="formGrid"><label>Medication<input value={medication} onChange={event => setMedication(event.target.value)} placeholder="Medication name" /></label><label>Dose<input value={dose} onChange={event => setDose(event.target.value)} placeholder="Dose and strength" /></label><button className="primary" disabled={!medication || !dose} onClick={() => { addMedicationOrder({ clientId: resident.id, medication, dose, strength: dose, route: 'Oral', frequency: 'Once daily', schedule: '09:00', startDate: '20 Sep 2026', prn: false }); setMedication(''); setDose(''); }}>Create draft order</button></div></section>}
    <section className="panel">
      <div className="panelHeader"><div><span className="kicker">Medication order context</span><h2>{resident.name}</h2></div><Badge>{resident.allergies}</Badge></div>
      {orders.map(order => <div className="moduleRow" key={order.id}>
        <span><b>{order.medication} {order.strength} - {order.dose} {order.route}</b><small>Order {order.id} - {order.frequency} - Start {order.startDate} - End {order.endDate || 'No end date'} - {order.prn ? 'PRN' : 'Scheduled'} - Prescriber {order.prescriber}</small></span>
        <div className="pageActions"><Badge>{order.status}</Badge>{order.prn && order.status === 'Active' && <button className="secondaryButton" onClick={() => navigate(`/clients/${resident.id}/prn`)}>Open PRN</button>}{order.status === 'Draft' && canOrder && <button className="secondaryButton" onClick={() => activateMedicationOrder(order.id)}>Activate</button>}{order.status === 'Active' && canDiscontinue && <button className="secondaryButton" onClick={() => discontinueMedicationOrder(order.id, 'Order replaced')}>Discontinue</button>}</div>
      </div>)}
    </section>
    <section className="panel">
      <div className="panelHeader"><div><span className="kicker">Derived administrations</span><h2>Medication schedule</h2></div><Badge>{schedule.length} entries</Badge></div>
      {schedule.length ? schedule.map(entry => <div className="moduleRow" key={entry.scheduleEntryId}>
        <span><b>{entry.scheduledTime} - {entry.medication} {entry.dose}</b><small>{entry.route} - {entry.frequency} - Order {entry.medicationOrderId} - {entry.orderStatus}</small></span>
        <div className="pageActions"><Badge>{entry.administrationStatus}</Badge><button className="secondaryButton" onClick={() => navigate(`/clients/${resident.id}/mar`)}>Open MAR <ArrowRight size={15} /></button></div>
      </div>) : <p className="panelCopy">No normally administrable schedule entries. Draft, PRN, and discontinued orders do not create routine scheduled administrations.</p>}
    </section>
  </>;
}

export function MedicationMarView({ access, navigate, clientId }) {
  const { mar, medicationOrders, residents, prnFollowups = [] } = useUi6Store();
  const [confirmId, setConfirmId] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [reason, setReason] = useState('');
  const [validation, setValidation] = useState('');
  const [correctionId, setCorrectionId] = useState(null);
  const [correctionValue, setCorrectionValue] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const canAdmin = can(access, PERMISSIONS.MAR_ADMINISTER, 'medication');
  const canCorrect = can(access, PERMISSIONS.MAR_CORRECT, 'medication');
  const rows = mar.filter(item => (!clientId || item.clientId === clientId) && isLocationAllowed(access, residents.find(resident => resident.id === item.clientId)?.location));

  return <>
    <Header title="Medication administration record" detail="Review the derived schedule entry before confirming the clinical administration." navigate={navigate} clientId={clientId} />
    <section className="panel">
      <div className="panelHeader"><div><span className="kicker">MAR review</span><h2>Scheduled administrations</h2></div><Badge>{rows.length} records</Badge></div>
      {rows.map(item => {
        const order = medicationOrders.find(orderItem => orderItem.id === item.orderId);
        const resident = residents.find(residentItem => residentItem.id === item.clientId);
        const finalized = ['Administered', 'Refused', 'Withheld', 'Omitted', 'Client Away'].includes(item.status);
        const confirming = confirmId === item.id;
        return <div className="moduleRow medicationMarRow" key={item.id}>
          <span>
            <b>{resident?.name} - {order?.medication} {item.dose}</b>
            <small>Order {item.orderId} - Schedule {item.scheduleEntryId || 'Not linked'} - {item.route} - {order?.frequency} - Scheduled {item.scheduledTime}</small>
            <small>Prescriber {order?.prescriber} - {resident?.allergies}</small>
            {order?.prn && <small>PRN indication {item.reason} - {prnFollowups.find(followup => followup.marId === item.id)?.status || 'No follow-up yet'}</small>}
            {finalized && item.status === 'Administered' && <small>Actual {item.actualTime} - Administered by {item.administeredBy} - Dose {item.dose} - Route {item.route}</small>}
            {finalized && item.status !== 'Administered' && <small>Reason {item.reason} - Recorded by Nisha Verma - Recorded at Just now - Outcome {item.status}</small>}
            {(item.corrections || []).map(correction => <small key={correction.id}>Correction: {correction.corrected?.status || correction.corrected?.value} - {correction.reason} - {correction.correctedBy} - {correction.correctedAt}</small>)}
          </span>
          <div className="pageActions">
              {finalized ? <><Badge>Finalized - {item.status}</Badge>{canCorrect && <button className="secondaryButton" onClick={() => { setCorrectionId(item.id); setCorrectionValue(item.status); }}>Correction</button>}</> : confirming ? <><button className="primary" onClick={() => { if (outcome !== 'Administered' && !reason.trim()) { setValidation('A reason is required before finalizing this exception.'); return; } recordMar(item.id, outcome || 'Administered', outcome === 'Administered' ? {} : { reason }); recordMedicationTimeline(item.clientId, `${order?.medication} ${item.dose} - ${outcome || 'Administered'}`, item.id); setConfirmId(null); setOutcome(''); setReason(''); setValidation(''); }}>Confirm and finalize {outcome === 'Administered' ? 'administration' : 'exception'} <Check size={15} /></button><button className="secondaryButton" onClick={() => { setConfirmId(null); setOutcome(''); setReason(''); setValidation(''); }}>Cancel</button></> : <div className="pageActions"><button className="primary" disabled={!canAdmin} onClick={() => { setOutcome('Administered'); setConfirmId(item.id); }}>Administer <ArrowRight size={15} /></button><button className="secondaryButton" disabled={!canAdmin} onClick={() => { setOutcome('Refused'); setConfirmId(item.id); }}>Refused</button><button className="secondaryButton" disabled={!canAdmin} onClick={() => { setOutcome('Withheld'); setConfirmId(item.id); }}>Withheld</button></div>}
          </div>
          {confirming && <div className="formGrid"><label>Exception outcome<select aria-label="Exception outcome" value={outcome} onChange={event => { setOutcome(event.target.value); setValidation(''); }}><option value="Administered">Administered</option><option value="Refused">Refused</option><option value="Withheld">Withheld</option><option value="Omitted">Omitted</option><option value="Client Away">Client Away</option></select></label><label>Reason / context<input aria-label="Exception reason" value={reason} onChange={event => { setReason(event.target.value); setValidation(''); }} placeholder="Required for exception outcomes" /></label>{validation && <div role="alert" className="privacyNote">{validation}</div>}<div className="privacyNote"><ShieldCheck size={16} /> Confirm {resident?.name}, {order?.medication}, {item.dose}, {item.route}, scheduled {item.scheduledTime}, outcome {outcome}, reason {reason || 'required'}, recorded by Nisha Verma.</div></div>}
          {correctionId === item.id && <div className="formGrid"><label>Corrected outcome<input value={correctionValue} onChange={event => setCorrectionValue(event.target.value)} /></label><label>Correction reason<input value={correctionReason} onChange={event => setCorrectionReason(event.target.value)} /></label><button className="primary" disabled={!correctionValue || !correctionReason} onClick={() => { correctMar(item.id, correctionReason, { status: correctionValue }); setCorrectionId(null); setCorrectionReason(''); }}>Finalize correction</button></div>}
        </div>;
      })}
    </section>
    <section className="panel"><div className="privacyNote"><ShieldCheck size={16} /> Allergy indicator is shown. Drug interaction checking is not implemented.</div><span className="fieldLabel">Administration capability: {canAdmin ? 'Available to authorized Nurse' : 'Not granted'} - Correction capability: {canCorrect ? 'Available through controlled correction' : 'Not granted'}</span></section>
  </>;
}
