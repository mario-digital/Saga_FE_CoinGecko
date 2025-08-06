import { getCriticalCSS } from '../critical-css';

describe('getCriticalCSS', () => {
  it('returns a string containing critical CSS', () => {
    const css = getCriticalCSS();

    expect(typeof css).toBe('string');
    expect(css.length).toBeGreaterThan(0);
  });

  it('includes critical reset styles', () => {
    const css = getCriticalCSS();

    expect(css).toContain('box-sizing: border-box');
    expect(css).toContain('margin: 0');
    expect(css).toContain('padding: 0');
  });

  it('includes body styles', () => {
    const css = getCriticalCSS();

    expect(css).toContain('body');
    expect(css).toContain('font-family');
    expect(css).toContain('-webkit-font-smoothing');
    expect(css).toContain('background-color');
  });

  it('includes dark mode styles', () => {
    const css = getCriticalCSS();

    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain('#111827'); // dark background
    expect(css).toContain('#f3f4f6'); // dark text color
  });

  it('includes header styles', () => {
    const css = getCriticalCSS();

    expect(css).toContain('header');
    expect(css).toContain('position: sticky');
    expect(css).toContain('z-index: 50');
  });

  it('includes container styles with responsive breakpoints', () => {
    const css = getCriticalCSS();

    expect(css).toContain('.container');
    expect(css).toContain('@media (min-width: 640px)');
    expect(css).toContain('@media (min-width: 1280px)');
    expect(css).toContain('max-width: 1280px');
  });

  it('includes grid styles with responsive columns', () => {
    const css = getCriticalCSS();

    expect(css).toContain('.grid');
    expect(css).toContain('display: grid');
    expect(css).toContain('grid-template-columns');
    expect(css).toContain('repeat(1, minmax(0, 1fr))');
    expect(css).toContain('repeat(2, minmax(0, 1fr))');
    expect(css).toContain('repeat(3, minmax(0, 1fr))');
  });

  it('includes card styles', () => {
    const css = getCriticalCSS();

    expect(css).toContain('.card');
    expect(css).toContain('border-radius');
    expect(css).toContain('box-shadow');
    expect(css).toContain('min-height');
  });

  it('includes skeleton loading animation', () => {
    const css = getCriticalCSS();

    expect(css).toContain('.skeleton');
    expect(css).toContain('@keyframes pulse');
    expect(css).toContain('animation: pulse');
    expect(css).toContain('opacity: 0.5');
  });

  it('includes font size utilities', () => {
    const css = getCriticalCSS();

    expect(css).toContain('.text-sm');
    expect(css).toContain('.text-base');
    expect(css).toContain('.text-lg');
    expect(css).toContain('.text-xl');
    expect(css).toContain('font-size: 0.875rem');
    expect(css).toContain('font-size: 1rem');
  });

  it('includes image layout shift prevention', () => {
    const css = getCriticalCSS();

    expect(css).toContain('img');
    expect(css).toContain('display: block');
    expect(css).toContain('max-width: 100%');
    expect(css).toContain('height: auto');
  });

  it('includes responsive utilities', () => {
    const css = getCriticalCSS();

    expect(css).toContain('.sm\\:hidden');
    expect(css).toContain('.sm\\:block');
    expect(css).toContain('@media (max-width: 639px)');
    expect(css).toContain('display: none');
  });
});
