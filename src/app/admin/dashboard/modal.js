// src/app/admin/dashboard/Modal.js

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
        <div className="bg-white p-6 rounded-lg z-10 shadow-lg">
          {children}
        </div>
      </div>
    );
  };
  
  export default Modal;
  