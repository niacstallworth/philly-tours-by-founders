import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LocationChecker({ stop, onComplete, onCancel }) {
  const [uploading, setUploading] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSelfieUploaded(true);
      
      // Auto-complete after successful upload
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (error) {
      alert('Failed to upload selfie. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-6 rounded-lg border-2 border-amber-500">
      <div className="text-center space-y-4">
        {!selfieUploaded ? (
          <>
            <Camera className="w-16 h-16 mx-auto text-amber-600" />
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Take Your Selfie!</h3>
              <p className="text-sm text-gray-600">
                Capture yourself at this historic location to verify your visit
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {uploading ? (
                  'Uploading...'
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Take Selfie
                  </>
                )}
              </Button>
              <Button
                onClick={onCancel}
                variant="outline"
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className="text-green-600">
            <CheckCircle className="w-16 h-16 mx-auto mb-3" />
            <h3 className="font-bold text-lg">Location Verified!</h3>
            <p className="text-sm text-gray-600">Marking as complete...</p>
          </div>
        )}
      </div>
    </div>
  );
}