import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ChevronLeft, ChevronRight, Search, Building, Layers } from 'lucide-react';

export default function PlaceSidebar({
  buildings = [],
  selectedBuilding,
  onSelectBuilding,
  onStartNavigation,
  isOpen,
  setIsOpen
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBuildings = buildings.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.code && b.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.category && b.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDropdownChange = (e) => {
    const val = e.target.value;
    if (!val) { onSelectBuilding(null); return; }
    // Support both numeric and string IDs
    const found = buildings.find(b => String(b.id) === val);
    if (found) {
      onSelectBuilding(found);
    } else {
      onSelectBuilding(null);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '90px',
        left: isOpen ? '20px' : '-340px',
        width: '320px',
        maxHeight: 'calc(100vh - 120px)',
        zIndex: 30,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Main Glass Panel */}
      <div
        className="glass-panel"
        style={{
          borderRadius: '20px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              padding: '6px', borderRadius: '10px', color: '#fff', display: 'flex'
            }}>
              <Compass size={18} />
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: '700', color: '#fff', margin: 0 }}>
              Select Place
            </h2>
          </div>
          <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: '600' }}>
            {buildings.length} Locations
          </span>
        </div>

        {/* Dropdown Select Menu */}
        <div>
          <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
            CHOOSE LOCATION FROM DROPDOWN
          </label>
          <select
            value={selectedBuilding ? String(selectedBuilding.id) : ''}
            onChange={handleDropdownChange}
            style={{
              width: '100%',
              background: '#0f172a',
              border: '1px solid #38bdf8',
              borderRadius: '12px',
              padding: '10px 12px',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.2)'
            }}
          >
            <option value="">-- Select Place --</option>
            {buildings.map(b => (
              <option key={b.id} value={String(b.id)}>
                {b.name} ({b.code || b.category})
              </option>
            ))}
          </select>
        </div>

        {/* Search filter input */}
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Filter places by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '8px 10px 8px 32px',
              color: '#fff',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Quick List of Filtered Places */}
        {searchTerm && (
          <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredBuildings.length === 0 ? (
              <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', padding: '8px' }}>
                No matching locations found
              </div>
            ) : (
              filteredBuildings.map(b => (
                <button
                  key={b.id}
                  onClick={() => onSelectBuilding(b)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: selectedBuilding && selectedBuilding.id === b.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: selectedBuilding && selectedBuilding.id === b.id ? '#38bdf8' : '#e2e8f0',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.8rem'
                  }}
                >
                  <span style={{ fontWeight: '500' }}>{b.name}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{b.code}</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Selected Place Details Preview */}
        {selectedBuilding && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '14px',
            padding: '12px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.92rem', color: '#fff', fontWeight: '700' }}>
                  {selectedBuilding.name}
                </h3>
                <div style={{ fontSize: '0.74rem', color: '#38bdf8', marginTop: '2px' }}>
                  {selectedBuilding.code} • {selectedBuilding.category}
                </div>
              </div>
              <MapPin size={18} style={{ color: '#38bdf8', flexShrink: 0 }} />
            </div>

            {selectedBuilding.description && (
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: '1.4' }}>
                {selectedBuilding.description}
              </div>
            )}

            <button
              onClick={() => onStartNavigation(selectedBuilding)}
              style={{
                width: '100%',
                padding: '9px',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '6px',
                marginTop: '4px',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
              }}
            >
              <Navigation size={15} /> Navigate Here
            </button>
          </div>
        )}
      </div>

      {/* Toggle Tab Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '-36px',
          width: '36px',
          height: '42px',
          background: 'rgba(30, 41, 59, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderLeft: 'none',
          borderRadius: '0 12px 12px 0',
          color: '#38bdf8',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          cursor: 'pointer',
          boxShadow: '4px 0 10px rgba(0, 0, 0, 0.3)'
        }}
        title={isOpen ? 'Hide Sidebar' : 'Select Place'}
      >
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </div>
  );
}
