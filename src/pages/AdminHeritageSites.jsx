import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminGuard from '../components/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Upload, MapPin, CheckCircle, AlertCircle, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_FORM = {
  name: '', address: '', latitude: '', longitude: '', radius: 200,
  year_established: '', ar_fact: '', color: '#4f46e5',
  is_free: false, category: 'landmark', image_url: ''
};

export default function AdminHeritageSites() {
  const [showForm, setShowForm] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const queryClient = useQueryClient();

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['heritage-sites'],
    queryFn: () => base44.entities.HeritageSite.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editingSite
      ? base44.entities.HeritageSite.update(editingSite.id, data)
      : base44.entities.HeritageSite.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heritage-sites'] });
      setShowForm(false);
      setEditingSite(null);
      setFormData(EMPTY_FORM);
      toast.success(editingSite ? 'Site updated' : 'Site created');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HeritageSite.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heritage-sites'] });
      toast.success('Site deleted');
    }
  });

  const handleEdit = (site) => {
    setEditingSite(site);
    setFormData({ ...EMPTY_FORM, ...site });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radius: parseInt(formData.radius),
    });
  };

  const handleCsvImport = async () => {
    if (!csvFile) return;
    setImporting(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: csvFile });
    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" }, address: { type: "string" },
                latitude: { type: "number" }, longitude: { type: "number" },
                radius: { type: "number" }, year_established: { type: "string" },
                ar_fact: { type: "string" }, color: { type: "string" },
                is_free: { type: "boolean" }, category: { type: "string" }
              }
            }
          }
        }
      }
    });
    if (result.status === 'success' && result.output?.items) {
      await Promise.all(result.output.items.map(s => base44.entities.HeritageSite.create(s)));
      queryClient.invalidateQueries({ queryKey: ['heritage-sites'] });
      toast.success(`Imported ${result.output.items.length} sites`);
      setCsvFile(null);
    } else {
      toast.error('Failed to import CSV');
    }
    setImporting(false);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Heritage Sites</h1>
              <p className="text-gray-500 mt-1">Manage AR heritage sites — updated monthly</p>
            </div>
            <Button onClick={() => { setEditingSite(null); setFormData(EMPTY_FORM); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />Add Site
            </Button>
          </div>

          {/* CSV Import */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Monthly CSV Import</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4 flex-wrap">
              <input
                type="file" accept=".csv"
                onChange={e => setCsvFile(e.target.files[0])}
                className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-sm file:font-medium"
              />
              <Button onClick={handleCsvImport} disabled={!csvFile || importing} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                {importing ? 'Importing…' : 'Import CSV'}
              </Button>
            </CardContent>
          </Card>

          {/* Form */}
          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingSite ? 'Edit Site' : 'New Heritage Site'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Name *</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Address</Label>
                    <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Latitude *</Label>
                    <Input type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Longitude *</Label>
                    <Input type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Trigger Radius (m)</Label>
                    <Input type="number" value={formData.radius} onChange={e => setFormData({...formData, radius: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Year Established</Label>
                    <Input value={formData.year_established} onChange={e => setFormData({...formData, year_established: e.target.value})} placeholder="e.g. 1776" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>AR Fact (shown in overlay)</Label>
                    <Textarea value={formData.ar_fact} onChange={e => setFormData({...formData, ar_fact: e.target.value})} className="h-20" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['church','civic','underground_railroad','cultural','education','landmark'].map(c => (
                          <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Overlay Color</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="h-9 w-12 rounded border cursor-pointer" />
                      <Input value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2 flex items-center gap-3">
                    <input type="checkbox" id="is_free" checked={formData.is_free} onChange={e => setFormData({...formData, is_free: e.target.checked})} className="w-4 h-4" />
                    <Label htmlFor="is_free">Free (no Elite membership required)</Label>
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                      {saveMutation.isPending ? 'Saving…' : (editingSite ? 'Update Site' : 'Create Site')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingSite(null); }}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Sites list */}
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-gray-200 animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {sites.map(site => (
                <Card key={site.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: site.color || '#4f46e5' }} />
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{site.name}</div>
                    <div className="text-xs text-gray-400 truncate">{site.address}</div>
                  </div>
                  <Badge className={site.is_free ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                    {site.is_free ? 'Free' : 'Elite'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(site)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => deleteMutation.mutate(site.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}