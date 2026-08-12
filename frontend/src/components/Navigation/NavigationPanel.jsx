import React from 'react';
import { Navigation, Clock, Footprints, X, Accessibility, Ban, MapPin, ChevronRight } from 'lucide-react';

export default function NavigationPanel({
  buildings,
  originId,
  setOriginId,
  destinationId,
  setDestinationId,
  routeResult,
  options,
  setOptions,
  onClearRoute
}) {
  const selectedDestination = buildings.find((b) => b.id === destinationId);

  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '380px',
        maxHeight: 'calc(100vh - 40px)',
        borderRadius: '20px',
        zIndex: 40,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        padding: '18px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '6px', borderRadius: '8px', color: '#38bdf8' }}>
            <Navigation size={18} />
          </div>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', color: '#ffffff' }}>
            Campus Pathfinder
          </h3>
        </div>
        <button
          onClick={onClearRoute}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Origin & Destination Selectors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
        {/* Origin */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <label style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '600', textTransform: 'uppercase' }}>
            Starting Point (Origin)
          </label>
          <select
            value={originId || 'GPS'}
            onChange={(e) => setOriginId(e.target.value === 'GPS' ? 'GPS' : parseInt(e.target.value))}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '0.9rem',
              fontWeight: '500',
              outline: 'none',
              marginTop: '4px',
              cursor: 'pointer'
            }}
          >
            <option value="GPS" style={{ background: '#1e293b' }}>📍 Current Location (GPS)</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id} style={{ background: '#1e293b' }}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>

        {/* Destination */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <label style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '600', textTransform: 'uppercase' }}>
            Destination
          </label>
          <select
            value={destinationId || ''}
            onChange={(e) => setDestinationId(parseInt(e.target.value))}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '0.9rem',
              fontWeight: '500',
              outline: 'none',
              marginTop: '4px',
              cursor: 'pointer'
            }}
          >
            <option value="" disabled style={{ background: '#1e293b' }}>Select destination block...</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id} style={{ background: '#1e293b' }}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Path Preferences / Toggles */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          onClick={() => setOptions({ ...options, avoidStairs: !options.avoidStairs })}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: '10px',
            border: options.avoidStairs ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
            background: options.avoidStairs ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.5)',
            color: options.avoidStairs ? '#f59e0b' : '#94a3b8',
            fontSize: '0.78rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <Ban size={14} /> Avoid Stairs
        </button>
        <button
          onClick={() => setOptions({ ...options, wheelchairOnly: !options.wheelchairOnly })}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: '10px',
            border: options.wheelchairOnly ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
            background: options.wheelchairOnly ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.5)',
            color: options.wheelchairOnly ? '#10b981' : '#94a3b8',
            fontSize: '0.78rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <Accessibility size={14} /> Wheelchair Accessible
        </button>
      </div>

      {/* Calculated Route Results */}
      {routeResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          {/* Metrics Card */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(129, 140, 248, 0.15) 100%)',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid rgba(56, 189, 248, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Footprints size={20} color="#38bdf8" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Distance</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>{routeResult.totalDistance} m</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="#818cf8" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Est. Walk Time</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>{routeResult.walkingMinutes} min</div>
              </div>
            </div>
          </div>

          {/* Turn-by-turn Navigation steps */}
          <div>
            <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
              Turn-By-Turn Path Instructions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {routeResult.steps.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.85rem',
                    color: '#e2e8f0',
                    background: 'rgba(15, 23, 42, 0.4)',
                    padding: '8px 10px',
                    borderRadius: '8px'
                  }}
                >
                  <span style={{
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : selectedDestination ? (
        <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
          Calculating shortest A* walking route...
        </div>
      ) : null}
    </div>
  );
}
