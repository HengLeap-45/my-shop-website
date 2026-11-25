import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible modal dialog powered by the native <dialog> element and showModal().
 */
export default function ModalDialog({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const pressedOutsideRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const isOutside = (event, dialog) => {
    const rect = dialog.getBoundingClientRect();
    return (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    );
  };

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby={titleId}
      onClose={() => onClose?.()}
      onPointerDown={(e) => {
        if (dialogRef.current) {
          pressedOutsideRef.current = isOutside(e, dialogRef.current);
        }
      }}
      onPointerUp={(e) => {
        if (dialogRef.current && pressedOutsideRef.current && isOutside(e, dialogRef.current)) {
          onClose?.();
        }
        pressedOutsideRef.current = false;
      }}
      className={`m-auto w-[calc(100%-2rem)] ${maxWidth} rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h1 id={titleId} className="text-lg font-bold text-slate-900">
          {title}
        </h1>
        <button
          type="button"
          onClick={() => onClose?.()}
          aria-label="Close dialog"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="max-h-[80dvh] overflow-y-auto p-6">{children}</div>
    </dialog>
  );
}
