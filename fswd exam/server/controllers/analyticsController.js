const Image = require('../models/Image');
const logger = require('../config/logger');

exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await Image.aggregate([
      {
        $group: {
          _id: null,
          totalImages: { $sum: 1 },
          totalOriginalSize: { $sum: '$originalSize' },
          totalCompressedSize: { $sum: '$compressedSize' },
          averageCompressionRatio: { $avg: '$compressionRatio' },
          totalSizeSaved: {
            $sum: { $subtract: ['$originalSize', '$compressedSize'] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalImages: 1,
          totalOriginalSize: 1,
          totalCompressedSize: 1,
          averageCompressionRatio: { $round: ['$averageCompressionRatio', 2] },
          totalSizeSaved: 1,
          sizeSavedPercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ['$totalOriginalSize', '$totalCompressedSize'] },
                      '$totalOriginalSize'
                    ]
                  },
                  100
                ]
              },
              2
            ]
          }
        }
      }
    ]);

    const recentActivity = await Image.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('originalName compressionRatio createdAt');

    res.json({
      success: true,
      data: {
        summary: analytics[0] || {
          totalImages: 0,
          totalOriginalSize: 0,
          totalCompressedSize: 0,
          averageCompressionRatio: 0,
          totalSizeSaved: 0,
          sizeSavedPercentage: 0
        },
        recentActivity
      }
    });
  } catch (error) {
    logger.error('Error in getAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
}; 