import { useRef, useState } from 'react';
import { cloudinaryConfigured, uploadToCloudinary } from '../utils/cloudinary';

const isProbablyImageUrl = (url) =>
  /^https?:\/\//i.test(url) &&
  (/\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(url) ||
    /(unsplash|imgur|i\.ibb\.co|ibb\.co|postimg|flickr|staticflickr|cloudinary|googleusercontent|pexels|pixabay|images\.|cdn\.|media\.)/i.test(url));

// Reusable image picker: uploads to Cloudinary when configured, always
// supports pasting a direct URL as a fallback. Shows a live preview.
export default function ImageUpload({
  value,
  onChange,
  aspect = 'rect', // 'rect' | 'square'
  placeholder = '🖼  Paste an image URL (Unsplash, Imgur, etc.)',
}) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(!cloudinaryConfigured);

  const doUpload = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadToCloudinary(file, { onProgress: setProgress });
      onChange(url);
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) doUpload(file);
  };

  const previewClass = aspect === 'square' ? 'aspect-square max-w-[220px]' : 'max-h-72';

  return (
    <div className="space-y-2">
      {/* Upload dropzone — only when Cloudinary is configured */}
      {cloudinaryConfigured && !value && (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
            dragOver ? 'border-forest-500 bg-forest-50' : 'border-cream-300 hover:border-forest-400 bg-cream-50'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => doUpload(e.target.files?.[0])}
          />
          {uploading ? (
            <div className="space-y-2">
              <p className="text-sm text-ink-600">Uploading… {progress}%</p>
              <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden max-w-xs mx-auto">
                <div className="h-full bg-forest-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-7 h-7 mx-auto text-ink-400 mb-1.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <p className="text-sm font-medium text-ink-700">Click to upload or drag an image here</p>
              <p className="text-[11px] text-ink-400 mt-0.5">PNG, JPG, GIF, WEBP · up to 8 MB</p>
            </>
          )}
        </div>
      )}

      {/* URL input — always available (only option when Cloudinary isn't set up) */}
      {!value && (
        <>
          {cloudinaryConfigured && !showUrlInput ? (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-xs text-forest-700 hover:text-forest-800 font-medium"
            >
              or paste an image URL instead
            </button>
          ) : (
            <input
              type="url"
              placeholder={placeholder}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={(e) => {
                const v = e.target.value.trim();
                setError(v && !isProbablyImageUrl(v) ? "That doesn't look like a direct image link (should end in .jpg, .png, .gif, or .webp)." : '');
              }}
              className="w-full border border-cream-300 rounded-xl px-3 py-2 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          )}
        </>
      )}

      {error && <p className="text-coral-600 text-xs">{error}</p>}

      {/* Preview */}
      {value && (
        <div className="relative rounded-xl overflow-hidden border border-cream-300 bg-cream-100 inline-block w-full">
          <img
            src={value}
            alt="preview"
            className={`w-full object-cover ${previewClass}`}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <button
            type="button"
            onClick={() => { onChange(''); setError(''); }}
            title="Remove image"
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-ink-900/60 hover:bg-ink-900/80 text-white flex items-center justify-center backdrop-blur-sm transition"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
