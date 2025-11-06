'use client';

const BMC_CONFIG = {
  keyPartners: {
    icon: '🤝',
    title: 'Rakan Kongsi Utama',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    headerBg: 'bg-blue-100',
  },
  keyActivities: {
    icon: '⚡',
    title: 'Aktiviti Utama',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    headerBg: 'bg-purple-100',
  },
  keyResources: {
    icon: '🏭',
    title: 'Sumber Utama',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-800',
    headerBg: 'bg-indigo-100',
  },
  valuePropositions: {
    icon: '🎁',
    title: 'Tawaran Nilai',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    headerBg: 'bg-emerald-100',
  },
  customerRelationships: {
    icon: '❤️',
    title: 'Hubungan dengan Pelanggan',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-800',
    headerBg: 'bg-pink-100',
  },
  channels: {
    icon: '🚚',
    title: 'Saluran',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    headerBg: 'bg-orange-100',
  },
  customerSegments: {
    icon: '👥',
    title: 'Segmen Pelanggan',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-800',
    headerBg: 'bg-cyan-100',
  },
  costStructure: {
    icon: '💰',
    title: 'Struktur Kos',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    headerBg: 'bg-red-100',
  },
  revenueStreams: {
    icon: '💵',
    title: 'Aliran Pendapatan',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    headerBg: 'bg-green-100',
  },
};

function BmcBlock({ blockKey, value, onChange, placeholder, minHeight = '120px', className = '' }) {
  const config = BMC_CONFIG[blockKey];
  return (
    <div className={`p-3 border-2 rounded-lg shadow-sm ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className={`${config.headerBg} ${config.textColor} px-2 py-1.5 rounded mb-2 flex items-center gap-2`}>
        <span className="text-lg">{config.icon}</span>
        <span className="font-semibold text-sm">{config.title}</span>
      </div>
      <textarea
        className={`w-full border ${config.borderColor} p-2 rounded mt-2 text-sm ${config.bgColor} focus:ring-2 focus:ring-offset-1`}
        style={{ minHeight }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default function BmcCanvas({ blocks, setBlocks }) {
  return (
    <div className="space-y-4">
      {/* Kawasan atas + baris kecil digabungkan dalam 1 grid 2-baris */}
      <div className="grid grid-cols-1 md:grid-cols-5 md:grid-rows-2 md:auto-rows-fr gap-4">
        {/* Col 1 - span dua baris */}
        <BmcBlock
          blockKey="keyPartners"
          value={blocks.keyPartners}
          onChange={(v) => setBlocks({ ...blocks, keyPartners: v })}
          placeholder="Rakan utama dan pembekal"
          minHeight="220px"
          className="md:row-span-2 h-full"
        />
        {/* Col 2 - baris atas */}
        <BmcBlock
          blockKey="keyActivities"
          value={blocks.keyActivities}
          onChange={(v) => setBlocks({ ...blocks, keyActivities: v })}
          placeholder="Aktiviti teras"
          minHeight="140px"
          className="md:row-start-1 md:col-start-2 h-full"
        />
        {/* Col 3 - span dua baris */}
        <BmcBlock
          blockKey="valuePropositions"
          value={blocks.valuePropositions}
          onChange={(v) => setBlocks({ ...blocks, valuePropositions: v })}
          placeholder="Nilai unik kepada pelanggan"
          minHeight="220px"
          className="md:row-span-2 md:col-start-3 h-full"
        />
        {/* Col 4 - baris atas */}
        <BmcBlock
          blockKey="customerRelationships"
          value={blocks.customerRelationships}
          onChange={(v) => setBlocks({ ...blocks, customerRelationships: v })}
          placeholder="Jenis hubungan dengan pelanggan"
          minHeight="140px"
          className="md:row-start-1 md:col-start-4 h-full"
        />
        {/* Col 5 - span dua baris */}
        <BmcBlock
          blockKey="customerSegments"
          value={blocks.customerSegments}
          onChange={(v) => setBlocks({ ...blocks, customerSegments: v })}
          placeholder="Segmen pelanggan sasaran"
          minHeight="220px"
          className="md:row-span-2 md:col-start-5 h-full"
        />
        {/* Resources di bawah Activities (col 2, row 2) */}
        <BmcBlock
          blockKey="keyResources"
          value={blocks.keyResources}
          onChange={(v) => setBlocks({ ...blocks, keyResources: v })}
          placeholder="Sumber utama (manusia, teknologi, kewangan)"
          minHeight="140px"
          className="md:col-start-2 md:row-start-2 h-full"
        />
        {/* Channels di bawah Relationships (col 4, row 2) */}
        <BmcBlock
          blockKey="channels"
          value={blocks.channels}
          onChange={(v) => setBlocks({ ...blocks, channels: v })}
          placeholder="Saluran capai pelanggan"
          minHeight="140px"
          className="md:col-start-4 md:row-start-2 h-full"
        />
      </div>

      {/* Baris bawah: 2 kolum sama besar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BmcBlock
          blockKey="costStructure"
          value={blocks.costStructure}
          onChange={(v) => setBlocks({ ...blocks, costStructure: v })}
          placeholder="Kos utama dalam model"
        />
        <BmcBlock
          blockKey="revenueStreams"
          value={blocks.revenueStreams}
          onChange={(v) => setBlocks({ ...blocks, revenueStreams: v })}
          placeholder="Aliran hasil utama"
        />
      </div>
    </div>
  );
}
