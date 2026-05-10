import React from 'react';

const RoleSelector = ({ value, onChange }) => {
  return (
    <div className="relative flex p-1 bg-slate-100 rounded-full mb-8">
      {/* Sliding Highlight Pill */}
      <div 
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-in-out"
        style={{ transform: value === 'admin' ? 'translateX(100%)' : 'translateX(0)' }}
      />
      
      <button
        type="button"
        onClick={() => onChange('member')}
        className={`relative z-10 flex-1 py-3 text-sm font-semibold rounded-full transition-colors duration-300 ${
          value === 'member'
            ? 'text-slate-900'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Member
      </button>
      <button
        type="button"
        onClick={() => onChange('admin')}
        className={`relative z-10 flex-1 py-3 text-sm font-semibold rounded-full transition-colors duration-300 ${
          value === 'admin'
            ? 'text-slate-900'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Admin
      </button>
    </div>
  );
};

export default RoleSelector;
