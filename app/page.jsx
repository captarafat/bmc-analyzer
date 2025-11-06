'use client';

import { useMemo, useState } from 'react';
import BmcCanvas from '../components/BmcCanvas';

const BLOCKS = [
  { key: 'keyPartners', label: 'Key Partners (Rakan Utama)' },
  { key: 'keyActivities', label: 'Key Activities (Aktiviti Utama)' },
  { key: 'keyResources', label: 'Key Resources (Sumber Utama)' },
  { key: 'valuePropositions', label: 'Value Propositions (Nilai Cadangan)' },
  { key: 'customerRelationships', label: 'Customer Relationships (Hubungan Pelanggan)' },
  { key: 'channels', label: 'Channels (Saluran)' },
  { key: 'customerSegments', label: 'Customer Segments (Segmen Pelanggan)' },
  { key: 'costStructure', label: 'Cost Structure (Struktur Kos)' },
  { key: 'revenueStreams', label: 'Revenue Streams (Aliran Pendapatan)' },
];

export default function Page() {
  const [studentName, setStudentName] = useState('');
  const [businessIdea, setBusinessIdea] = useState('');
  const [blocks, setBlocks] = useState(() => Object.fromEntries(BLOCKS.map(b => [b.key, ''])));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  const canSubmit = useMemo(() => {
    return studentName.trim() && businessIdea.trim();
  }, [studentName, businessIdea]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, businessIdea, blocks }),
      });
      if (!res.ok) throw new Error('Gagal menganalisis.');
      const data = await res.json();
      setResult(data);
      setSuccessOpen(true);
    } catch (err) {
      setError('Maaf, berlaku ralat ketika menganalisis. Cuba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-body">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Business Model Canvas</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input className="input" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Contoh: Ali Bin Abu" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Idea Perniagaan</label>
                <input className="input" value={businessIdea} onChange={e => setBusinessIdea(e.target.value)} placeholder="Contoh: Aplikasi tempahan katering komuniti" />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-4 text-center">Lengkapkan 9 blok utama BMC di bawah.</p>
              <BmcCanvas blocks={blocks} setBlocks={setBlocks} />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={!canSubmit || loading} className="primary disabled:opacity-50">
                {loading ? 'Menganalisis...' : 'Hantar & Analisis'}
              </button>
              <span className="text-xs text-gray-500">Analisis AI akan mengambil beberapa saat.</span>
            </div>
          </form>
        </div>
      </div>

      {error ? (
        <div className="card border-red-200">
          <div className="card-body text-red-700 text-sm">{error}</div>
        </div>
      ) : null}

      {/* Pop up ringkas selepas hantar */}
      {successOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSuccessOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="px-5 py-4 border-b font-semibold">Penghantaran Berjaya</div>
            <div className="p-5 text-sm text-gray-700 space-y-2">
              <p>BMC anda telah dihantar kepada tenaga pengajar.</p>
              <p>Anda boleh membuat pembetulan dan hantar semula bila-bila masa.</p>
            </div>
            <div className="px-5 py-3 border-t flex justify-end">
              <button className="primary" onClick={() => setSuccessOpen(false)}>Tutup</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


