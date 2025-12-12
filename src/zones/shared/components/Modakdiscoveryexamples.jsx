// ModakDiscoveryExamples.jsx
// Usage examples for all 3 discovery flips in Modak scene

import React from 'react';
import DiscoveryFlip from './DiscoveryFlip';

// ============================================
// DISCOVERY FLIP 1: Found Mooshika
// ============================================
const DiscoveryFlip1_FoundMooshika = ({ onContinue }) => {
  return (
    <DiscoveryFlip
      // Left page - Celebration
      celebrationTitle="You Found Mooshika!"
      celebrationText="He was hiding so well! Mooshika has something magical to share with you..."
      celebrationImage="/assets/mooshika-happy.png" // Your Mooshika celebrating image
      
      // Right page - Power unlock
      powerTitle="Divine Guidance Power Unlocked!"
      powerText="Mooshika can now help you make wise choices! Let's use this power to collect yummy modaks for Ganesha."
      powerImage="/assets/divine-guidance-icon.png" // Your power symbol
      
      // Button
      buttonText="Let's Collect Modaks!"
      onContinue={onContinue}
      
      // Optional: Auto flip after 2 seconds
      autoFlip={true}
      autoFlipDelay={2000}
    />
  );
};

// ============================================
// DISCOVERY FLIP 2: Collected Modaks
// ============================================
const DiscoveryFlip2_CollectedModaks = ({ onContinue, modakCount }) => {
  return (
    <DiscoveryFlip
      // Left page - Celebration
      celebrationTitle="Amazing Collection!"
      celebrationText={`You collected ${modakCount || 'all'} modaks! Mooshika is so happy and proud of your hard work!`}
      celebrationImage="/assets/basket-full-modaks.png" // Basket with modaks
      
      // Right page - Power unlock
      powerTitle="Sharing Power Unlocked!"
      powerText="You learned that collecting is even more fun when you share! Now let's take these yummy modaks to Ganesha."
      powerImage="/assets/sharing-power-icon.png" // Heart or sharing symbol
      
      // Button
      buttonText="Let's Feed Ganesha!"
      onContinue={onContinue}
      
      // Optional: Auto flip
      autoFlip={true}
      autoFlipDelay={2500}
    />
  );
};

// ============================================
// DISCOVERY FLIP 3: Fed Ganesha (Complete!)
// ============================================
const DiscoveryFlip3_FedGanesha = ({ onContinue }) => {
  return (
    <DiscoveryFlip
      // Left page - Celebration
      celebrationTitle="Ganesha is So Happy!"
      celebrationText="His tummy is full of yummy modaks! You helped Mooshika complete his special seva (service)."
      celebrationImage="/assets/ganesha-happy-full.png" // Happy Ganesha
      
      // Right page - Power unlock
      powerTitle="Gratitude Power Complete!"
      powerText="You unlocked all three divine powers: Guidance, Sharing, and Gratitude! You're ready for new adventures!"
      powerImage="/assets/all-three-powers.png" // All 3 power symbols together
      
      // Button
      buttonText="Celebrate!"
      onContinue={onContinue}
      
      // Don't auto flip - let them enjoy the victory
      autoFlip={false}
    />
  );
};

// ============================================
// EXAMPLE: How to use in ModakScene component
// ============================================
const ModakSceneExample = () => {
  const [currentPhase, setCurrentPhase] = React.useState('gameplay1');
  const [modaksCollected, setModaksCollected] = React.useState(0);

  const handlePhase1Complete = () => {
    setCurrentPhase('discovery1');
  };

  const handleDiscovery1Continue = () => {
    setCurrentPhase('gameplay2');
  };

  const handlePhase2Complete = (count) => {
    setModaksCollected(count);
    setCurrentPhase('discovery2');
  };

  const handleDiscovery2Continue = () => {
    setCurrentPhase('gameplay3');
  };

  const handlePhase3Complete = () => {
    setCurrentPhase('discovery3');
  };

  const handleDiscovery3Continue = () => {
    // Go to completion page with all options
    setCurrentPhase('completion');
  };

  return (
    <div className="modak-scene">
      {/* Phase 1: Find Mooshika gameplay */}
      {currentPhase === 'gameplay1' && (
        <FindMooshikaGame onComplete={handlePhase1Complete} />
      )}

      {/* Discovery 1: Found Mooshika */}
      {currentPhase === 'discovery1' && (
        <DiscoveryFlip1_FoundMooshika onContinue={handleDiscovery1Continue} />
      )}

      {/* Phase 2: Collect Modaks gameplay */}
      {currentPhase === 'gameplay2' && (
        <CollectModaksGame onComplete={handlePhase2Complete} />
      )}

      {/* Discovery 2: Collected Modaks */}
      {currentPhase === 'discovery2' && (
        <DiscoveryFlip2_CollectedModaks 
          modakCount={modaksCollected}
          onContinue={handleDiscovery2Continue} 
        />
      )}

      {/* Phase 3: Feed Ganesha gameplay */}
      {currentPhase === 'gameplay3' && (
        <FeedGaneshaGame onComplete={handlePhase3Complete} />
      )}

      {/* Discovery 3: Mission Complete */}
      {currentPhase === 'discovery3' && (
        <DiscoveryFlip3_FedGanesha onContinue={handleDiscovery3Continue} />
      )}

      {/* Completion page with all options */}
      {currentPhase === 'completion' && (
        <CompletionPage />
      )}
    </div>
  );
};

// ============================================
// CUSTOM IMAGE COMPONENTS (if not using img URLs)
// ============================================

// Example: Custom animated Mooshika component
const MooshikaCelebrating = () => {
  return (
    <div style={{ position: 'relative', width: '180px', height: '180px' }}>
      <img 
        src="/assets/mooshika.png" 
        alt="Mooshika" 
        style={{
          width: '100%',
          height: '100%',
          animation: 'bounce 0.5s ease infinite'
        }}
      />
      {/* Add sparkles or effects */}
      <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '30px' }}>
        ✨
      </div>
    </div>
  );
};

// Example usage with custom component:
const DiscoveryWithCustomImage = ({ onContinue }) => {
  return (
    <DiscoveryFlip
      celebrationTitle="You Found Mooshika!"
      celebrationText="He was hiding so well!"
      celebrationImage={<MooshikaCelebrating />} // Pass component, not string
      
      powerTitle="Divine Guidance Unlocked!"
      powerText="Let's collect modaks!"
      powerImage="/assets/power-icon.png"
      
      buttonText="Continue"
      onContinue={onContinue}
    />
  );
};

export {
  DiscoveryFlip1_FoundMooshika,
  DiscoveryFlip2_CollectedModaks,
  DiscoveryFlip3_FedGanesha,
  ModakSceneExample,
  DiscoveryWithCustomImage
};