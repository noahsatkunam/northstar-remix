import { createContext, useContext, useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Phone, Mail } from "lucide-react";

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
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-background/90 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
            
            <div className="relative z-10">
              <DialogHeader className="text-center sm:text-center">
                <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">
                  Let's Talk
                </DialogTitle>
                <DialogDescription className="mt-3 text-base text-muted-foreground">
                  Tell us about your needs and we'll get back to you within one business day
                </DialogDescription>
              </DialogHeader>

              {/* Form Placeholder */}
              <div className="mt-8">
                <div className="flex min-h-[400px] w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-8 sm:min-h-[500px]">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-foreground">
                      Contact Form Coming Soon
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Please use the contact info below
                    </p>
                  </div>
                </div>
              </div>

              {/* Alternative Contact */}
              <div className="mt-8 border-t border-border pt-6">
                <p className="text-center text-sm font-medium text-foreground">
                  Prefer to reach out directly?
                </p>
                <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
                  <a
                    href="tel:+1-866-337-9096"
                    className="group flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary"
                  >
                    <Phone className="h-4 w-4 transition-transform group-hover:scale-110" />
                    866-337-9096
                  </a>
                  <a
                    href="mailto:info@northstar-tg.com"
                    className="group flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary"
                  >
                    <Mail className="h-4 w-4 transition-transform group-hover:scale-110" />
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
