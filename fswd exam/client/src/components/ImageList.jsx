import { useState, useEffect } from 'react';
import axios from 'axios';

function ImageList() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/images');
      setImages(response.data.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching images');
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading images...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <div key={image._id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {image.originalName}
            </h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Original Size:</span>
                <span className="font-medium">{formatFileSize(image.originalSize)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Compressed Size:</span>
                <span className="font-medium">{formatFileSize(image.compressedSize)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Compression Ratio:</span>
                <span className="font-medium text-green-600">
                  {image.compressionRatio.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {new Date(image.createdAt).toLocaleDateString()}
              </span>
              <a
                href={`http://localhost:5000/api/images/${image._id}/download`}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ImageList; 