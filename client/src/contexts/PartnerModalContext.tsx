/* PartnerModalContext — global state for partner registration modal
   Allows any component to open the modal with a pre-selected partner type */

import { createContext, useContext, useState, ReactNode } from "react";
import type { PartnerType } from "@/components/PartnerRegistrationModal";
import PartnerRegistrationModal from "@/components/PartnerRegistrationModal";

interface PartnerModalContextValue {
  openModal: (type?: PartnerType) => void;
  closeModal: () => void;
}

const PartnerModalContext = createContext<PartnerModalContextValue | null>(null);

export function PartnerModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [defaultType, setDefaultType] = useState<PartnerType>("contractor");

  const openModal = (type: PartnerType = "contractor") => {
    setDefaultType(type);
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  return (
    <PartnerModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <PartnerRegistrationModal
        open={open}
        defaultType={defaultType}
        onClose={closeModal}
      />
    </PartnerModalContext.Provider>
  );
}

export function usePartnerModal(): PartnerModalContextValue {
  const ctx = useContext(PartnerModalContext);
  if (!ctx) throw new Error("usePartnerModal must be used within PartnerModalProvider");
  return ctx;
}
