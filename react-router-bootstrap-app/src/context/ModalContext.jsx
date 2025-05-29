// src/context/ModalContext.jsx
import { createContext, useContext, useState } from 'react';

const ModalContext = createContext();
export const useModal = () => useContext(ModalContext);

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
