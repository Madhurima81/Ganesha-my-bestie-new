import React from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import InnerMandala from '../lib/components/celebration/InnerMandala.jsx';
import symbolTrunkColored from '../zones/symbol-mountain/shared/images/icons/symbol-trunk-new.webp';
import symbolLotusColored from '../zones/symbol-mountain/shared/images/icons/symbol-lotus-new.webp';

function Capture() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f7e7ff' }}>
      <InnerMandala
        childName="Aarav"
        symbolPetalStates={{
          1: 'awakened',
          2: 'awakened',
          3: 'awakened',
          4: 'awakened',
          5: 'awakened',
        }}
        justEarnedPetals={[
          { ring: 'middle', id: 4 },
          { ring: 'middle', id: 5 },
        ]}
        earnedSymbols={[
          { id: 'trunk', petalId: 4, ring: 'middle', image: symbolTrunkColored },
          { id: 'lotus', petalId: 5, ring: 'middle', image: symbolLotusColored },
        ]}
        autoCloseMs={999999}
        message="That power is growing inside you"
        onClose={() => {}}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Capture />);
