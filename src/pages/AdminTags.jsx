import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Upload, Plus, Trash2, CheckCircle, AlertCircle, Tag } from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';

export default function AdminTags() {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [newTag, setNewTag] = useState({ tag_id: '', site_name: '', address: '', description: '', tag_type: 'qr_code', reward_points: 10 });
  const [saving, setSaving] = useState(false);

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['location-tags'],
    queryFn: () => base44.entities.LocationTag.list('-created_date', 200),
  });

  const handleCSVImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
      }).filter(r => r.tag_id);

      let success = 0, failed = 0;
      for (const row of rows) {
        try {
          await base44.entities.LocationTag.create({
            tag_id: row.tag_id,
            site_name: row.site_name || row.name || '',
            address: row.address || '',
            description: row.description || row.fact || '',
            tag_type: row.tag_type || 'qr_code',
            reward_points: parseInt(row.reward_points || row.points || '10') || 10,
            latitude: parseFloat(row.latitude || row.lat || '0') || undefined,
            longitude: parseFloat(row.longitude || row.lng || row.lon || '0') || undefined,
            is_active: row.is_active !== 'false',
          });
          success++;
        } catch (_) { failed++; }
      }
      setImportResult({ success, failed });
      qc.invalidateQueries({ queryKey: ['location-tags'] });
    } catch (err) {
      setImportResult({ error: err.message });
    }
    setImporting(false);
    e.target.value = '';
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTag.tag_id || !newTag.site_name) return;
    setSaving(true);
    await base44.entities.LocationTag.create({ ...newTag, is_active: true });
    qc.invalidateQueries({ queryKey: ['location-tags'] });
    setNewTag({ tag_id: '', site_name: '', address: '', description: '', tag_type: 'qr_code', reward_points: 10 });
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.LocationTag.delete(id);
    qc.invalidateQueries({ queryKey: ['location-tags'] });
  };

  const handleToggle = async (tag) => {
    await base44.entities.LocationTag.update(tag.id, { is_active: !tag.is_active });
    qc.invalidateQueries({ queryKey: ['location-tags'] });
  };

  return (
    <AdminGuard>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Tag className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tag & Barcode Manager</h1>
            <p className="text-sm text-gray-500">{tags.length} tags total</p>
          </div>
        </div>

        {/* CSV Import */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2"><Upload className="w-4 h-4" />Import CSV</h2>
          <p className="text-xs text-gray-400 mb-3">Columns: <code className="bg-gray-100 px-1 rounded">tag_id, site_name, address, description, tag_type, reward_points, latitude, longitude</code></p>
          <input type="file" accept=".csv" ref={fileRef} className="hidden" onChange={handleCSVImport} />
          <Button onClick={() => fileRef.current?.click()} disabled={importing} variant="outline" className="rounded-xl">
            <Upload className="w-4 h-4 mr-2" />{importing ? 'Importing…' : 'Choose CSV File'}
          </Button>
          {importResult && (
            <div className={`mt-3 flex items-center gap-2 text-sm px-4 py-2 rounded-xl ${importResult.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {importResult.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              {importResult.error || `${importResult.success} imported, ${importResult.failed} failed`}
            </div>
          )}
        </div>

        {/* Add single tag */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Plus className="w-4 h-4" />Add Single Tag</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Tag ID (e.g. FT-0001)*" value={newTag.tag_id} onChange={e => setNewTag({ ...newTag, tag_id: e.target.value })} required />
            <Input placeholder="Site Name*" value={newTag.site_name} onChange={e => setNewTag({ ...newTag, site_name: e.target.value })} required />
            <Input placeholder="Address" value={newTag.address} onChange={e => setNewTag({ ...newTag, address: e.target.value })} />
            <select
              value={newTag.tag_type}
              onChange={e => setNewTag({ ...newTag, tag_type: e.target.value })}
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="qr_code">QR Code</option>
              <option value="barcode">Barcode</option>
              <option value="airtag">AirTag</option>
            </select>
            <Input placeholder="Description / Historical fact" value={newTag.description} onChange={e => setNewTag({ ...newTag, description: e.target.value })} className="sm:col-span-2" />
            <Input type="number" placeholder="Reward points (default 10)" value={newTag.reward_points} onChange={e => setNewTag({ ...newTag, reward_points: parseInt(e.target.value) || 10 })} />
            <Button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 sm:col-span-2">
              <Plus className="w-4 h-4 mr-2" />{saving ? 'Saving…' : 'Add Tag'}
            </Button>
          </form>
        </div>

        {/* Tags list */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">All Tags</h2>
          </div>
          {isLoading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : tags.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <QrCode className="w-10 h-10 mx-auto mb-2 opacity-40" />
              No tags yet. Import a CSV or add one above.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {tags.map(tag => (
                <div key={tag.id} className="flex items-center gap-3 px-6 py-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tag.is_active ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    <QrCode className={`w-4 h-4 ${tag.is_active ? 'text-indigo-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{tag.site_name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span className="font-mono">{tag.tag_id}</span>
                      <span>·</span>
                      <span>{tag.tag_type}</span>
                      <span>·</span>
                      <span>{tag.reward_points || 10} pts</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(tag)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium mr-2 ${tag.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {tag.is_active ? 'Active' : 'Off'}
                  </button>
                  <button onClick={() => handleDelete(tag.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}