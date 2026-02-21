import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import AdminGuard from '../components/AdminGuard';

export default function AdminImportGPS() {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState(null);
  const queryClient = useQueryClient();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setStatus(null);
    } else {
      toast.error('Please select a CSV file');
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    return data;
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setImporting(true);
    setStatus({ type: 'info', message: 'Processing CSV...' });

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      // Group by Category (tour name)
      const tourGroups = {};
      rows.forEach(row => {
        const category = row.Category || 'Uncategorized';
        if (!tourGroups[category]) {
          tourGroups[category] = [];
        }
        tourGroups[category].push(row);
      });

      setStatus({ type: 'info', message: `Found ${Object.keys(tourGroups).length} tours. Creating hunts...` });

      // Create a hunt for each tour
      let created = 0;
      for (const [category, locations] of Object.entries(tourGroups)) {
        // Extract tour name from category (remove "Tour X: " prefix)
        const huntTitle = category.replace(/^Tour \d+:\s*/, '');
        
        const stops = locations.map((loc, index) => ({
          stop_number: index + 1,
          name: loc.Name,
          address: `${loc.Address}, ${loc.City}, ${loc.State} ${loc.Zip}`,
          latitude: parseFloat(loc.Latitude),
          longitude: parseFloat(loc.Longitude),
          clue: loc.Description || 'Discover this historic location',
          description: loc.Description,
          verification_radius: 50
        }));

        await base44.entities.ScavengerHunt.create({
          title: huntTitle,
          subtitle: `Explore ${stops.length} historic locations`,
          description: `This GPS-verified scavenger hunt takes you through ${stops.length} significant sites in Philadelphia. Follow the clues and check in at each location to complete your journey.`,
          duration: stops.length <= 5 ? '2-3 hours' : stops.length <= 10 ? '3-4 hours' : '4-6 hours',
          difficulty: stops.length <= 5 ? 'easy' : stops.length <= 10 ? 'moderate' : 'challenging',
          image_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600',
          stops: stops
        });

        created++;
        setStatus({ type: 'info', message: `Created ${created}/${Object.keys(tourGroups).length} hunts...` });
      }

      queryClient.invalidateQueries({ queryKey: ['hunts'] });
      setStatus({ 
        type: 'success', 
        message: `Successfully imported ${created} scavenger hunts with GPS coordinates!` 
      });
      toast.success(`Imported ${created} hunts`);
      setFile(null);
    } catch (error) {
      console.error('Import error:', error);
      setStatus({ 
        type: 'error', 
        message: `Import failed: ${error.message}` 
      });
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Import GPS Tours</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload CSV with GPS Coordinates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium mb-2">Required CSV Format:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Name</strong>: Location name</li>
                <li>• <strong>Address</strong>: Street address</li>
                <li>• <strong>City, State, Zip</strong>: Location details</li>
                <li>• <strong>Category</strong>: Tour name (groups locations into hunts)</li>
                <li>• <strong>Description</strong>: Used as clue and description</li>
                <li>• <strong>Latitude</strong>: GPS latitude coordinate</li>
                <li>• <strong>Longitude</strong>: GPS longitude coordinate</li>
              </ul>
            </div>

            <div>
              <Label htmlFor="csv-file">Select CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="mt-2"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <Button
              onClick={handleImport}
              disabled={!file || importing}
              className="w-full"
            >
              {importing ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Tours
                </>
              )}
            </Button>

            {status && (
              <div className={`rounded-lg p-4 flex items-start gap-3 ${
                status.type === 'success' ? 'bg-green-50 border border-green-200' :
                status.type === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                {status.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : status.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                ) : (
                  <Upload className="w-5 h-5 text-blue-600 mt-0.5 animate-pulse" />
                )}
                <p className={`text-sm ${
                  status.type === 'success' ? 'text-green-900' :
                  status.type === 'error' ? 'text-red-900' :
                  'text-blue-900'
                }`}>
                  {status.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-gray-600">
              <li className="flex gap-3">
                <span className="font-bold text-indigo-600">1.</span>
                <span>Upload your CSV file with location data including GPS coordinates</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-indigo-600">2.</span>
                <span>Locations are grouped by "Category" field into separate scavenger hunts</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-indigo-600">3.</span>
                <span>Each hunt gets GPS verification enabled with 50-meter radius</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-indigo-600">4.</span>
                <span>Users can "Check In" at locations using real-time GPS verification</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}