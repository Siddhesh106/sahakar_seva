import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Upload, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function WorkerKyc() {
  const { user, refreshUser } = useAuth();
  const [docType, setDocType] = useState('aadhaar');
  const [docNumber, setDocNumber] = useState('');
  const [status, setStatus] = useState(user?.worker_profile?.kyc_status || 'verified');
  const [previewUrl, setPreviewUrl] = useState(user?.worker_profile?.kyc_doc_image_url || null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    apiFetch('/users/me')
      .then((res) => {
        if (res.user?.worker_profile?.kyc_status) {
          setStatus(res.user.worker_profile.kyc_status);
        }
        if (res.user?.worker_profile?.kyc_doc_number) {
          setDocNumber(res.user.worker_profile.kyc_doc_number);
        }
        if (res.user?.worker_profile?.kyc_doc_type) {
          setDocType(res.user.worker_profile.kyc_doc_type);
        }
        if (res.user?.worker_profile?.kyc_doc_image_url) {
          setPreviewUrl(res.user.worker_profile.kyc_doc_image_url);
        }
      })
      .catch((err) => console.error('KYC fetch error:', err));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/workers/kyc', {
        method: 'POST',
        body: JSON.stringify({
          doc_type: docType,
          doc_number: docNumber,
          doc_image_url: previewUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80',
        }),
      });
      setStatus(res.kyc_status || 'pending');
      setSubmitted(true);
      await refreshUser();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24">
      <div className="bg-[#171b27]/90 rounded-3xl border border-white/[0.08] shadow-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
          <div>
            <h1 className="text-xl font-black text-white">Cooperative KYC Verification</h1>
            <p className="text-xs text-[#908fa0] mt-0.5">Required for Fair-Match candidate pool eligibility</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
            status === 'verified' ? 'bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30' :
            status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {status === 'verified' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            {status}
          </span>
        </div>

        {submitted ? (
          <div className="bg-[#4edea3]/10 text-[#4edea3] p-8 rounded-2xl text-sm text-center border border-[#4edea3]/20 space-y-2">
            <CheckCircle2 className="w-12 h-12 mx-auto text-[#4edea3] mb-2" />
            <h3 className="font-bold text-base text-white">KYC Document Submitted!</h3>
            <p className="text-xs text-[#4edea3]/90">The Pune Cooperative Society admin will review your identity within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Government Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-3.5 bg-[#0f131e] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-[#4edea3]"
              >
                <option value="aadhaar">Aadhaar Card (UIDAI)</option>
                <option value="pan">PAN Card (Income Tax Dept)</option>
                <option value="voter_id">Voter ID (Election Commission)</option>
                <option value="driving_license">Driving License</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Document ID Number</label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. 5432 9876 1234"
                className="w-full p-3.5 bg-[#0f131e] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-[#4edea3] font-mono font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Upload Identity Photo / Scan</label>
              <label className="block border-2 border-dashed border-white/[0.1] hover:border-[#4edea3] rounded-2xl p-6 text-center bg-[#0f131e] hover:bg-[#1b1f2b] transition cursor-pointer relative overflow-hidden">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="space-y-2">
                    <img src={previewUrl} alt="KYC Preview" className="max-h-40 mx-auto rounded-xl border border-white/[0.1] object-cover" />
                    <p className="text-xs text-[#4edea3] font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> File Selected — Click to change
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-9 h-9 text-[#908fa0] mx-auto mb-2" />
                    <p className="text-xs font-medium text-[#c7c4d7]">Click or Drag & Drop Document Image</p>
                    <p className="text-[11px] text-[#908fa0] mt-1">PNG, JPG or PDF up to 5MB</p>
                  </>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#4edea3] to-[#00a572] hover:brightness-110 text-[#003824] font-black py-3.5 rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Submitting...' : 'Submit KYC Documents'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
