import React, { useState, useEffect } from 'react';
import { X, Navigation, MapPin, CheckCircle2, Edit2, Trash2, Save, Move } from 'lucide-react';
import { haversineDistance } from '../../utils/aStarPathfinder';

export default function BuildingSidePanel({
  building,
  onClose,
  onStartNavigation,
  userLocation,
  onEditBuilding,
  onDeleteBuilding
}) {
  if (!building) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(building.name);
  const [editCode, setEditCode] = useState(building.code || '');
  const [editLat, setEditLat] = useState(building.latitude.toString());
  const [editLng, setEditLng] = useState(building.longitude.toString());

  useEffect(() => {
    setEditName(building.name);
    setEditCode(building.code || '');
    setEditLat(building.latitude.toString());
    setEditLng(building.longitude.toString());
    setIsEditing(false);
  }, [building]);

  let distanceText = null;
  if (userLocation) {
    const dist = Math.round(haversineDistance(userLocation.latitude, userLocation.longitude, building.latitude, building.longitude));
    distanceText = `${dist} meters away from your location`;
  }

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const latNum = parseFloat(editLat);
    const lngNum = parseFloat(editLng);

    if (isNaN(latNum) || isNaN(lngNum) || !editName.trim()) {
      alert('Please provide valid name and coordinates!');
      return;
    }

    if (onEditBuilding) {
      onEditBuilding(building.id, {
        name: editName.trim(),
        code: editCode.trim(),
        latitude: latNum,
        longitude: lngNum
      });
    }
    setIsEditing(false);
  };

  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '380px',
        maxHeight: 'calc(100vh - 40px)',
        borderRadius: '20px',
        zIndex: 40,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}
    >
      {/* Header Image with Overlay */}
      <div style={{ position: 'relative', height: '160px', width: '100%' }}>
        <img
          src={building.imageUrl || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80'}
          alt={building.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)'
        }} />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: '#f8fafc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            backdropFilter: 'blur(8px)'
          }}
        >
          <X size={18} />
        </button>

        {/* Building Badge & Name */}
        <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
          <span style={{
            background: 'rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '700',
            letterSpacing: '0.5px',
            border: '1px solid rgba(56, 189, 248, 0.4)'
          }}>
            {building.code || 'LOCATION'} • {building.category || 'CAMPUS'}
          </span>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#ffffff',
            marginTop: '4px'
          }}>
            {building.name}
          </h2>
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Exact Coordinates Bar */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700' }}>EXACT COORDINATES</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  background: isEditing ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(56,189,248,0.3)',
                  borderRadius: '6px',
                  color: '#38bdf8',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Edit2 size={12} /> {isEditing ? 'Cancel Edit' : 'Edit Coords'}
              </button>

              {onDeleteBuilding && (
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${building.name}" from campus locations?`)) {
                      onDeleteBuilding(building.id);
                      onClose();
                    }
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    borderRadius: '6px',
                    color: '#ef4444',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          </div>

          {!isEditing ? (
            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#38bdf8', display: 'flex', gap: '12px' }}>
              <span>Lat: <strong>{building.latitude.toFixed(6)}</strong></span>
              <span>Lng: <strong>{building.longitude.toFixed(6)}</strong></span>
            </div>
          ) : (
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <input
                type="text"
                placeholder="Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '6px', color: '#fff', fontSize: '0.8rem' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Latitude"
                  value={editLat}
                  onChange={(e) => setEditLat(e.target.value)}
                  style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '6px', color: '#fff', fontSize: '0.8rem' }}
                />
                <input
                  type="text"
                  placeholder="Longitude"
                  value={editLng}
                  onChange={(e) => setEditLng(e.target.value)}
                  style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '6px', color: '#fff', fontSize: '0.8rem' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  border: 'none', borderRadius: '6px', color: '#0f172a', fontWeight: '700',
                  padding: '6px', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}
              >
                <Save size={13} /> Save Location Changes
              </button>
            </form>
          )}

          <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Move size={11} color="#f59e0b" /> Drag badge directly on map to move position
          </div>
        </div>

        {/* Distance Indicator */}
        {distanceText && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(56, 189, 248, 0.1)',
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            color: '#38bdf8',
            fontSize: '0.82rem'
          }}>
            <MapPin size={15} />
            <span>{distanceText}</span>
          </div>
        )}

        {/* Description */}
        <div>
          <h4 style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>About Location</h4>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4', margin: 0 }}>
            {building.description}
          </p>
        </div>

        {/* Key Facilities */}
        {building.facilities && building.facilities.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Key Facilities</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {building.facilities.map((fac, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle2 size={11} color="#38bdf8" />
                  {fac}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onStartNavigation(building)}
          style={{
            marginTop: '4px',
            width: '100%',
            padding: '11px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#0f172a',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            gap: '8px',
            boxShadow: '0 8px 20px -6px rgba(56, 189, 248, 0.5)'
          }}
        >
          <Navigation size={17} />
          <span>Navigate To Destination</span>
        </button>
      </div>
    </div>
  );
}
