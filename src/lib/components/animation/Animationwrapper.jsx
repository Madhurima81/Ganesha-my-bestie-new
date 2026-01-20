// lib/components/animation/AnimationWrapper.jsx
// Universal Animation Wrapper - Use anywhere in any scene!

import React from 'react';
import './AnimationWrapper.css';

/**
 * AnimationWrapper - Wraps any element with fun animations
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The element(s) to animate
 * @param {string} props.animation - Animation type (see list below)
 * @param {number} props.duration - Animation duration in seconds (default: 1)
 * @param {number} props.delay - Animation delay in seconds (default: 0)
 * @param {boolean} props.infinite - Loop animation forever (default: false)
 * @param {string} props.trigger - When to trigger: 'hover', 'click', 'always' (default: 'always')
 * @param {Function} props.onAnimationEnd - Callback when animation completes
 * 
 * AVAILABLE ANIMATIONS:
 * - Entrance: fadeIn, slideInRight, slideInLeft, slideInUp, slideInDown, popIn, spinIn, zoomIn
 * - Attention: pulse, heartbeat, wiggle, shake, bounce, jiggle, glow, tada
 * - Movement: float, bob, sway, swing
 * - Exit: fadeOut, slideOutLeft, slideOutRight, zoomOut, spinOut
 * - Special: flip3D, rotate360, rainbow, elastic
 */

const AnimationWrapper = ({ 
  children, 
  animation = 'fadeIn',
  duration = 1,
  delay = 0,
  infinite = false,
  trigger = 'always',
  onAnimationEnd = () => {}
}) => {
  const [isTriggered, setIsTriggered] = React.useState(trigger === 'always');
  const [hasPlayed, setHasPlayed] = React.useState(false);

  const handleInteraction = () => {
    if (trigger !== 'always' && !hasPlayed) {
      setIsTriggered(true);
      setHasPlayed(true);
    }
  };

  const handleAnimationEnd = () => {
    onAnimationEnd();
    if (!infinite && trigger !== 'always') {
      setIsTriggered(false);
    }
  };

  const animationClass = `anim-${animation}`;
  const infiniteClass = infinite ? 'anim-infinite' : '';
  const triggerClass = isTriggered ? 'anim-active' : '';
  
  const style = {
    '--anim-duration': `${duration}s`,
    '--anim-delay': `${delay}s`
  };

  const wrapperProps = {
    className: `animation-wrapper ${animationClass} ${infiniteClass} ${triggerClass}`,
    style,
    onAnimationEnd: handleAnimationEnd
  };

  if (trigger === 'hover') {
    wrapperProps.onMouseEnter = handleInteraction;
  } else if (trigger === 'click') {
    wrapperProps.onClick = handleInteraction;
  }

  return (
    <div {...wrapperProps}>
      {children}
    </div>
  );
};

export default AnimationWrapper;


/**
 * USAGE EXAMPLES:
 * 
 * 1. ENTRANCE ANIMATIONS:
 * <AnimationWrapper animation="popIn" duration={0.6}>
 *   <img src={ganesha} alt="Ganesha" />
 * </AnimationWrapper>
 * 
 * 2. CONTINUOUS ANIMATIONS:
 * <AnimationWrapper animation="float" infinite={true}>
 *   <div className="cloud">☁️</div>
 * </AnimationWrapper>
 * 
 * 3. HOVER TRIGGERED:
 * <AnimationWrapper animation="bounce" trigger="hover" duration={0.3}>
 *   <button>Click Me!</button>
 * </AnimationWrapper>
 * 
 * 4. DELAYED ENTRANCE:
 * <AnimationWrapper animation="slideInRight" delay={0.5}>
 *   <div className="card">Hello!</div>
 * </AnimationWrapper>
 * 
 * 5. STAGGERED ANIMATIONS (multiple items):
 * {items.map((item, i) => (
 *   <AnimationWrapper key={i} animation="popIn" delay={i * 0.1}>
 *     <div>{item}</div>
 *   </AnimationWrapper>
 * ))}
 * 
 * 6. ATTENTION GRABBER:
 * <AnimationWrapper animation="pulse" infinite={true}>
 *   <div className="hint">👆 Click here!</div>
 * </AnimationWrapper>
 * 
 * 7. WITH CALLBACK:
 * <AnimationWrapper 
 *   animation="fadeOut" 
 *   duration={0.5}
 *   onAnimationEnd={() => console.log('Animation done!')}
 * >
 *   <div>I'll fade out</div>
 * </AnimationWrapper>
 */