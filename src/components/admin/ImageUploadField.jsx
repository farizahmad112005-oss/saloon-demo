import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { AdminAPI } from '../../services/api';
import { mediaUrl } from '../../utils/format';
import { useToast } from '../../context/ToastContext';

export default function ImageUploadField({
  value = '',
  onChange,
  folder = 'media',
  label = 'Photo',
  hint = 'JPG, PNG, WEBP or GIF · max 5 MB',
  required = false,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const pick = () => inputRef.current?.click();

  const onFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await AdminAPI.upload(file, folder);
      onChange?.(data.data.url);
      toast.success('Photo uploaded');
    } catch (e) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2 md:col-span-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-burgundy">
          {label}
          {required ? <span className="text-gold"> *</span> : null}
        </p>
        <p className="text-xs text-muted">{hint}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-blush/60 bg-blush/10 p-3 sm:flex-row sm:items-center">
        <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ivory sm:w-40">
          {value ? (
            <img src={mediaUrl(value)} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted">
              <ImagePlus size={22} />
              <span className="text-xs">No photo yet</span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-sm text-muted">
            {value
              ? 'Photo ready. Save the form to keep this image on the item.'
              : 'Choose a clear photo — it will upload to cloud storage automatically.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={pick} disabled={uploading} className="!py-2 !px-4 text-sm">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              {uploading ? 'Uploading…' : value ? 'Change photo' : 'Upload photo'}
            </Button>
            {value ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onChange?.('')}
                disabled={uploading}
                className="!py-2 !px-4 text-sm"
              >
                <Trash2 size={16} /> Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
