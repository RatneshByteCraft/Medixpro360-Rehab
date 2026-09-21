import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { can, PERMISSIONS } from './access.js';
import { transferBed, useUi6Store } from './ui6Store.js';

function Badge({ children }) { return <span className="statusChip">{children}</span>; }

export function FacilityTransferView({ access, navigate, clientId }) {
  const { beds, residents, occupancyHistory } = useUi6Store();
  const currentResidents = residents.filter(item => item.location === 'Residential Unit A' && beds.some(bed => bed.clientId === item.id && bed.status === 'Occupied'));
  const [residentId, setResidentId] = useState(currentResidents[0]?.id || clientId || '');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');
  const [validation, setValidation] = useState('');
  const resident = residents.find(item => item.id === residentId) || currentResidents[0] || residents[0];
  const current = beds.find(bed => bed.clientId === resident?.id && bed.status === 'Occupied');
  const canTransfer = can(access, PERMISSIONS.BED_TRANSFER, 'facility');
  const available = beds.filter(bed => bed.status === 'Available' && bed.id !== current?.id);
  const history = occupancyHistory.filter(item => item.clientId === resident?.id);
  const confirm = () => {
    if (!current) return setValidation('An active source occupancy is required.');
    if (!targetId || targetId === current.id) return setValidation('Select a different available destination bed.');
    if (!reason.trim()) return setValidation('A transfer reason is required.');
    if (!transferBed(resident.id, targetId, reason)) return setValidation('The destination bed is no longer available or the source occupancy is stale.');
    setValidation('');
    setTargetId('');
  };
  return <>
    <div className="adminHeader"><div><span className="kicker">Facility operations</span><h2>Internal bed transfer</h2><p>Move one active occupancy to an available bed while preserving the source occupancy history.</p></div><div className="pageActions"><button className="secondaryButton" onClick={() => navigate('/facility/bed-board')}><ArrowLeft size={16} /> Bed board</button></div></div>
    <section className="panel">
      <div className="detailRows"><span>Client</span><b>{resident?.name}</b><span>Admission</span><b>{resident?.admissionId}</b><span>From</span><b>{current?.room} · {current?.bed}</b><span>Status</span><Badge>{current ? 'Occupied' : 'No active occupancy'}</Badge></div>
      <div className="formGrid">
        <label>Current resident<select aria-label="Current resident" disabled={!canTransfer} value={residentId} onChange={event => { setResidentId(event.target.value); setTargetId(''); setValidation(''); }}>{currentResidents.map(item => <option key={item.id} value={item.id}>{item.name} · {item.bed}</option>)}</select></label>
        <label>Destination bed<select aria-label="Destination bed" disabled={!canTransfer || !current} value={targetId} onChange={event => { setTargetId(event.target.value); setValidation(''); }}><option value="">Select available destination</option>{available.map(bed => <option key={bed.id} value={bed.id}>{bed.unit} · {bed.room} · {bed.bed}</option>)}</select></label>
      </div>
      <label>Transfer reason<input aria-label="Transfer reason" disabled={!canTransfer || !current} value={reason} onChange={event => { setReason(event.target.value); setValidation(''); }} placeholder="Reason for transfer" /></label>
      {validation && <div role="alert" className="privacyNote">{validation}</div>}
      <button className="primary" disabled={!canTransfer || !current || !targetId} onClick={confirm}>Confirm bed transfer <Check size={16} /></button>
    </section>
    <section className="panel"><div className="panelHeader"><div><span className="kicker">Occupancy history</span><h2>Historical movement</h2></div></div>{history.map(item => <div className="moduleRow" key={item.id}><span><b>{item.room} · {item.bed}</b><small>{item.from} → {item.to || 'Present'} · {item.status || 'Active'} · {item.reason}</small></span><Badge>{item.status || 'Active'}</Badge></div>)}</section>
  </>;
}
