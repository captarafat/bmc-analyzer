import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getDefaultSessionId, saveEntry } from '../../../lib/db';

const BLOCK_KEYS = [
  'keyPartners',
  'keyActivities',
  'keyResources',
  'valuePropositions',
  'customerRelationships',
  'channels',
  'customerSegments',
  'costStructure',
  'revenueStreams',
];

function buildPrompt(payload) {
  const {
    studentName,
    businessIdea,
    blocks
  } = payload;

  return `Anda ialah penilai BMC yang SANGAT TEGAS dan OBJEKTIF. Jawab dalam Bahasa Malaysia.
PERATURAN WAJIB:
- Jangan mereka-reka maklumat baharu. Nilai HANYA berdasarkan input pelajar.
- Jika sesuatu blok kosong/umum/pendek (< 5 perkataan) atau mengandungi placeholder (cth. "N/A", "-", "tak pasti"), beri skor 0 dan jelaskan sebab.
- Jika wujud percanggahan logik antara blok (contoh: segmen pelanggan tak sepadan dengan saluran), tolak markah sewajarnya dan sebutkan dalam tips.
- Skor setiap blok berada dalam julat 0–10 dan boleh mengandungi sehingga 1 tempat perpuluhan (cth. 7.5). 0 = kosong/tak relevan, 5 = sederhana, 10 = jelas, spesifik dan boleh dilaksana.
- Beri tips ringkas, spesifik dan boleh tindakan (maks 2-3 poin) dalam BM.
- Skor keseluruhan bukan purata buta; ia menilai koheren keseluruhan, kebolehlaksanaan dan kesepadanan antara blok.

KEPERLUAN TAMBAHAN UNTUK TIPS:
- Berikan cadangan MENDALAM dengan contoh aplikasi konteks Sabah (cth. Kota Kinabalu, Sandakan, Tawau, Kudat, Ranau/Kundasang) sekurang-kurangnya satu contoh setiap blok.
- Jika sesuai, sertakan anggaran ringkas/angka contoh (cth. julat harga, kadar komisen, kos logistik KK↔Sandakan) bagi menjadikan cadangan lebih praktikal.
- Gaya tips: bullet pendek 2–4 poin; setiap blok sekurang-kurangnya satu poin bermula dengan "Contoh di Sabah:".

Pulangkan output DALAM FORMAT JSON SAHAJA, ikut struktur:
{
  "scores": {
    "keyPartners": 0-10,
    "keyActivities": 0-10,
    "keyResources": 0-10,
    "valuePropositions": 0-10,
    "customerRelationships": 0-10,
    "channels": 0-10,
    "customerSegments": 0-10,
    "costStructure": 0-10,
    "revenueStreams": 0-10
  },
  "tips": {
    "keyPartners": "- ...\n- Contoh di Sabah: ...",
    "keyActivities": "- ...\n- Contoh di Sabah: ...",
    "keyResources": "- ...\n- Contoh di Sabah: ...",
    "valuePropositions": "- ...\n- Contoh di Sabah: ...",
    "customerRelationships": "- ...\n- Contoh di Sabah: ...",
    "channels": "- ...\n- Contoh di Sabah: ...",
    "customerSegments": "- ...\n- Contoh di Sabah: ...",
    "costStructure": "- ...\n- Contoh di Sabah: ...",
    "revenueStreams": "- ...\n- Contoh di Sabah: ..."
  },
  "overallScore": 0-10,
  "strengths": "2-4 ayat tentang kekuatan (spesifik, elak umum)",
  "weaknesses": "2-4 ayat tentang kelemahan (nyatakan jurang/andaian)"
}

Rubrik ringkas setiap blok:
- Key Partners: rakan kritikal yang nyata (syarikat/pihak); elak umum seperti "rakan strategik" tanpa contoh.
- Key Activities: aktiviti boleh tindakan yang menyampaikan nilai; ukur spesifik + kebaruan.
- Key Resources: aset kritikal (manusia/teknologi/kewangan); sebut peranan/alat.
- Value Propositions: masalah pelanggan + manfaat unik; elak buzzword kosong.
- Customer Relationships: saluran sokongan/automasi/komuniti yang sesuai dengan segmen.
- Channels: saluran capai pelanggan yang realistik dan konsisten dengan segmen.
- Customer Segments: persona/segmen jelas; elak "semua orang".
- Cost Structure: kos utama yang selari dengan aktiviti/sumber.
- Revenue Streams: mekanisme hasil yang padan dengan nilai & segmen.

Maklumat pelajar:
- Nama Pelajar: ${studentName}
- Idea Perniagaan: ${businessIdea}

Kandungan BMC (ringkaskan dan nilai):
${BLOCK_KEYS.map((k) => `- ${k}: ${blocks?.[k] || ''}`).join('\n')}
`;
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (_e) {
    // cuba potong kandungan bukan JSON
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch (_e2) {
        return null;
      }
    }
    return null;
  }
}

function mockAnalysis() {
  const scores = Object.fromEntries(BLOCK_KEYS.map((k) => [k, Math.floor(6 + Math.random() * 4)]));
  const tips = Object.fromEntries(
    BLOCK_KEYS.map((k) => [k, `Perincikan lagi bahagian ${k} dengan contoh yang spesifik.`])
  );
  return {
    scores,
    tips,
    overallScore: Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / BLOCK_KEYS.length),
    strengths: 'Struktur asas BMC jelas dan selari dengan idea perniagaan.',
    weaknesses: 'Perlu penjelasan lebih mendalam dari segi saluran dan segmen pelanggan.',
    _mock: true,
  };
}

export async function POST(request) {
  const body = await request.json();
  const { studentName, businessIdea, blocks, sessionId } = body || {};

  if (!studentName || !businessIdea || !blocks) {
    return NextResponse.json({ error: 'Input tidak lengkap.' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  let result;
  let provider = 'mock';
  let errorMsg = '';

  if (!apiKey) {
    result = mockAnalysis();
  } else {
    const openai = new OpenAI({ apiKey });
    const prompt = buildPrompt({ studentName, businessIdea, blocks });
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Anda ialah penilai BMC yang tegas tetapi membantu.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      });
      const text = completion.choices?.[0]?.message?.content || '';
      const parsed = safeParseJSON(text);
      if (!parsed) {
        result = mockAnalysis();
        provider = 'mock';
      } else {
        result = parsed;
        provider = 'openai';
      }
    } catch (e) {
      result = mockAnalysis();
      provider = 'mock';
      errorMsg = String(e?.message || 'OpenAI request failed');
    }
  }

  // Jamin struktur minimum dengan 1 tempat perpuluhan
  const toOneDecimal = (n) => {
    const x = Number(n);
    if (Number.isNaN(x)) return 0;
    const c = Math.max(0, Math.min(10, x));
    return Math.round(c * 10) / 10;
  };
  const safeScores = Object.fromEntries(
    BLOCK_KEYS.map((k) => [k, toOneDecimal(result?.scores?.[k])])
  );
  const overall = toOneDecimal(result?.overallScore);
  const response = {
    scores: safeScores,
    tips: result?.tips || Object.fromEntries(BLOCK_KEYS.map((k) => [k, ''])),
    overallScore: overall,
    strengths: result?.strengths || '',
    weaknesses: result?.weaknesses || '',
    provider,
    _error: errorMsg,
  };

  // Simpan ke database
  try {
    const sid = sessionId || await getDefaultSessionId();
    const createdAt = Date.now();
    
    const entryId = await saveEntry(sid, {
      name: String(studentName),
      idea: String(businessIdea),
      score: overall,
      blocks,
      analysis: response,
      at: createdAt,
    });
    
    if (!entryId) {
      console.error('Failed to save entry - Redis may not be configured');
    } else {
      console.log(`Successfully saved entry ${entryId} for ${studentName}`);
    }
  } catch (dbError) {
    console.error('Database save error:', dbError);
    console.error('Error details:', {
      message: dbError.message,
      stack: dbError.stack,
      studentName,
    });
    // Continue - don't fail the request if DB fails, but log it
  }

  return NextResponse.json(response);
}
