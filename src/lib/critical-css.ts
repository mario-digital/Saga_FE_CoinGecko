/**
 * Critical CSS for above-the-fold content
 * This CSS is inlined to prevent render blocking
 */

export function getCriticalCSS(): string {
  return `
    /* Critical reset and base styles */
    *, *::before, *::after { box-sizing: border-box; }
    * { margin: 0; padding: 0; }
    
    /* Critical layout styles */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      background-color: #f9fafb;
    }
    
    /* Dark mode critical styles */
    @media (prefers-color-scheme: dark) {
      body { background-color: #111827; color: #f3f4f6; }
    }
    
    /* Critical header styles */
    header {
      position: sticky;
      top: 0;
      z-index: 50;
      background-color: white;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }
    
    @media (prefers-color-scheme: dark) {
      header { background-color: #1f2937; }
    }
    
    /* Critical container styles */
    .container {
      width: 100%;
      margin-left: auto;
      margin-right: auto;
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
    
    @media (min-width: 640px) {
      .container { padding-left: 1rem; padding-right: 1rem; }
    }
    
    @media (min-width: 1280px) {
      .container { max-width: 1280px; }
    }
    
    /* Critical grid styles */
    .grid {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    
    @media (min-width: 640px) {
      .grid {
        gap: 1rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    
    @media (min-width: 1024px) {
      .grid {
        gap: 1.25rem;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
    
    /* Critical card styles */
    .card {
      background-color: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      padding: 0.75rem;
      min-height: 120px;
    }
    
    @media (prefers-color-scheme: dark) {
      .card {
        background-color: #1f2937;
        border: 1px solid #374151;
      }
    }
    
    @media (min-width: 640px) {
      .card {
        border-radius: 1rem;
        padding: 1rem;
        min-height: 140px;
      }
    }
    
    /* Critical loading skeleton styles */
    .skeleton {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      background-color: #e5e7eb;
    }
    
    @media (prefers-color-scheme: dark) {
      .skeleton { background-color: #374151; }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    /* Critical font sizes */
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-base { font-size: 1rem; line-height: 1.5rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    
    /* Prevent layout shift */
    img { display: block; max-width: 100%; height: auto; }
    
    /* Critical responsive utilities */
    @media (max-width: 639px) {
      .sm\\:hidden { display: none; }
    }
    
    @media (min-width: 640px) {
      .sm\\:block { display: block; }
    }
  `;
}
