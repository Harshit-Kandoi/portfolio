/**
 * Smooth-scrolls to a section. If layout shifts while the scroll is running (late images,
 * fonts), the smooth scroll stops short, so re-align once it ends. `scrollend` is
 * unsupported in older Safari, where this simply skips the correction.
 */
export function scrollToSection(target: Element | string) {
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.addEventListener(
    'scrollend',
    () => {
      if (Math.abs(el.getBoundingClientRect().top) > 2) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    },
    { once: true },
  );
}
