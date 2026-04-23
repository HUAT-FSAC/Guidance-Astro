#!/usr/bin/env node

/**
 * 图片优化脚本
 * 使用 sharp 库压缩和转换图片为现代格式
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 要处理的图片目录
const imageDirectories = [
  '/workspace/src/assets',
  '/workspace/public/assets'
];

// 支持的图片格式
const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif'];

// 输出格式配置
const outputFormats = [
  { format: 'webp', quality: 85 },
  { format: 'avif', quality: 80 }
];

// 统计信息
let totalImages = 0;
let optimizedImages = 0;
let savedBytes = 0;

/**
 * 优化单个图片
 */
async function optimizeImage(imagePath) {
  try {
    const imageName = path.basename(imagePath);
    const imageDir = path.dirname(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const baseName = path.basename(imagePath, ext);

    // 读取原始图片信息
    const originalStats = fs.statSync(imagePath);
    const originalSize = originalStats.size;

    console.log(`Processing ${imageName} (${(originalSize / 1024).toFixed(2)} KB)...`);

    // 压缩原始图片
    await sharp(imagePath)
      .resize({
        width: 1920,
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .toFile(`${imageDir}/${baseName}-optimized${ext}`);

    // 获取压缩后的大小
    const optimizedStats = fs.statSync(`${imageDir}/${baseName}-optimized${ext}`);
    const optimizedSize = optimizedStats.size;

    // 计算节省的空间
    const saved = originalSize - optimizedSize;
    savedBytes += saved;

    // 生成现代格式
    for (const { format, quality } of outputFormats) {
      await sharp(imagePath)
        .resize({
          width: 1920,
          fit: sharp.fit.inside,
          withoutEnlargement: true
        })
        .toFormat(format, { quality })
        .toFile(`${imageDir}/${baseName}.${format}`);
    }

    // 替换原始图片
    fs.unlinkSync(imagePath);
    fs.renameSync(`${imageDir}/${baseName}-optimized${ext}`, imagePath);

    optimizedImages++;
    console.log(`✓ Optimized ${imageName} - Saved ${(saved / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error(`✗ Failed to optimize ${imagePath}:`, error.message);
  }
}

/**
 * 遍历目录处理图片
 */
async function processDirectory(directory) {
  try {
    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(directory, file.name);

      if (file.isDirectory()) {
        await processDirectory(fullPath);
      } else if (file.isFile()) {
        const ext = path.extname(file.name).toLowerCase();
        if (supportedFormats.includes(ext)) {
          totalImages++;
          await optimizeImage(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('Starting image optimization...');
  console.log('================================');

  for (const directory of imageDirectories) {
    if (fs.existsSync(directory)) {
      console.log(`Processing directory: ${directory}`);
      await processDirectory(directory);
    } else {
      console.log(`Directory not found: ${directory}`);
    }
  }

  console.log('================================');
  console.log('Image optimization completed!');
  console.log(`Total images: ${totalImages}`);
  console.log(`Optimized images: ${optimizedImages}`);
  console.log(`Saved space: ${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log('================================');
}

// 运行主函数
main().catch(console.error);