'use client';

import { useEffect, useState } from 'react';

export default function TrainerPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState('');

  async function load() {
    try {
      // Always load sessions first
      const sRes = await fetch('/api/sessions', { cache: 'no-store' });
      const sData = await sRes.json();
      const sessionsList = sData.sessions || [];
      setSessions(sessionsList);
      
      // Set sessionId if not set or if current sessionId doesn't exist
      let currentSessionId = sessionId;
      if (!currentSessionId && sessionsList.length > 0) {
        currentSessionId = sessionsList[0].id;
        setSessionId(currentSessionId);
      } else if (currentSessionId && !sessionsList.find(s => s.id === currentSessionId)) {
        // Current session doesn't exist, use first available
        currentSessionId = sessionsList.length > 0 ? sessionsList[0].id : 'default';
        setSessionId(currentSessionId);
      }
      
      // Load leaderboard for current session
      const qs = currentSessionId ? `?sessionId=${encodeURIComponent(currentSessionId)}` : '';
      const res = await fetch(`/api/leaderboard${qs}`, { cache: 'no-store' });
      const data = await res.json();
      console.log('Leaderboard data:', { sessionId: currentSessionId, count: data.leaderboard?.length || 0 });
      setItems(data.leaderboard || []);
    } catch (error) {
      console.error('Load error:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [sessionId]);

  // Also reload when sessions change
  useEffect(() => {
    if (sessions.length > 0 && !sessionId) {
      setSessionId(sessions[0].id);
    }
  }, [sessions]);

  async function resetSession() {
    setResetting(true);
    try {
      await fetch('/api/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) });
      await load();
    } finally {
      setResetting(false);
    }
  }

  async function deleteEntry(at) {
    if (!confirm('Padam penghantaran ini? Tindakan ini tidak boleh diundur.')) return;
    try {
      await fetch('/api/leaderboard', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ at }),
      });
      await load();
    } catch (_e) {}
  }

  async function createSession() {
    const name = prompt('Nama sesi baharu?');
    if (!name) return;
    const res = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    const json = await res.json();
    if (json?.session) {
      setSessions((prev) => [json.session, ...prev]);
      setSessionId(json.session.id);
    }
  }

  async function deleteSession(id) {
    if (!confirm('Padam sesi ini dan semua entri?')) return;
    await fetch('/api/sessions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const s = await fetch('/api/sessions').then(r => r.json());
    setSessions(s.sessions || []);
    setSessionId(s.sessions?.[0]?.id || '');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">Leaderboard Pelajar
          <span className="text-xs bg-primary-600 text-white rounded-full px-2 py-0.5">{items.length}</span>
        </h2>
        <div className="flex items-center gap-2">
          <select className="input !py-1" value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button className="secondary" onClick={createSession}>Tambah Sesi</button>
          {sessionId ? <button className="secondary" onClick={() => deleteSession(sessionId)}>Padam Sesi</button> : null}
          <button className="secondary" onClick={resetSession} disabled={resetting}>
            {resetting ? 'Mengosongkan…' : 'Reset Sesi'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-sm text-gray-500">Memuatkan...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-gray-500">Belum ada penghantaran pelajar. Sila tunggu.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">#</th>
                    <th className="py-2 pr-3">Nama</th>
                    <th className="py-2 pr-3">Idea Perniagaan</th>
                    <th className="py-2 pr-3">Skor</th>
                    <th className="py-2 pr-3">Masa</th>
                    <th className="py-2 pr-3">Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={it.at} className="border-b last:border-0">
                      <td className="py-2 pr-3">{idx + 1}</td>
                      <td className="py-2 pr-3 font-medium">
                        <button className="text-primary-700 hover:underline" onClick={() => setSelected(it)}>{it.name}</button>
                      </td>
                      <td className="py-2 pr-3 text-gray-700 max-w-[360px] truncate" title={it.idea}>{it.idea}</td>
                      <td className="py-2 pr-3">{typeof it.score === 'number' ? it.score.toFixed(1) : it.score}</td>
                      <td className="py-2 pr-3 text-gray-500">{new Date(it.at).toLocaleString('ms-MY')}</td>
                      <td className="py-2 pr-3">
                        <button className="text-red-600 hover:underline" onClick={() => deleteEntry(it.at)}>Padam</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal butiran BMC */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-5xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <div className="font-semibold">{selected.name} — Skor {selected.analysis?.overallScore ?? selected.score}/10</div>
              <button className="secondary" onClick={() => setSelected(null)}>Tutup</button>
            </div>
            <div className="p-5 space-y-5">
              <div className="text-xs text-gray-500">Sumber analisis: <span className="font-medium">{selected.analysis?.provider || 'unknown'}</span>{selected.analysis?._error ? ` (fallback: ${selected.analysis?._error})` : ''}</div>
              <div className="text-sm text-gray-600"><span className="font-medium text-gray-800">Idea:</span> {selected.idea}</div>

              {/* Kanvas BMC ringkas (baca sahaja) — susun atur sama seperti halaman pelajar */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-5 md:grid-rows-2 md:auto-rows-fr gap-3">
                  <Block className="md:row-span-2" title="Rakan Kongsi Utama" value={selected.blocks?.keyPartners} score={selected.analysis?.scores?.keyPartners} />
                  <Block className="md:row-start-1 md:col-start-2" title="Aktiviti Utama" value={selected.blocks?.keyActivities} score={selected.analysis?.scores?.keyActivities} />
                  <Block className="md:row-span-2 md:col-start-3" title="Tawaran Nilai" value={selected.blocks?.valuePropositions} score={selected.analysis?.scores?.valuePropositions} />
                  <Block className="md:row-start-1 md:col-start-4" title="Hubungan dengan Pelanggan" value={selected.blocks?.customerRelationships} score={selected.analysis?.scores?.customerRelationships} />
                  <Block className="md:row-span-2 md:col-start-5" title="Segmen Pelanggan" value={selected.blocks?.customerSegments} score={selected.analysis?.scores?.customerSegments} />

                  <Block className="md:col-start-2 md:row-start-2" title="Sumber Utama" value={selected.blocks?.keyResources} score={selected.analysis?.scores?.keyResources} />
                  <Block className="md:col-start-4 md:row-start-2" title="Saluran" value={selected.blocks?.channels} score={selected.analysis?.scores?.channels} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Block title="Struktur Kos" value={selected.blocks?.costStructure} score={selected.analysis?.scores?.costStructure} />
                  <Block title="Aliran Pendapatan" value={selected.blocks?.revenueStreams} score={selected.analysis?.scores?.revenueStreams} />
                </div>
              </div>

              {/* Tips AI */}
              {selected.analysis ? (
                <div className="space-y-3">
                  <div className="text-sm font-semibold">Tips & Penambahbaikan (AI) — termasuk contoh aplikasi di Sabah</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    {Object.entries(selected.analysis.tips || {}).map(([k, v]) => (
                      <div key={k} className="p-3 border rounded-md bg-gray-50">
                        <div className="text-xs text-gray-500 mb-1">{labelFor(k)}</div>
                        <div className="text-gray-700 whitespace-pre-line">{v}</div>
                      </div>
                    ))}
                  </div>
                  {(selected.analysis.strengths || selected.analysis.weaknesses) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="p-3 border rounded-md bg-white">
                        <div className="font-medium mb-1">Kekuatan</div>
                        <div className="text-gray-700 whitespace-pre-line">{selected.analysis.strengths}</div>
                      </div>
                      <div className="p-3 border rounded-md bg-white">
                        <div className="font-medium mb-1">Kelemahan</div>
                        <div className="text-gray-700 whitespace-pre-line">{selected.analysis.weaknesses}</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const BMC_CONFIG = {
  'Rakan Kongsi Utama': { icon: '🤝', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', header: 'bg-blue-100' },
  'Aktiviti Utama': { icon: '⚡', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', header: 'bg-purple-100' },
  'Sumber Utama': { icon: '🏭', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', header: 'bg-indigo-100' },
  'Tawaran Nilai': { icon: '🎁', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', header: 'bg-emerald-100' },
  'Hubungan dengan Pelanggan': { icon: '❤️', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800', header: 'bg-pink-100' },
  'Saluran': { icon: '🚚', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', header: 'bg-orange-100' },
  'Segmen Pelanggan': { icon: '👥', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-800', header: 'bg-cyan-100' },
  'Struktur Kos': { icon: '💰', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', header: 'bg-red-100' },
  'Aliran Pendapatan': { icon: '💵', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', header: 'bg-green-100' },
};

function Block({ title, value, score, className = '' }) {
  const config = BMC_CONFIG[title] || { icon: '📋', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', header: 'bg-gray-100' };
  return (
    <div className={`relative p-3 border-2 rounded-lg shadow-sm min-h-[120px] ${config.bg} ${config.border} ${className}`}>
      <div className={`${config.header} ${config.text} px-2 py-1.5 rounded mb-2 flex items-center gap-2 pr-10`}>
        <span className="text-lg">{config.icon}</span>
        <span className="font-semibold text-sm">{title}</span>
        {typeof score === 'number' ? (
          <div className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary-600 text-white">{score.toFixed(1)}/10</div>
        ) : null}
      </div>
      <div className={`text-sm ${config.text} whitespace-pre-line`}>{value || '-'}</div>
    </div>
  );
}

function labelFor(key) {
  const map = {
    keyPartners: 'Key Partners',
    keyActivities: 'Key Activities',
    keyResources: 'Key Resources',
    valuePropositions: 'Value Propositions',
    customerRelationships: 'Customer Relationships',
    channels: 'Channels',
    customerSegments: 'Customer Segments',
    costStructure: 'Cost Structure',
    revenueStreams: 'Revenue Streams',
  };
  return map[key] || key;
}


