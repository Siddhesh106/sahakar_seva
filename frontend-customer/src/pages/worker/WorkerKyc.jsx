import React, { useState } from 'react';
import { apiFetch } from '../../api';
import { ShieldCheck, Upload, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function WorkerKyc() {
  const [docType, setDocType] = useState('aadhaar');
  const [docNumber, setDocNumber] = useState('');
  const [status, setStatus] = useState('verified'); // pending | verified | rejected
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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
          doc_image_url: previewUrl || 'https://placeholder.co/400x250?text=KYC+Document',
        }),
      });
      setStatus(res.kyc_status);
      setSubmitted(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h1 className="text-xl font-black text-slate-800">Cooperative KYC Verification</h1>
            <p className="text-xs text-slate-500 mt-0.5">Required for Fair-Match candidate pool eligibility</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
            status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
            status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
          }`}>
            {status === 'verified' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            {status}
          </span>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 text-emerald-700 p-8 rounded-2xl text-sm text-center border border-emerald-100 space-y-2">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600 mb-2" />
            <h3 className="font-bold text-base">KYC Document Submitted!</h3>
            <p className="text-xs text-emerald-600">The Pune Cooperative Society admin will review your identity within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Government Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="aadhaar">Aadhaar Card (UIDAI)</option>
                <option value="pan">PAN Card (Income Tax Dept)</option>
                <option value="voter_id">Voter ID (Election Commission)</option>
                <option value="driving_license">Driving License</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Document ID Number</label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. 5432 9876 1234"
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Upload Identity Photo / Scan</label>
              <label className="block border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer relative overflow-hidden">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="space-y-2">
                    <img src={previewUrl} alt="KYC Preview" className="max-h-40 mx-auto rounded-xl border border-slate-200 object-cover" />
                    <p className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> File Selected — Click to change
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-9 h-9 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-700">Click or Drag & Drop Document Image</p>
                    <p className="text-[11px] text-slate-400 mt-1">PNG, JPG or PDF up to 5MB</p>
                  </>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-3.5 rounded-xl text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Submitting...' : 'Submit KYC Documents'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
