// ErrorBoundary.jsx - Catch render errors so a scene crash never leaves a blank screen.
// NOTE: Error boundaries are the one place React requires a class component.
import React from 'react';

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game Error:', error, errorInfo);
    // Sentry (if configured) picks this up via window.onerror in errorMonitoring
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100dvh',
          background: '#FFF8E7',
          textAlign: 'center',
          padding: '24px',
          fontFamily: "'Nunito', sans-serif"
        }}>
          <div style={{ fontSize: '64px', marginBottom: '12px' }}>🐘</div>
          <h1 style={{ fontFamily: "'Baloo 2', cursive", color: '#5e49a8', marginBottom: '8px' }}>
            Oops! Mooshika tripped!
          </h1>
          <p style={{ color: '#6b5f8e', fontSize: '18px', marginBottom: '24px' }}>
            Something went wrong. Let&apos;s go back and try again!
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              minWidth: '200px',
              minHeight: '60px',
              border: 'none',
              borderRadius: '999px',
              padding: '14px 28px',
              fontFamily: "'Baloo 2', cursive",
              fontWeight: 700,
              fontSize: '20px',
              color: '#fff',
              background: 'linear-gradient(135deg,#FF9933,#FF5722)',
              boxShadow: '0 8px 24px rgba(255,87,34,0.3)',
              cursor: 'pointer'
            }}
          >
            🗺️ Back to Map
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
