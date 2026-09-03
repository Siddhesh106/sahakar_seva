import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Globe, MapPin, ShieldCheck, Check } from 'lucide-react';
import { apiFetch } from '../api';

export default function Profile() {
  const { user, refreshUser, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [lang, setLang] = useState(user?.language_pref || 'en');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify({ name, language_pref: lang }),
      });
      if (res.user) {
        setUser(res.user);
      } else {
        await refreshUser();
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-[#171b27]/90 rounded-3xl border border-white/[0.08] shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-white/[0.08] pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8083ff] to-[#6366f1] text-white flex items-center justify-center text-2xl font-bold shadow-lg">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <span className="text-[10px] bg-[#8083ff]/15 text-[#c0c1ff] font-bold px-2 py-0.5 rounded uppercase border border-[#8083ff]/30">
              {user?.role || 'member'}
            </span>
            <h1 className="text-xl font-extrabold text-white mt-1">{user?.name || 'Customer Account'}</h1>
            <p className="text-xs text-[#908fa0] flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-[#908fa0]" /> +91 {user?.phone}
            </p>
          </div>
        </div>

        {saved && (
          <div className="bg-[#4edea3]/15 text-[#4edea3] text-xs p-3.5 rounded-xl border border-[#4edea3]/30 flex items-center gap-2">
            <Check className="w-4 h-4" /> Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#908fa0] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0f131e] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#8083ff] text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Language Preference</label>
            <div className="relative">
              <Globe className="w-4 h-4 text-[#908fa0] absolute left-3.5 top-3.5" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0f131e] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#8083ff] text-xs"
              >
                <option value="en">English (English)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Saved Addresses</label>
            <div className="space-y-2">
              <div className="p-3.5 bg-[#0f131e] rounded-xl border border-white/[0.08] text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Home</span>
                  <p className="text-[#908fa0] mt-0.5">12 MG Road, Pune</p>
                </div>
                <MapPin className="w-4 h-4 text-[#c0c1ff]" />
              </div>
              <div className="p-3.5 bg-[#0f131e] rounded-xl border border-white/[0.08] text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Office</span>
                  <p className="text-[#908fa0] mt-0.5">45 FC Road, Pune</p>
                </div>
                <MapPin className="w-4 h-4 text-[#c0c1ff]" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-[#8083ff] to-[#c0c1ff] hover:from-[#9395ff] hover:to-[#d0d1ff] text-[#0a0e19] font-black py-3.5 rounded-xl shadow-lg shadow-[#8083ff]/20 transition text-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? 'Saving changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

