import { useEffect } from 'react';

export function SEO({ title, description }) {
  useEffect(() => {
    const fullTitle = title ? `${title} — FormFit AI` : 'FormFit AI — Precision File & Photo Preparation';
    document.title = fullTitle;

    const desc = description || 'Prepare photos, signatures, and documents to exact official portal specifications. 100% local client-side processing.';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', desc);
    }
  }, [title, description]);

  return null;
}
