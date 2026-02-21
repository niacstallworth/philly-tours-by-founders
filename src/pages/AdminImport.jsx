import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import TourLocationsCSV from '../components/TourLocationsCSV';
import AdminGuard from '../components/AdminGuard';

export default function AdminImport() {
  const [contentType, setContentType] = useState('tour');
  const [importMode, setImportMode] = useState('form');
  const [jsonData, setJsonData] = useState('');
  const [status, setStatus] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    duration: '',
    category: 'historical',
    difficulty: 'moderate',
    image_url: '',
    practical_notes: '',
    days_json: '',
    stops_json: ''
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => {
      if (contentType === 'tour') {
        return base44.entities.Tour.create(data);
      } else {
        return base44.entities.ScavengerHunt.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [contentType === 'tour' ? 'tours' : 'hunts'] });
      setStatus({ type: 'success', message: `${contentType === 'tour' ? 'Tour' : 'Hunt'} created successfully!` });
      setJsonData('');
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        duration: '',
        category: 'historical',
        difficulty: 'moderate',
        image_url: '',
        practical_notes: '',
        days_json: '',
        stops_json: ''
      });
    },
    onError: (error) => {
      setStatus({ type: 'error', message: error.message || `Failed to create ${contentType}` });
    }
  });

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonData);
      createMutation.mutate(parsed);
    } catch (error) {
      setStatus({ type: 'error', message: 'Invalid JSON format' });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    try {
      if (contentType === 'tour') {
        const tourData = {
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          duration: formData.duration,
          category: formData.category,
          image_url: formData.image_url,
          practical_notes: formData.practical_notes ? formData.practical_notes.split('\n').filter(n => n.trim()) : [],
          days: formData.days_json ? JSON.parse(formData.days_json) : []
        };
        createMutation.mutate(tourData);
      } else {
        const huntData = {
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          duration: formData.duration,
          difficulty: formData.difficulty,
          image_url: formData.image_url,
          stops: formData.stops_json ? JSON.parse(formData.stops_json) : []
        };
        createMutation.mutate(huntData);
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Invalid JSON format in itinerary/stops' });
    }
  };

  const handleCsvImport = async () => {
    if (!csvFile) return;
    
    setIsProcessingCsv(true);
    setStatus(null);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: csvFile });
      
      const schema = contentType === 'tour' ? {
        type: "object",
        properties: {
          title: { type: "string" },
          subtitle: { type: "string" },
          description: { type: "string" },
          duration: { type: "string" },
          category: { type: "string" },
          image_url: { type: "string" },
          practical_notes: { type: "array", items: { type: "string" } },
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day_number: { type: "integer" },
                title: { type: "string" },
                focus: { type: "string" },
                locations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      time: { type: "string" },
                      name: { type: "string" },
                      address: { type: "string" },
                      description: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      } : {
        type: "object",
        properties: {
          title: { type: "string" },
          subtitle: { type: "string" },
          description: { type: "string" },
          duration: { type: "string" },
          difficulty: { type: "string" },
          image_url: { type: "string" },
          stops: {
            type: "array",
            items: {
              type: "object",
              properties: {
                stop_number: { type: "integer" },
                name: { type: "string" },
                address: { type: "string" },
                latitude: { type: "number" },
                longitude: { type: "number" },
                clue: { type: "string" },
                description: { type: "string" }
              }
            }
          }
        }
      };

      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: schema
      });
      
      if (result.status === 'success' && result.output) {
        createMutation.mutate(result.output);
        setCsvFile(null);
      } else {
        setStatus({ type: 'error', message: result.details || 'Failed to extract data from CSV' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to process CSV' });
    } finally {
      setIsProcessingCsv(false);
    }
  };

  const handlePdfImport = async () => {
    if (!pdfFile) return;
    
    setIsProcessingPdf(true);
    setStatus(null);
    
    try {
      // Upload the PDF file
      const { file_url } = await base44.integrations.Core.UploadFile({ file: pdfFile });
      
      // Extract data from PDF
      const schema = contentType === 'tour' ? {
        type: "object",
        properties: {
          title: { type: "string" },
          subtitle: { type: "string" },
          description: { type: "string" },
          duration: { type: "string" },
          category: { type: "string" },
          image_url: { type: "string" },
          practical_notes: { type: "array", items: { type: "string" } },
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day_number: { type: "integer" },
                title: { type: "string" },
                focus: { type: "string" },
                locations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      time: { type: "string" },
                      name: { type: "string" },
                      address: { type: "string" },
                      description: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      } : {
        type: "object",
        properties: {
          title: { type: "string" },
          subtitle: { type: "string" },
          description: { type: "string" },
          duration: { type: "string" },
          difficulty: { type: "string" },
          image_url: { type: "string" },
          stops: {
            type: "array",
            items: {
              type: "object",
              properties: {
                stop_number: { type: "integer" },
                name: { type: "string" },
                address: { type: "string" },
                latitude: { type: "number" },
                longitude: { type: "number" },
                clue: { type: "string" },
                description: { type: "string" }
              }
            }
          }
        }
      };

      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: schema
      });
      
      if (result.status === 'success' && result.output) {
        createMutation.mutate(result.output);
        setPdfFile(null);
      } else {
        setStatus({ type: 'error', message: result.details || 'Failed to extract data from PDF' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to process PDF' });
    } finally {
      setIsProcessingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Import New Content</h1>
          <p className="text-gray-600 mt-2">Add tours or scavenger hunts to the app</p>
        </div>

        {/* Content Type Toggle */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={contentType === 'tour' ? 'default' : 'outline'}
            onClick={() => setContentType('tour')}
          >
            Tour
          </Button>
          <Button
            variant={contentType === 'hunt' ? 'default' : 'outline'}
            onClick={() => setContentType('hunt')}
          >
            Scavenger Hunt
          </Button>
        </div>

        <TourLocationsCSV />

        <TourLocationsCSV />

        {/* Mode Toggle */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={importMode === 'form' ? 'default' : 'outline'}
            onClick={() => setImportMode('form')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Form Entry
          </Button>
          <Button
            variant={importMode === 'json' ? 'default' : 'outline'}
            onClick={() => setImportMode('json')}
          >
            <Upload className="w-4 h-4 mr-2" />
            JSON Import
          </Button>
          <Button
            variant={importMode === 'pdf' ? 'default' : 'outline'}
            onClick={() => setImportMode('pdf')}
          >
            <Upload className="w-4 h-4 mr-2" />
            PDF Import
          </Button>
          <Button
            variant={importMode === 'csv' ? 'default' : 'outline'}
            onClick={() => setImportMode('csv')}
          >
            <Upload className="w-4 h-4 mr-2" />
            CSV Import
          </Button>
        </div>

        {/* Status Messages */}
        {status && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {/* CSV Import Mode */}
        {importMode === 'csv' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV {contentType === 'tour' ? 'Tour' : 'Hunt'} File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <Label htmlFor="csv-upload" className="cursor-pointer">
                  <div className="text-lg font-medium text-gray-700 mb-2">
                    {csvFile ? csvFile.name : 'Click to upload CSV'}
                  </div>
                  <p className="text-sm text-gray-500">
                    Upload a CSV file with {contentType === 'tour' ? 'tour' : 'hunt'} information
                  </p>
                </Label>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
              
              {csvFile && (
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
                  <p className="font-semibold mb-1">File selected: {csvFile.name}</p>
                  <p className="text-xs">The AI will extract {contentType} information from this CSV</p>
                </div>
              )}

              <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-900">
                <p className="font-semibold mb-2">CSV Format Tips:</p>
                <ul className="text-xs space-y-1 list-disc pl-4">
                  {contentType === 'tour' ? (
                    <>
                      <li>Include columns: title, subtitle, description, duration, category, image_url</li>
                      <li>For itinerary, use nested structure or separate columns for each day/location</li>
                      <li>Practical notes can be comma-separated in a single column</li>
                    </>
                  ) : (
                    <>
                      <li>Include columns: title, subtitle, description, duration, difficulty, image_url</li>
                      <li>For stops: stop_number, name, address, latitude, longitude, clue, description</li>
                      <li>GPS coordinates (latitude/longitude) are required for each stop</li>
                    </>
                  )}
                </ul>
              </div>
              
              <Button 
                onClick={handleCsvImport}
                disabled={!csvFile || isProcessingCsv || createMutation.isPending}
                className="w-full"
              >
                {isProcessingCsv ? 'Processing CSV...' : createMutation.isPending ? `Creating ${contentType}...` : `Extract & Import ${contentType === 'tour' ? 'Tour' : 'Hunt'}`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* PDF Import Mode */}
        {importMode === 'pdf' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload PDF {contentType === 'tour' ? 'Tour' : 'Hunt'} Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <Label htmlFor="pdf-upload" className="cursor-pointer">
                  <div className="text-lg font-medium text-gray-700 mb-2">
                    {pdfFile ? pdfFile.name : 'Click to upload PDF'}
                  </div>
                  <p className="text-sm text-gray-500">
                    Upload a PDF document with {contentType === 'tour' ? 'tour' : 'hunt'} information
                  </p>
                </Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
              
              {pdfFile && (
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
                  <p className="font-semibold mb-1">File selected: {pdfFile.name}</p>
                  <p className="text-xs">The AI will extract {contentType} information from this PDF</p>
                </div>
              )}
              
              <Button 
                onClick={handlePdfImport}
                disabled={!pdfFile || isProcessingPdf || createMutation.isPending}
                className="w-full"
              >
                {isProcessingPdf ? 'Processing PDF...' : createMutation.isPending ? `Creating ${contentType}...` : `Extract & Import ${contentType === 'tour' ? 'Tour' : 'Hunt'}`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* JSON Import Mode */}
        {importMode === 'json' && (
          <Card>
            <CardHeader>
              <CardTitle>Paste {contentType === 'tour' ? 'Tour' : 'Hunt'} JSON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder={contentType === 'tour' 
                  ? '{"title": "Tour Name", "subtitle": "...", "description": "...", "duration": "2 Days", "category": "historical", "image_url": "https://...", "practical_notes": ["..."], "days": [...]}'
                  : '{"title": "Hunt Name", "subtitle": "...", "description": "...", "duration": "2 hours", "difficulty": "moderate", "image_url": "https://...", "stops": [...]}'}
                className="font-mono text-sm h-96"
              />
              
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
                <p className="font-semibold mb-2">JSON Format Example:</p>
                <pre className="text-xs overflow-x-auto">
{contentType === 'tour' ? `{
  "title": "Tour Title",
  "subtitle": "Tour Subtitle",
  "description": "Tour description...",
  "duration": "2 Days",
  "category": "historical",
  "image_url": "https://images.unsplash.com/...",
  "practical_notes": ["Note 1", "Note 2"],
  "days": [
    {
      "day_number": 1,
      "title": "Day 1 Title",
      "focus": "Day focus",
      "locations": [
        {
          "time": "9:00 AM",
          "name": "Location Name",
          "address": "Address",
          "description": "Description..."
        }
      ]
    }
  ]
}` : `{
  "title": "Hunt Title",
  "subtitle": "Hunt Subtitle",
  "description": "Hunt description...",
  "duration": "2 hours",
  "difficulty": "moderate",
  "image_url": "https://images.unsplash.com/...",
  "stops": [
    {
      "stop_number": 1,
      "name": "Stop Name",
      "address": "123 Main St",
      "latitude": 39.9526,
      "longitude": -75.1652,
      "clue": "Find the place where...",
      "description": "Historical info..."
    }
  ]
}`}
                </pre>
              </div>
              
              <Button 
                onClick={handleJsonImport}
                disabled={createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? 'Importing...' : `Import ${contentType === 'tour' ? 'Tour' : 'Hunt'}`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Form Entry Mode */}
        {importMode === 'form' && (
          <form onSubmit={handleFormSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Create New {contentType === 'tour' ? 'Tour' : 'Scavenger Hunt'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    className="h-24"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder={contentType === 'tour' ? "e.g., 2 Days" : "e.g., 2 hours"}
                    />
                  </div>
                  
                  {contentType === 'tour' ? (
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={formData.category}
                        onValueChange={(value) => setFormData({...formData, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="historical">Historical</SelectItem>
                          <SelectItem value="cultural">Cultural</SelectItem>
                          <SelectItem value="educational">Educational</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select 
                        value={formData.difficulty}
                        onValueChange={(value) => setFormData({...formData, difficulty: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="challenging">Challenging</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {formData.image_url && (
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>
                
                {contentType === 'tour' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="practical_notes">Practical Notes (one per line)</Label>
                      <Textarea
                        id="practical_notes"
                        value={formData.practical_notes}
                        onChange={(e) => setFormData({...formData, practical_notes: e.target.value})}
                        placeholder="Best months: April–June&#10;Transportation: SEPTA&#10;Cost: $50-100"
                        className="h-24"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="days_json">Days & Itinerary (JSON)</Label>
                      <Textarea
                        id="days_json"
                        value={formData.days_json}
                        onChange={(e) => setFormData({...formData, days_json: e.target.value})}
                        placeholder='[{"day_number": 1, "title": "Day 1", "focus": "Theme", "locations": [{"time": "9:00 AM", "name": "Location", "address": "Address", "description": "..."}]}]'
                        className="font-mono text-sm h-48"
                      />
                      <p className="text-xs text-gray-500">
                        Paste the days array in JSON format
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="stops_json">Hunt Stops (JSON)</Label>
                    <Textarea
                      id="stops_json"
                      value={formData.stops_json}
                      onChange={(e) => setFormData({...formData, stops_json: e.target.value})}
                      placeholder='[{"stop_number": 1, "name": "Independence Hall", "address": "520 Chestnut St", "latitude": 39.9489, "longitude": -75.1500, "clue": "Where liberty was born...", "description": "..."}]'
                      className="font-mono text-sm h-48"
                    />
                    <p className="text-xs text-gray-500">
                      Paste the stops array in JSON format with GPS coordinates
                    </p>
                  </div>
                )}
                
                <Button 
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? `Creating ${contentType}...` : `Create ${contentType === 'tour' ? 'Tour' : 'Hunt'}`}
                </Button>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}