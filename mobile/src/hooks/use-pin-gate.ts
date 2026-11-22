import { useCallback, useRef, useState } from "react";

interface PendingPin {
  verify: (pin: string) => Promise<void>;
  onSuccess: () => void;
}

export function usePinGate() {
  const [visible, setVisible] = useState(false);
  const pendingRef = useRef<PendingPin | null>(null);

  const requestPin = useCallback((verify: (pin: string) => Promise<void>, onSuccess: () => void) => {
    pendingRef.current = { verify, onSuccess };
    setVisible(true);
  }, []);

  const handleConfirm = useCallback(async (pin: string) => {
    const pending = pendingRef.current;
    if (!pending) return;
    // Throws si le PIN est incorrect -> la modal reste ouverte et affiche l'erreur
    await pending.verify(pin);
    setVisible(false);
    pendingRef.current = null;
    pending.onSuccess();
  }, []);

  const handleCancel = useCallback(() => {
    setVisible(false);
    pendingRef.current = null;
  }, []);

  return { visible, requestPin, handleConfirm, handleCancel };
}