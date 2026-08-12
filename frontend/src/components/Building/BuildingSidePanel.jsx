import React from 'react';
import { X, Navigation, MapPin, CheckCircle2, Layers } from 'lucide-react';
import { haversineDistance } from '../../utils/aStarPathfinder';

export default function BuildingSidePanel({ building, onClose, onStartNavigation, userLocation }) {
  if (!building) return null;

  let distanceText = null;
  if (userLocation) {
    const dist = Math.round(haversineDistance(userLocation.latitude, userLocation.longitude, building.latitude, building.longitude));
    distanceText = `${dist} meters away from your location`;
  }

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
      <div style={{ position: 'relative', height: '180px', width: '100%' }}>
        <img
          src={building.imageUrl}
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
            justifyContent: 'center',
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
            {building.code} • {building.category}
          </span>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.35rem',
            fontWeight: '700',
            color: '#ffffff',
            marginTop: '6px'
          }}>
            {building.name}
          </h2>
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            fontSize: '0.85rem'
          }}>
            <MapPin size={16} />
            <span>{distanceText}</span>
          </div>
        )}

        {/* Description */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>About Building</h4>
          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            {building.description}
          </p>
        </div>

        {/* Key Facilities */}
        {building.facilities && building.facilities.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Key Facilities & Rooms</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {building.facilities.map((fac, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle2 size={12} color="#38bdf8" />
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
            marginTop: '8px',
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#0f172a',
            fontWeight: '700',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 8px 20px -6px rgba(56, 189, 248, 0.5)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Navigation size={18} />
          <span>Navigate To Destination</span>
        </button>
      </div>
    </div>
  );
}
