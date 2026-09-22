import React, { useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { submitFormSignature, useUi14Store } from './ui14Store.js';

export function ConsentFormView() {
  useUi14Store();
  const [acknowledgement, setAcknowledgement] = useState(false);
  const [signatureText, setSignatureText] = useState('');
  const [message, setMessage] = useState('');
  const submit = () => setMessage(submitFormSignature({ formId: 'form-consent-1001', acknowledgement, signatureText }) ? 'Consent signed and captured in the canonical consent domain.' : 'Complete the acknowledgement and typed signature.');
  return <section className="portalCard portalWide"><h2>Treatment consent</h2><p>This consent-bearing form creates canonical UI-10 Consent only after signature finalization.</p><label className="portalCheck"><input type="checkbox" checked={acknowledgement} onChange={event => setAcknowledgement(event.target.checked)} /> I consent to the described treatment and care coordination.</label><label>Typed signature<input value={signatureText} onChange={event => setSignatureText(event.target.value)} placeholder="Type your full name" /></label><button className="primary" onClick={submit}><Check size={16} /> Sign consent</button><div className="privacyNote"><ShieldCheck size={16} /> Frontend signature simulation; legal enforceability is not claimed.</div>{message && <div className="privacyNote">{message}</div>}</section>;
}
