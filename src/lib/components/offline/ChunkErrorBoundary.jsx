// ChunkErrorBoundary.jsx - a failed lazy chunk (new deploy removed it) must never leave a blank screen.
// NOTE: Error boundaries are the one place React requires a class component (same exception as
// components/error/ErrorBoundary.jsx). Only chunk-load errors are handled here; any other error is re-thrown
// to the next boundary exactly as before.
import React from 'react';
import { CHUNK_FAILED_EVENT, handleChunkFailure, isChunkLoadError } from './updateGuard';

export const RefreshCard = () => (
  <div
    role="alert"
    style={{
      position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px',
      background: '#FFF8E7', textAlign: 'center'
    }}
  >
    <div style={{ fontSize: '72px', lineHeight: 1 }} aria-hidden="true">🐘</div>
    <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '32px', color: '#5e49a8', margin: 0 }}>
      Ganesha has something new!
    </h1>
    <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: '18px', color: '#6b5f8e', margin: 0, maxWidth: '420px' }}>
      Tap to refresh and keep playing. Your stars are safe.
    </p>
    <button
      type="button"
      onClick={() => window.location.reload()}
      style={{
        minWidth: '220px', minHeight: '64px', border: 'none', borderRadius: '999px', padding: '14px 32px',
        fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: '22px', color: '#fff',
        background: 'linear-gradient(135deg,#FF9933,#FF5722)', boxShadow: '0 8px 24px rgba(255,87,34,0.3)',
        cursor: 'pointer'
      }}
    >
      Tap to refresh
    </button>
  </div>
);

export default class ChunkErrorBoundary extends React.Component {
  state = { error: null, card: false };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    if (!isChunkLoadError(error)) return;
    // Safe view: reload once. Busy view or already reloaded: show the card.
    this.setState({ card: handleChunkFailure() === 'card' });
  }

  componentDidMount() {
    this.onFailed = () => { if (this.state.error) this.setState({ card: true }); };
    window.addEventListener(CHUNK_FAILED_EVENT, this.onFailed);
  }

  componentWillUnmount() {
    window.removeEventListener(CHUNK_FAILED_EVENT, this.onFailed);
  }

  render() {
    if (this.state.error) {
      if (!isChunkLoadError(this.state.error)) throw this.state.error;
      return this.state.card ? <RefreshCard /> : null;
    }
    return this.props.children;
  }
}
