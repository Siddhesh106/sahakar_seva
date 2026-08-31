import React, { useState } from 'react';
import { apiFetch } from '../api';
import { Check, Wrench } from 'lucide-react';

const CATEGORIES = [
  'cleaning', 'plumbing', 'electrical', 'tutoring',
  'elder_care', 'cooking', 'gardening', 'event_help'
];

export default function Skills() {
  const [selected, setSelected] = useState(['electrical', 'plumbing']);
  const [saved, setSaved] = useState(false);

  const toggleSkill = (cat) => {
    if (selected.includes(cat)) {
      setSelected(selected.filter((s) => s !== cat));
    } else {
      setSelected([...selected, cat]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/workers/me/skills', {
        method: 'PUT',
        body: JSON.stringify({ skill_categories: selected }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-slate-800 mb-2">Select Your Skill Categories</h1>
        <p className="text-xs text-slate-500 mb-6">
          You will only receive Fair-Match job offers for categories you select.
        </p>

        {saved && (
          <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-lg mb-6 border border-emerald-100 flex items-center gap-2">
            <Check className="w-4 h-4" /> Skills updated!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => {
              const isChecked = selected.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleSkill(cat)}
                  className={`p-4 rounded-xl border font-bold text-xs capitalize flex items-center justify-between transition ${
                    isChecked
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.replace('_', ' ')}</span>
                  {isChecked && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-xl text-sm shadow transition"
          >
            Save Skills
          </button>
        </form>
      </div>
    </div>
  );
}
