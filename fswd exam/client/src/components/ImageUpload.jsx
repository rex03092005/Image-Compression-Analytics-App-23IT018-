import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setMessage(null);

    try {
      const response = await axios.post('http://localhost:5000/api/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage({
        type: 'success',
        text: 'Image uploaded and compressed successfully!',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error uploading image',
      });
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  return (
    <div className="max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-4xl text-gray-400">
            📸
          </div>
          <div className="text-lg text-gray-600">
            {isDragActive ? (
              <p>Drop the image here...</p>
            ) : (
              <p>Drag & drop an image here, or click to select one</p>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Supported formats: JPEG, PNG, GIF (max 5MB)
          </div>
        </div>
      </div>

      {uploading && (
        <div className="mt-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Uploading and compressing...</p>
        </div>
      )}

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

export default ImageUpload; 