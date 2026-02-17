import { createContext, useContext, useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Phone, Mail } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";

interface ContactModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ContactModalContext = createContext<ContactModalContextType | undefined>(undefined);

export function useContactModal() {
  const context = useContext(ContactModalContext);
  if (!context) {
    throw new Error("useContactModal must be used within a ContactModalProvider");
  }
  return context;
}

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <ContactModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-lg overflow-y-auto p-0 sm:max-w-xl border-none bg-transparent shadow-none">
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-2xl sm:p-10">
            <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <DialogHeader className="text-center sm:text-center">
                <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Let's Talk
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm text-muted-foreground">
                  Tell us about your needs and we'll get back to you within one business day.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6">
                <ContactForm
                  source="contact-modal"
                  onSuccess={closeModal}
                />
              </div>

              <div className="mt-6 border-t border-border/30 pt-5">
                <p className="text-center text-xs font-medium text-muted-foreground mb-3">
                  Prefer to reach out directly?
                </p>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                  <a
                    href="tel:+1-866-337-9096"
                    className="group flex items-center gap-2 rounded-lg border border-border/50 bg-white/[0.03] px-3.5 py-2 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    866-337-9096
                  </a>
                  <a
                    href="mailto:info@northstar-tg.com"
                    className="group flex items-center gap-2 rounded-lg border border-border/50 bg-white/[0.03] px-3.5 py-2 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    info@northstar-tg.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ContactModalContext.Provider>
  );
}
