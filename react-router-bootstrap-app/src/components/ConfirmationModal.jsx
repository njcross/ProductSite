// components/ConfirmationModal.jsx
import { Modal, Button } from 'react-bootstrap';
import './ConfirmationModal.css';

export default function ConfirmationModal({
  show,
  title,
  message,
  onHide,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = true, // optional toggle
}) {
  const handleCancel = () => {
    if (onHide) onHide(); // always close on cancel
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{message}</Modal.Body>

      <Modal.Footer>
        {showCancel && cancelText && (
          <Button
            variant="secondary"
            onClick={handleCancel}
            type="button"             // prevent form submit
            className="no-2-button"
          >
            {cancelText}
          </Button>
        )}
        <Button
          variant="primary"
          onClick={onConfirm}
          type="button"               // prevent form submit
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
