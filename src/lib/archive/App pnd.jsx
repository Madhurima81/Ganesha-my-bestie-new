import React from 'react';
import PondScene from '../../zones/symbol-mountain/scenes/pond/PondScene';

function App() {
  return (
    <div className="App" style={{ 
      width: '100vw', 
      height: 'var(--app-height, 100vh)', 
      padding: 0, 
      margin: 0,
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <PondScene />
    </div>
  );
}

export default App;