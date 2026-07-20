import type { ReactNode } from 'react';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Below `sm`, renders children as a left slide-in drawer with a backdrop.
 * At `sm` and above, renders children in normal flow (open/onClose are ignored).
 */
const MobileDrawer = ({ open, onClose, children }: MobileDrawerProps) => (
  <>
    {open && (
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-black/40 sm:hidden"
      />
    )}
    <div
      className={`fixed bottom-0 left-0 top-14 z-40 max-w-[80vw] transition-transform duration-200 sm:static sm:z-auto sm:max-w-none sm:translate-x-0 sm:transition-none ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {children}
    </div>
  </>
);

export default MobileDrawer;
