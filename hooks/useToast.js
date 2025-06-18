import ToastNotification from "pages/components/ToastNotification";
import { useState, useCallback } from "react";

const useToast = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  const show = useCallback((message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  }, []);

  const hide = useCallback(() => {
    setShowToast(false);
  }, []);

  const Toast = (
    <ToastNotification
      show={showToast}
      onClose={hide}
      message={toastMessage}
      variant={toastVariant}
    />
  );

  return { show, Toast };
};

export default useToast;
