import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { can, PERMISSIONS } from './access.js';
import { assignBed, useUi6Store } from './ui6Store.js';

function Badge({ children }) { return <span className="statusChip">{children}</span>; }
export function FacilityAssignmentView({ access }) {
  const { beds, residents } = useUi6Store();
  const facilityUnit = access.location === 'Centre B' ? 'Centre B Unit' : access.tenant === 'Tenant T2' ? 'Tenant T2 Unit' : 'Residential Unit A';
  const eligible = residents.filter(resident => resident.location === facilityUnit && resident.admissionId && !beds.some(bed => bed.clientId === resident.id && bed.status === 'Occupied'));
  const [residentId, setResidentId] = useState(eligible[0]?.id || '');
  const [bedId, setBedId] = useState('');
  const [validation, setValidation] = useState('');
  const canManage = can(access, PERMISSIONS.BED_ASSIGN, 'facility');
  const available = beds.filter(bed => bed.status === 'Available' && bed.unit === facilityUnit && (!bed.tenant || bed.tenant === access.tenant));
  const selectedResident = residents.find(item => item.id === residentId);
  const selectedBed = beds.find(item => item.id === bedId);
  const assign = () => {
    if (!selectedResident?.admissionId) return setValidation('An active admission is required before assigning a bed.');
    if (!selectedBed || selectedBed.status !== 'Available') return setValidation('Select an available bed.');
    if (!assignBed(residentId, bedId)) return setValidation('This client already has an active occupancy or this bed is no longer available.');
    setValidation('');
    setBedId('');
  };
  const visibleBeds = beds.filter(bed => bed.unit === facilityUnit && (!bed.tenant || bed.tenant === access.tenant));
  return <><section className="panel"><div className="panelHeader"><div><span className="kicker">Facility operations</span><h2>Bed board</h2><p>Initial assignment only. Transfer and leave are separate workflows.</p></div></div><div className="formGrid"><label>Residential client<select aria-label="Residential client" disabled={!canManage} value={residentId} onChange={event => { setResidentId(event.target.value); setValidation(''); }}>{eligible.map(resident => <option key={resident.id} value={resident.id}>{resident.name} · {resident.admissionId}</option>)}</select></label><label>Available bed<select aria-label="Available bed" disabled={!canManage} value={bedId} onChange={event => { setBedId(event.target.value); setValidation(''); }}><option value="">Select bed</option>{available.map(bed => <option key={bed.id} value={bed.id}>{bed.unit} · {bed.room} · {bed.bed}</option>)}</select></label></div>{validation && <div role="alert" className="privacyNote">{validation}</div>}<button className="primary" disabled={!canManage || !bedId} onClick={assign}>Confirm bed assignment <Check size={16} /></button></section><section className="panel"><div className="panelHeader"><div><span className="kicker">Occupancy</span><h2>Bed board</h2></div></div><div className="adminTable"><div className="adminTr adminTh"><span>Unit / room</span><span>Bed</span><span>Status</span><span>Client</span></div>{visibleBeds.map(bed => { const resident = residents.find(item => item.id === bed.clientId); return <div className="adminTr" key={bed.id}><span>{bed.unit}<small>{bed.room}</small></span><span>{bed.bed}</span><span><Badge>{bed.status}</Badge></span><span>{resident?.name || 'Available'}</span></div>; })}</div></section></>;
}
