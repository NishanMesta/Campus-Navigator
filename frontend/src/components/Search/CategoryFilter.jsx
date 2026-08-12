import React from 'react';
import { CATEGORIES } from '../../data/presidencyData';
import { Compass, GraduationCap, BookOpen, Utensils, Trophy, Building2, Home, Cross } from 'lucide-react';

const iconMap = {
  Compass,
  GraduationCap,
  BookOpen,
  Utensils,
  Trophy,
  Building2,
  Home,
  Cross
};

export default function CategoryFilter({ activeCategory, onSelectCategory }) {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      maxWidth: '100%',
      paddingBottom: '4px'
    }}>
      {CATEGORIES.map((cat) => {
        const IconComponent = iconMap[cat.icon] || Compass;
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="glass-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '20px',
              border: isActive ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              background: isActive ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.3) 0%, rgba(129, 140, 248, 0.3) 100%)' : 'rgba(30, 41, 59, 0.7)',
              color: isActive ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '0.82rem',
              fontWeight: isActive ? '600' : '500',
              transition: 'all 0.2s ease',
              boxShadow: isActive ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none'
            }}
          >
            <IconComponent size={14} />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
