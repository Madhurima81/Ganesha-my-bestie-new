// Central export for all content configs
// Import from this file to access all content in one place

export {
  OPENING_MODALS,
  getOpeningModal,
  hasOpeningModal
} from './openingModals';

export {
  SCENE_HEADERS,
  getSceneHeader,
  getSceneHeaders,
  formatHeader
} from './sceneHeaders';

export {
  DISCOVERY_CONTENT,
  getDiscoveryContent,
  getCelebrationContent,
  getPowerContent,
  hasDiscoveryOverlay
} from './discoveryContent';

export {
  MODAL_CONTENT,
  RESUME_MESSAGES,
  SUCCESS_MESSAGES,
  getModalContent,
  getResumeMessage,
  getSuccessMessage,
  formatModalContent
} from './modalContent';

// ========================================
// Usage Examples:
// ========================================

/*
// Example 1: Get opening modal content
import { getOpeningModal } from '@/lib/config/content';

const openingContent = getOpeningModal('symbol-mountain', 'modak-scene');
console.log(openingContent.title); // "Help Ganesha Save the Forest!"


// Example 2: Get scene header with variables
import { getSceneHeader, formatHeader } from '@/lib/config/content';

const headerTemplate = getSceneHeader('symbol-mountain', 'modak-scene', 'collection');
const header = formatHeader(headerTemplate, { count: 2 });
console.log(header); // "🍬 HELP MOOSHIKA! Collect 2/3 modaks!"


// Example 3: Get discovery content
import { getDiscoveryContent } from '@/lib/config/content';

const mooshikaContent = getDiscoveryContent('symbol-mountain', 'modak-scene', 'mooshika');
console.log(mooshikaContent.celebration.title); // "You Found Mooshika!"
console.log(mooshikaContent.power.affirmation); // "I can focus"


// Example 4: Get modal content
import { getModalContent } from '@/lib/config/content';

const doorModal = getModalContent('meaning-cave', 'vakratunda-mahakaya', 'door1Complete');
console.log(doorModal.title); // "Door Unlocked!"


// Example 5: Get resume message with variables
import { getResumeMessage } from '@/lib/config/content';

const resumeMsg = getResumeMessage(
  'symbol-mountain',
  'modak-scene',
  'collectionInProgress',
  { count: 2 }
);
console.log(resumeMsg); // "Continue collecting modaks! You have 2/3 in the basket!"


// Example 6: Check if zone has discovery overlays
import { hasDiscoveryOverlay } from '@/lib/config/content';

console.log(hasDiscoveryOverlay('symbol-mountain')); // true (learning zone)
console.log(hasDiscoveryOverlay('festival-square')); // false (play zone)
*/
