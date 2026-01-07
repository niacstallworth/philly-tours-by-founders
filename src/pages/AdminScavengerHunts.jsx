import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Trash2, Plus, MapPin, CheckCircle, AlertCircle, Edit, Palette } from 'lucide-react';
import ScavengerHuntEditor from '../components/admin/ScavengerHuntEditor';
import HuntThemeEditor from '../components/admin/HuntThemeEditor';

export default function AdminScavengerHunts() {
  const [pdfFile, setPdfFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null);
  const [huntName, setHuntName] = useState('');
  const [editingStop, setEditingStop] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: stops, isLoading } = useQuery({
    queryKey: ['allScavengerStops'],
    queryFn: () => base44.entities.ScavengerHuntStop.list('stop_number'),
    initialData: []
  });

  const { data: themes } = useQuery({
    queryKey: ['huntThemes'],
    queryFn: () => base44.entities.HuntTheme.list(),
    initialData: []
  });

  // Group stops by hunt name
  const huntGroups = stops.reduce((acc, stop) => {
    if (!acc[stop.hunt_name]) acc[stop.hunt_name] = [];
    acc[stop.hunt_name].push(stop);
    return acc;
  }, {});

  const deleteStopMutation = useMutation({
    mutationFn: (id) => base44.entities.ScavengerHuntStop.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allScavengerStops'] });
      setStatus({ type: 'success', message: 'Stop deleted successfully' });
    }
  });

  const deleteHuntMutation = useMutation({
    mutationFn: async (huntName) => {
      const huntStops = stops.filter(s => s.hunt_name === huntName);
      for (const stop of huntStops) {
        await base44.entities.ScavengerHuntStop.delete(stop.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allScavengerStops'] });
      setStatus({ type: 'success', message: 'Hunt deleted successfully' });
    }
  });

  const createStopsMutation = useMutation({
    mutationFn: (stopsData) => base44.entities.ScavengerHuntStop.bulkCreate(stopsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allScavengerStops'] });
      setStatus({ type: 'success', message: 'Scavenger hunt imported successfully!' });
      setPdfFile(null);
      setHuntName('');
    }
  });

  const updateStopMutation = useMutation({
    mutationFn: ({ id, data }) => 
      id ? base44.entities.ScavengerHuntStop.update(id, data) : base44.entities.ScavengerHuntStop.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allScavengerStops'] });
      setStatus({ type: 'success', message: 'Stop saved successfully!' });
    }
  });

  const saveThemeMutation = useMutation({
    mutationFn: async (themeData) => {
      const existing = themes.find(t => t.hunt_name === themeData.hunt_name);
      if (existing) {
        return base44.entities.HuntTheme.update(existing.id, themeData);
      }
      return base44.entities.HuntTheme.create(themeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['huntThemes'] });
      setStatus({ type: 'success', message: 'Theme saved successfully!' });
    }
  });

  const handlePdfImport = async () => {
    if (!pdfFile || !huntName.trim()) {
      setStatus({ type: 'error', message: 'Please provide both a hunt name and PDF file' });
      return;
    }

    setIsProcessing(true);
    setStatus(null);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: pdfFile });

      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            stops: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  stop_number: { type: "integer" },
                  title: { type: "string" },
                  clue: { type: "string" },
                  address: { type: "string" },
                  latitude: { type: "number" },
                  longitude: { type: "number" },
                  fact: { type: "string" },
                  is_bonus: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      if (result.status === 'success' && result.output?.stops) {
        const stopsData = result.output.stops.map(stop => ({
          hunt_name: huntName.trim(),
          stop_number: stop.stop_number,
          title: stop.title,
          clue: stop.clue || '',
          location: {
            latitude: stop.latitude || 39.9526,
            longitude: stop.longitude || -75.1652,
            address: stop.address || ''
          },
          radius: 50,
          fact: stop.fact || '',
          is_bonus: stop.is_bonus || false
        }));

        createStopsMutation.mutate(stopsData);
      } else {
        setStatus({ type: 'error', message: result.details || 'Failed to extract data from PDF' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to process PDF' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Scavenger Hunts</h1>
          <p className="text-gray-600 mt-2">Import, view, and delete scavenger hunts</p>
        </div>

        {status && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{status.message}</span>
          </div>
        )}

        <Tabs defaultValue="import" className="space-y-6">
          <TabsList>
            <TabsTrigger value="import">Import Hunt</TabsTrigger>
            <TabsTrigger value="manage">Manage Hunts ({Object.keys(huntGroups).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Import Scavenger Hunt from PDF
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="huntName">Hunt Name *</Label>
                  <Input
                    id="huntName"
                    value={huntName}
                    onChange={(e) => setHuntName(e.target.value)}
                    placeholder="e.g., Masonic Philadelphia: Secrets in the Stone"
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <Label htmlFor="pdf-upload" className="cursor-pointer">
                    <div className="text-lg font-medium text-gray-700 mb-2">
                      {pdfFile ? pdfFile.name : 'Click to upload PDF'}
                    </div>
                    <p className="text-sm text-gray-500">Upload a PDF with scavenger hunt stops</p>
                  </Label>
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    className="hidden"
                  />
                </div>

                <Button
                  onClick={handlePdfImport}
                  disabled={!pdfFile || !huntName.trim() || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Processing PDF...' : 'Import Scavenger Hunt'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            {Object.keys(huntGroups).length === 0 ? (
              <Card className="p-12 text-center">
                <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No scavenger hunts yet. Import one to get started!</p>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(huntGroups).map(([name, huntStops]) => (
                  <Card key={name}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>{name}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{huntStops.length} stops</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const theme = themes.find(t => t.hunt_name === name);
                            setEditingTheme({ hunt_name: name, ...theme });
                            setIsThemeEditorOpen(true);
                          }}
                        >
                          <Palette className="w-4 h-4 mr-2" />
                          Theme
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingStop({ hunt_name: name, stop_number: huntStops.length + 1 });
                            setIsEditorOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Stop
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Delete entire hunt "${name}" and all its stops?`)) {
                              deleteHuntMutation.mutate(name);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Hunt
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {huntStops.sort((a, b) => a.stop_number - b.stop_number).map((stop) => (
                          <div key={stop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                                {stop.stop_number}
                              </span>
                              <div>
                                <p className="font-medium">{stop.title}</p>
                                <p className="text-xs text-gray-500">{stop.location?.address}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingStop(stop);
                                  setIsEditorOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteStopMutation.mutate(stop.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <ScavengerHuntEditor
          stop={editingStop}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingStop(null);
          }}
          onSave={(stopData) => {
            updateStopMutation.mutate({
              id: editingStop?.id,
              data: stopData
            });
          }}
        />

        <HuntThemeEditor
          hunt={editingTheme}
          isOpen={isThemeEditorOpen}
          onClose={() => {
            setIsThemeEditorOpen(false);
            setEditingTheme(null);
          }}
          onSave={(themeData) => {
            saveThemeMutation.mutate(themeData);
          }}
        />
      </div>
    </div>
  );
}