// Unsigned Cloudinary uploads — no API secret needed on the client.
// Configure two Vite env vars (see .env.example):
//   VITE_CLOUDINARY_CLOUD_NAME
//   VITE_CLOUDINARY_UPLOAD_PRESET  (must be an *unsigned* preset)
// If either is missing, cloudinaryConfigured is false and the UI falls back
// to plain URL-paste, so the app keeps working before Cloudinary is set up.

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

// Uploads a File to Cloudinary and resolves with the secure HTTPS URL.
// onProgress(0..100) is called during upload if provided.
export function uploadToCloudinary(file, { onProgress } = {}) {
  return new Promise((resolve, reject) => {
    if (!cloudinaryConfigured) {
      reject(new Error("Cloudinary is not configured"));
      return;
    }
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      reject(new Error("Image is too large (max 8 MB)."));
      return;
    }

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.secure_url) {
          resolve(res.secure_url);
        } else {
          reject(new Error(res.error?.message || "Upload failed."));
        }
      } catch {
        reject(new Error("Unexpected response from Cloudinary."));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(formData);
  });
}
