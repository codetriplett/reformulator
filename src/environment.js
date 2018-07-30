export const isClientSide = () => window && document && typeof document.querySelector === 'function';
