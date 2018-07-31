export const isClientSide = () => typeof window !== 'undefined' && window.document && typeof window.document.querySelector === 'function';
