// src/context/ModalContext.jsx
import { createContext, useContext, useState } from 'react';

const ModalContext = createContext();
export const useModal = () => useContext(ModalContext);

// Module-scoped setters for external access
let externalShowModal = () => { throw new Error('showModal called before ModalProvider was mounted'); };
let externalHideModal = () => { throw new Error('hideModal called before ModalProvider was mounted'); };

export const getShowModal = () => externalShowModal;
export const getHideModal = () => externalHideModal;

export const ModalProvider = ({ children }) => {
  const [modalContent, setModalContent] = useState(null);
  const [visible, setVisible] = useState(false);

  const showModal = (content) => {
    setModalContent(() => content);
    setVisible(true);
  };

  const hideModal = () => {
    setModalContent(null);
    setVisible(false);
  };

  // Store to module-level exports
  externalShowModal = showModal;
  externalHideModal = hideModal;

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {visible && (
        <div className="global-modal-backdrop">
          <div className="global-modal">{modalContent}</div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
