// src/utils/cropImage.js

export const getCroppedImg = (imageSrc, crop, zoom) => {
    const createImage = (url) =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // Needed to avoid cross-origin issues on CodeSandbox
        image.src = url;
      });
  
    return new Promise(async (resolve, reject) => {
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      const safeArea = Math.max(image.width, image.height) * 2;
  
      // Set each dimensions to double largest dimension to allow for a safe area for the
      // image to rotate in without being clipped by canvas context
      canvas.width = safeArea;
      canvas.height = safeArea;
  
      // Translate canvas context to a central location to allow rotating around the center.
      ctx.translate(safeArea / 2, safeArea / 2);
      ctx.translate(-safeArea / 2, -safeArea / 2);
      ctx.drawImage(image, 0, 0);
  
      const data = ctx.getImageData(0, 0, safeArea, safeArea);
  
      // Set canvas width to final desired crop size - this will clear existing context
      canvas.width = crop.width;
      canvas.height = crop.height;
  
      // Paste generated rotate image with correct offsets for x,y crop values.
      ctx.putImageData(
        data,
        Math.round(0 - (safeArea / 2 - image.width / 2) - crop.x),
        Math.round(0 - (safeArea / 2 - image.height / 2) - crop.y)
      );
  
      // As a blob
      canvas.toBlob((blob) => {
        if (!blob) {
          //reject(new Error('Canvas is empty'));
          console.error('Canvas is empty');
          return;
        }
        blob.name = 'cropped.jpeg';
        resolve(blob);
      }, 'image/jpeg');
    });
  };
  