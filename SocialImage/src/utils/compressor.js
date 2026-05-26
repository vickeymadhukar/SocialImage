/**
 * Utility to compress an image file using Canvas.
 * Supports dynamic configuration based on user settings: 'raw', 'high' (HD), 'standard'.
 * 
 * @param {File} file - The original image File object.
 * @param {string} qualityPreset - Preset: 'raw' | 'high' | 'standard'.
 * @returns {Promise<File>} - Resolves with the compressed File object.
 */
export const compressImage = (file, qualityPreset = "high") => {
  return new Promise((resolve) => {
    // If upload optimization is set to raw/none or it's not an image, bypass compression
    if (qualityPreset === "raw" || !file.type.startsWith("image/")) {
      console.log("Compression bypassed due to preset or invalid file type.");
      resolve(file);
      return;
    }

    // Set target resolution and JPEG quality based on preference preset
    let maxWidth = 1920;
    let maxHeight = 1080;
    let quality = 0.85;

    if (qualityPreset === "standard") {
      maxWidth = 1080;
      maxHeight = 1080;
      quality = 0.7;
    } else if (qualityPreset === "high") {
      maxWidth = 1600;
      maxHeight = 1600;
      quality = 0.82;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        // Convert PNGs to JPEG by default to get massive size reductions, filling transparent background with white
        let outputType = "image/jpeg";
        if (file.type === "image/webp") {
          outputType = "image/webp";
        }

        // Fill background with white to avoid black backgrounds on transparent PNGs/WebPs
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.warn("Canvas compression resulted in null blob. Bypassing.");
              resolve(file);
              return;
            }

            // Adjust extension to .jpg if converted to jpeg
            let fileName = file.name;
            if (outputType === "image/jpeg" && !fileName.toLowerCase().endsWith(".jpg") && !fileName.toLowerCase().endsWith(".jpeg")) {
              fileName = fileName.replace(/\.[^/.]+$/, "") + ".jpg";
            }

            const compressedFile = new File([blob], fileName, {
              type: outputType,
              lastModified: Date.now(),
            });

            console.log(
              `Image Optimization Report:
              - Name: ${file.name} -> ${compressedFile.name}
              - Original Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
              - Optimized Size: ${(compressedFile.size / 1024).toFixed(2)} KB
              - Compression Ratio: ${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`
            );

            // Return compressed file only if it is actually smaller (safeguard)
            if (compressedFile.size < file.size) {
              resolve(compressedFile);
            } else {
              console.log("Compressed file is larger or equal in size. Bypassing.");
              resolve(file);
            }
          },
          outputType,
          quality
        );
      };
      img.onerror = () => {
        console.warn("Image load error during compression. Bypassing.");
        resolve(file);
      };
    };
    reader.onerror = () => {
      console.warn("FileReader error during compression. Bypassing.");
      resolve(file);
    };
  });
};
