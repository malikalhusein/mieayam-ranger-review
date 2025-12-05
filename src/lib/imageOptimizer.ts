/**
 * Client-side image optimization utility
 * Compresses and resizes images without losing quality
 */

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

const defaultOptions: OptimizeOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  format: 'image/webp',
};

/**
 * Optimize an image file by resizing and compressing it
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<Blob> {
  const opts = { ...defaultOptions, ...options };
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > opts.maxWidth! || height > opts.maxHeight!) {
        const ratio = Math.min(
          opts.maxWidth! / width,
          opts.maxHeight! / height
        );
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Enable high-quality image scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw the image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        opts.format,
        opts.quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL from file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Optimize an image from URL
 */
export async function optimizeImageFromUrl(
  url: string,
  options: OptimizeOptions = {}
): Promise<string> {
  const opts = { ...defaultOptions, ...options };
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > opts.maxWidth! || height > opts.maxHeight!) {
        const ratio = Math.min(
          opts.maxWidth! / width,
          opts.maxHeight! / height
        );
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Enable high-quality image scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw the image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Return as data URL
      resolve(canvas.toDataURL(opts.format, opts.quality));
    };

    img.onerror = () => {
      // Return original URL if optimization fails
      resolve(url);
    };

    img.src = url;
  });
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(
  url: string,
  sizes: number[] = [320, 640, 960, 1280]
): string {
  // For Supabase storage URLs, we can use transform parameters
  if (url.includes('supabase.co/storage')) {
    return sizes
      .map((size) => {
        const optimizedUrl = `${url}?width=${size}&quality=80`;
        return `${optimizedUrl} ${size}w`;
      })
      .join(', ');
  }
  return url;
}

/**
 * Get optimized image URL with width parameter
 */
export function getOptimizedUrl(url: string, width: number = 800): string {
  if (!url) return '/placeholder.svg';
  
  // For Supabase storage URLs
  if (url.includes('supabase.co/storage')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&quality=80`;
  }
  
  return url;
}

/**
 * Calculate image dimensions for lazy loading placeholder
 */
export function getAspectRatioStyle(width: number, height: number): React.CSSProperties {
  return {
    aspectRatio: `${width} / ${height}`,
  };
}
