import React from "react";
import AuthModal from "./AuthModal";

interface AuthOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const AuthOverlay: React.FC<AuthOverlayProps> = ({ visible, onClose }) => {
  return (
    <AuthModal
      visible={visible}
      onClose={onClose}
      initialMode="method-selection"
    />
  );
};

export default AuthOverlay;
