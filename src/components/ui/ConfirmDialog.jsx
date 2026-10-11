import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirming }) {
  return (
    <Modal open={open} onClose={onClose} title={title || 'Confirm'}>
      <p className="text-sm text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} disabled={confirming}>{confirming ? 'Please wait…' : 'Confirm'}</Button>
      </div>
    </Modal>
  );
}
