// collectionTarget.js — where a collected symbol should fly to.
//
//   phone landscape  → the collection (Wisdom) button
//   tablet / desktop → the exact symbol slot in the side rail (#sidebar-<id>)
//
// The phone condition is the canonical one from App.css / DECISIONS 2026-10-01.
export const PHONE_COLLECTION_QUERY =
  '(orientation: landscape) and (max-height: 500px) and (max-width: 1023px)';

export const isPhoneCollectionMode = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(PHONE_COLLECTION_QUERY).matches;

export const getCollectionTarget = (symbolId) => {
  if (isPhoneCollectionMode()) {
    const button = document.querySelector('[data-collection-button="true"]');
    if (button) return button;
  }
  return document.getElementById(`sidebar-${symbolId}`);
};
