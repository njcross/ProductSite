import { Modal, Button } from 'react-bootstrap';


import EditableField from '../components/EditableField';import './ConfirmationModal.css';

export default function ConfirmationModal({
  show,
  title,
  message,
  onHide,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel"
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
  {cancelText && (
    <>
      <Button variant="secondary" onClick={onHide} className="no-2-button">
        {cancelText}
      </Button>
      <EditableField contentKey="content_12" />
      <Button variant="primary" onClick={onConfirm}>
        {confirmText}
      </Button>
    </>
  )}
</Modal.Footer>

    </Modal>
  );
}
