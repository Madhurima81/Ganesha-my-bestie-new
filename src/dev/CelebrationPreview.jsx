/**
 * Dev-only: renders the shared SceneCompletionCelebration (the "closing modal")
 * with sample data so it can be screenshotted from the game-test harness
 * without playing a full scene to completion. Not referenced in production.
 */
import React from 'react';
import SceneCompletionCelebration from '../lib/components/celebration/SceneCompletionCelebration';

export default function CelebrationPreview({ zoneId = 'symbol-mountain' }) {
  const isRiver = zoneId === 'shloka-river';

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <SceneCompletionCelebration
        show
        zoneId={zoneId}
        sceneId={isRiver ? 'vakratunda-grove' : 'modak'}
        sceneName={isRiver ? 'Vakratunda Grove' : 'Modak Mountain'}
        childName="Aarav"
        completionTitle={isRiver ? 'Two chants, two gifts!' : 'You shared every modak!'}
        completionSubtitle={
          isRiver
            ? 'We found another way, and we grew strong together.'
            : 'Mooshika is happy, and so is Ganesha.'
        }
        containerType={isRiver ? 'backpack' : 'backpack'}
        discoveredSymbols={isRiver ? ['vakratunda', 'mahakaya'] : ['modak', 'belly']}
        nextSceneName={isRiver ? 'Suryakoti Bank' : 'Lotus Pond'}
        onContinue={() => {}}
        onReplay={() => {}}
        onExploreZones={() => {}}
        onBackToMap={() => {}}
        onHome={() => {}}
      />
    </div>
  );
}
