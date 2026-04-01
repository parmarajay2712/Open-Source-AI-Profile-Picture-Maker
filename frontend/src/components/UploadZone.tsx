import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, X, AlertTriangle } from 'lucide-react';

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  hasImage: boolean;
  originalUrl: string | null;
  onReset: () => void;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] };

export default function UploadZone({
  onUpload,
  isUploading,
  hasImage,
  originalUrl,
  onReset,
}: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setValidationError(null);

      if (rejectedFiles && (rejectedFiles as Array<unknown>).length > 0) {
        const rejection = (rejectedFiles as Array<{ errors: Array<{ code: string }> }>)[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setValidationError('File is too large. Maximum size is 10MB.');
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setValidationError('Invalid file type. Only JPG and PNG are accepted.');
        } else {
          setValidationError('File could not be accepted.');
        }
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      await onUpload(file);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    disabled: isUploading,
    multiple: false,
  });

  const displayImage = originalUrl || preview;

  if (hasImage && displayImage) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Image size={14} className="text-accent-purple" />
            Source Image
          </h3>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-red-400 transition-colors"
            aria-label="Remove image and start over"
          >
            <X size={12} />
            Remove
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-xl overflow-hidden border border-white/5 bg-dark-900"
        >
          <img
            src={displayImage}
            alt="Uploaded source"
            className="w-full h-auto max-h-[200px] object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/60 via-transparent to-transparent pointer-events-none" />
        </motion.div>

        <p className="text-[11px] text-dark-500 text-center">
          Click "Remove" to upload a different image
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Upload size={14} className="text-accent-purple" />
        Upload Photo
      </h3>

      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300
          flex flex-col items-center justify-center p-8 text-center
          ${
            isDragActive && !isDragReject
              ? 'border-accent-purple bg-accent-purple/5 scale-[1.01]'
              : isDragReject
              ? 'border-red-500 bg-red-500/5'
              : 'border-dark-700 hover:border-dark-500 bg-dark-900/50 hover:bg-dark-900/80'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
        role="button"
        aria-label="Upload image dropzone"
        tabIndex={0}
      >
        <input {...getInputProps()} aria-label="File input" />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full border-2 border-accent-purple border-t-transparent animate-spin" />
              <p className="text-sm text-dark-300">Uploading...</p>
            </motion.div>
          ) : isDragActive ? (
            <motion.div
              key="drag"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Upload size={32} className="text-accent-purple" />
              </motion.div>
              <p className="text-sm text-accent-purple font-medium">Drop your image here</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 flex items-center justify-center">
                <Upload size={22} className="text-accent-purple" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">
                  Drop your selfie here
                </p>
                <p className="text-xs text-dark-400 mt-1">
                  or click to browse · JPG/PNG · Max 10MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400"
          >
            <AlertTriangle size={14} className="flex-shrink-0" />
            <p className="text-xs">{validationError}</p>
            <button
              onClick={() => setValidationError(null)}
              className="ml-auto flex-shrink-0 hover:text-red-300"
              aria-label="Dismiss error"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
