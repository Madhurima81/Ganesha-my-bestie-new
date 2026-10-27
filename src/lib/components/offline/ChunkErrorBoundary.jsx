// ChunkErrorBoundary.jsx - a failed lazy chunk (new deploy removed it) must never leave a blank screen.
// NOTE: Error boundaries are the one place React requires a class component (same exception as
// components/error/ErrorBoundary.jsx). Only chunk-load errors are handled here; any other error is re-thrown
// to the next boundary exactly as before.
import React, { useEffect, useState } from 'react';
import { CHUNK_FAILED_EVENT, handleChunkFailure, isChunkLoadError } from './updateGuard';
import { GANESHA_USAGE_SYSTEM } from '../../config/ganeshaUsageSystem';

// "Something new" is for a fresh deploy that removed the file. When the device is simply offline and this part of
// the app was never opened (so it is not saved yet), refreshing cannot help: say that plainly instead.
export const RefreshCard = () => {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine === false);
  useEffect(() => {
    const update = () => setOffline(navigator.onLine === false);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  // Same look as the Ganesha loading page (floating Ganesha, glow, welcome sky) so this never feels like an error page.
  const ink = '#4a2f86';
  return (
    <div role="alert" className="enhanced-loading-screen" style={{ zIndex: 10000 }}>
      <div className="bg-overlay" />
      <div className="bg-vignette" />
      <div
        className="loading-ganesha-container"
        style={{ width: 'clamp(110px, 26vh, 300px)', height: 'clamp(110px, 26vh, 300px)', marginBottom: 'clamp(4px, 1.5vh, 14px)' }}
      >
        <div className="loading-ganesha-glow" />
        <img src={GANESHA_USAGE_SYSTEM.loading.asset} alt="Ganesha" className="loading-ganesha" />
      </div>
      <div
        style={{
          position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 'clamp(8px, 1.6vh, 14px)', padding: '0 24px', textAlign: 'center',
        }}
      >
        <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 'clamp(22px, 4.2vh, 32px)', color: ink, margin: 0, textShadow: '0 1px 8px rgba(255,255,255,0.8)' }}>
          {offline ? 'You are offline' : 'Ganesha has something new!'}
        </h1>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 'clamp(14px, 2.6vh, 18px)', color: ink, margin: 0, maxWidth: '420px', textShadow: '0 1px 6px rgba(255,255,255,0.8)' }}>
          {offline
            ? 'This part of the game is not saved on this device yet. Connect to the internet and try again. Your stars are safe.'
            : 'Tap to refresh and keep playing. Your stars are safe.'}
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
          {offline ? 'Try again' : 'Tap to refresh'}
        </button>
      </div>
    </div>
  );
};

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
