import React, { useState } from 'react';
import { apiFetch } from '../api';
import { ShieldCheck, Upload, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function KycUpload() {
  const [docType, setDocType] = useState('aadhaar');
  const [docNumber, setDocNumber] = useState('');
  const [status, setStatus] = useState('verified'); // pending | verified | rejected
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/workers/kyc', {
        method: 'POST',
        body: JSON.stringify({
          doc_type: docType,
          doc_number: docNumber,
          doc_image_url: 'https://placeholder.co/400x250?text=KYC+Document',
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
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <h1 className="text-xl font-bold text-slate-800">Cooperative KYC Verification</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
            status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
            status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
          }`}>
            {status === 'verified' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            {status}
          </span>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 text-emerald-700 p-6 rounded-xl text-sm text-center border border-emerald-100 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
            <h3 className="font-bold text-base">KYC Document Submitted!</h3>
            <p className="text-xs text-emerald-600">The cooperative admin team will review and verify your identity within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="aadhaar">Aadhaar Card</option>
                <option value="pan">PAN Card</option>
                <option value="voter_id">Voter ID</option>
                <option value="driving_license">Driving License</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Document Number</label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. 1234 5678 9012"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Upload Document Front Photo</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">Click to capture or upload photo</p>
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-lg text-sm shadow transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Verification Docs'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
