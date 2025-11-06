'use client';

export default function BmcCanvas({ blocks, setBlocks }) {
  return (
    <div className="space-y-4">
      {/* Kawasan atas + baris kecil digabungkan dalam 1 grid 2-baris */}
      <div className="grid grid-cols-1 md:grid-cols-5 md:grid-rows-2 md:auto-rows-fr gap-4">
        {/* Col 1 - span dua baris */}
        <div className="p-3 border rounded-lg bg-white shadow-sm md:row-span-2 h-full">
          <div className="font-semibold text-gray-700">Rakan Kongsi Utama</div>
          <textarea
            className="w-full border p-2 rounded mt-2 text-sm min-h-[220px] md:min-h-[320px] lg:min-h-[380px]"
            value={blocks.keyPartners}
            onChange={(e) => setBlocks({ ...blocks, keyPartners: e.target.value })}
            placeholder="Rakan utama dan pembekal"
          />
        </div>
        {/* Col 2 - baris atas */}
        <div className="p-3 border rounded-lg bg-white shadow-sm md:row-start-1 md:col-start-2 h-full">
          <div className="font-semibold text-gray-700">Aktiviti Utama</div>
          <textarea
            className="w-full border p-2 rounded mt-2 text-sm min-h-[140px] md:min-h-[180px]"
            value={blocks.keyActivities}
            onChange={(e) => setBlocks({ ...blocks, keyActivities: e.target.value })}
            placeholder="Aktiviti teras"
          />
        </div>
        {/* Col 3 - span dua baris */}
        <div className="p-3 border rounded-lg bg-white shadow-sm md:row-span-2 md:col-start-3 h-full">
          <div className="font-semibold text-gray-700">Tawaran Nilai</div>
          <textarea
            className="w-full border p-2 rounded mt-2 text-sm min-h-[220px] md:min-h-[320px] lg:min-h-[380px]"
            value={blocks.valuePropositions}
            onChange={(e) => setBlocks({ ...blocks, valuePropositions: e.target.value })}
            placeholder="Nilai unik kepada pelanggan"
          />
        </div>
        {/* Col 4 - baris atas */}
        <div className="p-3 border rounded-lg bg-white shadow-sm md:row-start-1 md:col-start-4 h-full">
          <div className="font-semibold text-gray-700">Hubungan dengan Pelanggan</div>
          <textarea
            className="w-full border p-2 rounded mt-2 text-sm min-h-[140px] md:min-h-[180px]"
            value={blocks.customerRelationships}
            onChange={(e) => setBlocks({ ...blocks, customerRelationships: e.target.value })}
            placeholder="Jenis hubungan dengan pelanggan"
          />
        </div>
        {/* Col 5 - span dua baris */}
        <div className="p-3 border rounded-lg bg-white shadow-sm md:row-span-2 md:col-start-5 h-full">
          <div className="font-semibold text-gray-700">Segmen Pelanggan</div>
          <textarea
            className="w-full border p-2 rounded mt-2 text-sm min-h-[220px] md:min-h-[320px] lg:min-h-[380px]"
            value={blocks.customerSegments}
            onChange={(e) => setBlocks({ ...blocks, customerSegments: e.target.value })}
            placeholder="Segmen pelanggan sasaran"
          />
        </div>
        {/* Resources di bawah Activities (col 2, row 2) */}
        <div className="p-3 border rounded-lg bg-white shadow-sm md:col-start-2 md:row-start-2 h-full">
          <div className="font-semibold text-gray-700">Sumber Utama</div>
          <textarea
            className="w-full border p-2 rounded mt-2 text-sm min-h-[140px] md:min-h-[180px]"
            value={blocks.keyResources}
            onChange={(e) => setBlocks({ ...blocks, keyResources: e.target.value })}
            placeholder="Sumber utama (manusia, teknologi, kewangan)"
          />
        </div>
        {/* Channels di bawah Relationships (col 4, row 2) */}
        <div className="p-3 border rounded-lg bg-white shadow-sm md:col-start-4 md:row-start-2 h-full">
          <div className="font-semibold text-gray-700">Saluran</div>
          <textarea
            className="w-full border p-2 rounded mt-2 text-sm min-h-[140px] md:min-h-[180px]"
            value={blocks.channels}
            onChange={(e) => setBlocks({ ...blocks, channels: e.target.value })}
            placeholder="Saluran capai pelanggan"
          />
        </div>
      </div>

      {/* Baris bawah: 2 kolum sama besar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-3 border rounded-lg bg-white shadow-sm">
          <div className="font-semibold text-gray-700">Struktur Kos</div>
          <textarea
            className="w-full border p-2 rounded mt-2 text-sm"
            value={blocks.costStructure}
            onChange={(e) => setBlocks({ ...blocks, costStructure: e.target.value })}
            placeholder="Kos utama dalam model"
          />
        </div>
        <div className="p-3 border rounded-lg bg-white shadow-sm">
          <div className="font-semibold text-gray-700">Aliran Pendapatan</div>
          <textarea
            className="w-full border p-2 rounded mt-2 text-sm"
            value={blocks.revenueStreams}
            onChange={(e) => setBlocks({ ...blocks, revenueStreams: e.target.value })}
            placeholder="Aliran hasil utama"
          />
        </div>
      </div>
    </div>
  );
}


