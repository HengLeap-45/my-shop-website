import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Velora`;
    } else {
      document.title = 'Velora | Curated Modern Goods';
    }
  }, [title]);
}
