import { useEffect } from 'react';

/**
 * Keeps aria-invalid synchronized with :user-invalid on a form container,
 * ensuring screen readers only hear errors after user interaction or submit.
 */
export function useFormAriaSync(formRef) {
  useEffect(() => {
    const form = formRef?.current;
    if (!form) return undefined;

    const syncField = (el) => {
      if (!el?.matches?.('input, select, textarea')) return;
      const supportsUserInvalid = typeof CSS !== 'undefined' && CSS.supports?.('selector(:user-invalid)');
      const isInvalid = supportsUserInvalid
        ? el.matches(':user-invalid')
        : el.classList.contains('user-invalid-fallback');
      el.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
    };

    form.querySelectorAll('input, select, textarea').forEach((el) => {
      if (!el.hasAttribute('aria-invalid')) el.setAttribute('aria-invalid', 'false');
    });

    const onBlur = (e) => syncField(e.target);
    const onInput = (e) => {
      if (e.target.getAttribute('aria-invalid') === 'true') syncField(e.target);
    };
    const onInvalid = (e) => {
      e.target.classList?.add('user-invalid-fallback');
      e.target.setAttribute('aria-invalid', 'true');
    };

    form.addEventListener('blur', onBlur, true);
    form.addEventListener('input', onInput);
    form.addEventListener('invalid', onInvalid, true);

    return () => {
      form.removeEventListener('blur', onBlur, true);
      form.removeEventListener('input', onInput);
      form.removeEventListener('invalid', onInvalid, true);
    };
  }, [formRef]);
}
