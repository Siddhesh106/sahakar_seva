import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Globe, MapPin, ShieldCheck, Check } from 'lucide-react';
import { apiFetch } from '../api';

export default function Profile() {
  const { user, registerUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [lang, setLang] = useState(user?.language_pref || 'en');
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify({ name, language_pref: lang }),
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
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{user?.name || 'Customer Account'}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5" /> +91 {user?.phone}
            </p>
          </div>
        </div>

        {saved && (
          <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-lg mb-6 border border-emerald-100 flex items-center gap-2">
            <Check className="w-4 h-4" /> Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Language Preference</label>
            <div className="relative">
              <Globe className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Saved Addresses</label>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-700">Home</span>
                  <p className="text-slate-500">12 MG Road, Pune</p>
                </div>
                <MapPin className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-700">Office</span>
                  <p className="text-slate-500">45 FC Road, Pune</p>
                </div>
                <MapPin className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg shadow-md transition text-sm"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
