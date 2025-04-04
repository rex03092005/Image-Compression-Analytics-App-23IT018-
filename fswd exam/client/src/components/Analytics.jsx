import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/analytics');
      setAnalytics(response.data.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching analytics');
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
        <p className="mt-2 text-gray-600">Loading analytics...</p>
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

  const sizeComparisonData = {
    labels: ['Original Size', 'Compressed Size'],
    datasets: [
      {
        label: 'File Size',
        data: [analytics.summary.totalOriginalSize, analytics.summary.totalCompressedSize],
        backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(75, 192, 192, 0.5)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const compressionRatioData = {
    labels: ['Compressed', 'Original'],
    datasets: [
      {
        data: [analytics.summary.sizeSavedPercentage, 100 - analytics.summary.sizeSavedPercentage],
        backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(201, 203, 207, 0.5)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(201, 203, 207, 1)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">Total Images</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.summary.totalImages}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">Total Size Saved</h3>
          <p className="text-3xl font-bold text-green-600">
            {formatFileSize(analytics.summary.totalSizeSaved)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">Average Compression</h3>
          <p className="text-3xl font-bold text-purple-600">
            {analytics.summary.averageCompressionRatio.toFixed(2)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">Size Saved %</h3>
          <p className="text-3xl font-bold text-orange-600">
            {analytics.summary.sizeSavedPercentage.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Size Comparison</h3>
          <Bar
            data={sizeComparisonData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Original vs Compressed Size',
                },
              },
            }}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Compression Ratio</h3>
          <Doughnut
            data={compressionRatioData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Size Reduction Percentage',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {analytics.recentActivity.map((activity) => (
            <div
              key={activity._id}
              className="flex items-center justify-between border-b pb-2"
            >
              <div>
                <p className="font-medium text-gray-800">{activity.originalName}</p>
                <p className="text-sm text-gray-500">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
              <span className="text-green-600 font-medium">
                {activity.compressionRatio.toFixed(2)}% reduction
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Analytics; 