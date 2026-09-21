import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { can, PERMISSIONS } from './access.js';
import { returnFromLeave, startLeave, useUi6Store } from './ui6Store.js';

function Badge({ children }) { return <span className="statusChip">{children}</span>; }
export function FacilityLeaveView({ access, navigate }) {
  const { residents, beds, leaveEpisodes = [] } = useUi6Store();
  const currentResidents = residents.filter(item => item.location === 'Residential Unit A' && beds.some(bed => bed.clientId === item.id && bed.status === 'Occupied'));
  const [residentId, setResidentId] = useState(currentResidents[0]?.id || '');
  const [expectedReturn, setExpectedReturn] = useState('20 Sep 2026 · 18:00');
  const [reason, setReason] = useState('');
  const [validation, setValidation] = useState('');
  const resident = residents.find(item => item.id === residentId) || currentResidents[0];
  const bed = beds.find(item => item.clientId === resident?.id && item.status === 'Occupied');
  const episode = leaveEpisodes.find(item => item.clientId === resident?.id && item.status === 'Active');
  const canLeave = can(access, PERMISSIONS.BED_LEAVE, 'facility');
  const act = () => { if (!reason.trim()) return setValidation('A leave reason is required.'); if (!expectedReturn) return setValidation('An expected return is required.'); if (!startLeave(resident.id, expectedReturn, reason)) return setValidation('Leave could not be started. Verify active admission and occupancy.'); setValidation(''); };
  const ret = () => { if (!returnFromLeave(resident.id)) setValidation('Return could not be recorded because no active held leave exists.'); };
  return <><div className="adminHeader"><div><span className="kicker">Facility operations</span><h2>Temporary leave / return</h2><p>Temporary leave preserves the active admission and holds the current bed.</p></div><div className="pageActions"><button className="secondaryButton" onClick={() => navigate('/facility/bed-board')}><ArrowLeft size={16} /> Bed board</button></div></div><section className="panel"><div className="formGrid"><label>Resident<select aria-label="Resident" disabled={!canLeave} value={residentId} onChange={event => { setResidentId(event.target.value); setValidation(''); }}>{currentResidents.map(item => <option key={item.id} value={item.id}>{item.name} · {item.bed}</option>)}</select></label><label>Expected return<input aria-label="Expected return" disabled={!canLeave || Boolean(episode)} value={episode?.expectedReturn || expectedReturn} onChange={event => setExpectedReturn(event.target.value)} /></label></div><div className="detailRows"><span>Current bed</span><b>{bed?.room} · {bed?.bed}</b><span>Admission</span><b>{resident?.admissionId}</b><span>State</span><Badge>{resident?.leaveStatus}</Badge></div>{!episode ? <><label>Leave reason<textarea aria-label="Leave reason" disabled={!canLeave} value={reason} onChange={event => { setReason(event.target.value); setValidation(''); }} placeholder="Reason for temporary leave" /></label>{validation && <div role="alert" className="privacyNote">{validation}</div>}<button className="primary" disabled={!canLeave || !bed} onClick={act}>Confirm Temporary Leave <Check size={16} /></button></> : <><div className="privacyNote">Bed {episode.bed} remains held for {resident.name}. Leave started {episode.startedAt}; expected return {episode.expectedReturn}.</div>{validation && <div role="alert" className="privacyNote">{validation}</div>}<button className="primary" disabled={!canLeave} onClick={ret}>Confirm Return from Temporary Leave <Check size={16} /></button></>}</section><section className="panel"><div className="panelHeader"><div><span className="kicker">Leave history</span><h2>Episodes</h2></div></div>{leaveEpisodes.filter(item => item.clientId === resident?.id).map(item => <div className="moduleRow" key={item.id}><span><b>{item.bed} · {item.status}</b><small>{item.startedAt} → {item.returnedAt || 'Active'} · {item.reason} · {item.startedBy}</small></span><Badge>{item.status}</Badge></div>)}</section></>;
}
