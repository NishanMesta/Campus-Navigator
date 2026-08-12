import React, { useState } from 'react';
import { Search, X, MapPin } from 'lucide-react';

export default function SearchBar({ buildings, onSelectBuilding, searchQuery, setSearchQuery }) {
  const [isOpen, setIsOpen] = useState(false);

  const filteredBuildings = searchQuery.trim() === ''
    ? []
    : buildings.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.facilities.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '420px', zIndex: 30 }}>
      <div className="glass-panel" style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 16px',
        borderRadius: '16px',
        gap: '12px',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <Search size={20} color="#38bdf8" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search campus buildings, labs, library..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#f8fafc',
            width: '100%',
            fontSize: '0.95rem',
            fontFamily: 'inherit'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setIsOpen(false);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && filteredBuildings.length > 0 && (
        <div className="glass-panel animate-fade-in" style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          borderRadius: '14px',
          maxHeight: '280px',
          overflowY: 'auto',
          padding: '6px'
        }}>
          {filteredBuildings.map(b => (
            <div
              key={b.id}
              onClick={() => {
                onSelectBuilding(b);
                setSearchQuery(b.name);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                background: 'rgba(56, 189, 248, 0.2)',
                padding: '8px',
                borderRadius: '8px',
                color: '#38bdf8',
                display: 'flex'
              }}>
                <MapPin size={16} />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#f8fafc' }}>{b.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{b.code} • {b.category}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
