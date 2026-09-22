import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { PERMISSIONS, can } from './access.js';
import { createStockRequest } from './ui9Store.js';

export function InventoryRequestView({ access, navigate }) {
  const [itemId, setItemId] = useState('item-med-1001');
  const [fromLocationId, setFromLocationId] = useState('Ward X');
  const [toLocationId, setToLocationId] = useState('Ward Y');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const submit = () => {
    const id = createStockRequest({ itemId, fromLocationId, toLocationId, quantity: Number(quantity), reason, actor: access.label });
    setMessage(id ? `Stock request ${id} created.` : 'Enter a valid quantity, reason, and different source/destination locations.');
  };
  return <section className="panel portalWide">
    <div className="panelHeader"><div><span className="kicker">Inventory</span><h2>Request stock</h2><p>Request a controlled movement from one stock location to another.</p></div></div>
    <div className="formGrid">
      <label>Item<select value={itemId} onChange={event => setItemId(event.target.value)}><option value="item-med-1001">Sertraline 50 mg</option><option value="item-cons-1001">Nitrile gloves</option></select></label>
      <label>Source location<select value={fromLocationId} onChange={event => setFromLocationId(event.target.value)}><option>Ward X</option><option>Ward Y</option></select></label>
      <label>Destination location<select value={toLocationId} onChange={event => setToLocationId(event.target.value)}><option>Ward Y</option><option>Ward X</option></select></label>
      <label>Quantity<input type="number" min="1" value={quantity} onChange={event => setQuantity(event.target.value)} /></label>
      <label>Reason<input value={reason} onChange={event => setReason(event.target.value)} placeholder="Why is this stock needed?" /></label>
    </div>
    <button className="primary" disabled={!can(access, PERMISSIONS.INVENTORY_REQUEST, 'inventory') || !quantity || !reason || fromLocationId === toLocationId} onClick={submit}><Plus size={16} /> Create stock request</button>
    {message && <div className="privacyNote">{message}</div>}
    <button className="secondaryButton" onClick={() => navigate('/inventory/transfers')}>Open requests & transfers</button>
  </section>;
}
