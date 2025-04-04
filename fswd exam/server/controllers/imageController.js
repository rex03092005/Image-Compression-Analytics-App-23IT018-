const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const Image = require('../models/Image');
const logger = require('../config/logger');

// Upload and compress image
exports.uploadAndCompress = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const originalPath = req.file.path;
    const compressedPath = path.join(
      path.dirname(originalPath),
      `compressed-${req.file.filename}`
    );

    // Get image metadata
    const metadata = await sharp(originalPath).metadata();
    
    // Compress image
    await sharp(originalPath)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toFile(compressedPath);

    // Get file sizes
    const [originalStats, compressedStats] = await Promise.all([
      fs.stat(originalPath),
      fs.stat(compressedPath)
    ]);

    const compressionRatio = ((originalStats.size - compressedStats.size) / originalStats.size) * 100;

    // Save to database
    const image = new Image({
      originalName: req.file.originalname,
      originalSize: originalStats.size,
      compressedSize: compressedStats.size,
      originalPath: originalPath,
      compressedPath: compressedPath,
      compressionRatio: compressionRatio,
      mimeType: req.file.mimetype,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      }
    });

    await image.save();

    logger.info(`Image compressed successfully: ${req.file.originalname}`);

    res.status(201).json({
      success: true,
      data: image
    });
  } catch (error) {
    logger.error('Error in uploadAndCompress:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing image',
      error: error.message
    });
  }
};

// Get all images
exports.getAllImages = async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    logger.error('Error in getAllImages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching images',
      error: error.message
    });
  }
};

// Download compressed image
exports.downloadImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.download(image.compressedPath, `compressed-${image.originalName}`);
    logger.info(`Image downloaded: ${image.originalName}`);
  } catch (error) {
    logger.error('Error in downloadImage:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading image',
      error: error.message
    });
  }
}; 