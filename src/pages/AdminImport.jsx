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

export default function AdminImport() {
  const [importMode, setImportMode] = useState('form');
  const [jsonData, setJsonData] = useState('');
  const [status, setStatus] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    duration: '',
    category: 'historical',
    image_url: '',
    practical_notes: '',
    days_json: ''
  });

  const queryClient = useQueryClient();

  const createTourMutation = useMutation({
    mutationFn: (tourData) => base44.entities.Tour.create(tourData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      setStatus({ type: 'success', message: 'Tour created successfully!' });
      setJsonData('');
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        duration: '',
        category: 'historical',
        image_url: '',
        practical_notes: '',
        days_json: ''
      });
    },
    onError: (error) => {
      setStatus({ type: 'error', message: error.message || 'Failed to create tour' });
    }
  });

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonData);
      createTourMutation.mutate(parsed);
    } catch (error) {
      setStatus({ type: 'error', message: 'Invalid JSON format' });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    try {
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
      
      createTourMutation.mutate(tourData);
    } catch (error) {
      setStatus({ type: 'error', message: 'Invalid days JSON format' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Import New Tour</h1>
          <p className="text-gray-600 mt-2">Add tours to the app using JSON or a form</p>
        </div>

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

        {/* JSON Import Mode */}
        {importMode === 'json' && (
          <Card>
            <CardHeader>
              <CardTitle>Paste Tour JSON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder='{"title": "Tour Name", "subtitle": "...", "description": "...", "duration": "2 Days", "category": "historical", "image_url": "https://...", "practical_notes": ["Note 1", "Note 2"], "days": [...]}'
                className="font-mono text-sm h-96"
              />
              
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
                <p className="font-semibold mb-2">JSON Format Example:</p>
                <pre className="text-xs overflow-x-auto">
{`{
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
}`}
                </pre>
              </div>
              
              <Button 
                onClick={handleJsonImport}
                disabled={createTourMutation.isPending}
                className="w-full"
              >
                {createTourMutation.isPending ? 'Importing...' : 'Import Tour'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Form Entry Mode */}
        {importMode === 'form' && (
          <form onSubmit={handleFormSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Create New Tour</CardTitle>
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
                      placeholder="e.g., 2 Days, 1 Day (9 AM - 5 PM)"
                    />
                  </div>
                  
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
                
                <Button 
                  type="submit"
                  disabled={createTourMutation.isPending}
                  className="w-full"
                >
                  {createTourMutation.isPending ? 'Creating Tour...' : 'Create Tour'}
                </Button>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}