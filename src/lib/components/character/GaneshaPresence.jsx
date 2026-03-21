import React from 'react';
import GaneshaCharacter from './GaneshaCharacter';

const POSE_EXPRESSION_MAP = {
  blessing: 'happy',
  pointing: 'encouraging',
  thumbs_up: 'happy',
  okay: 'happy',
  celebration: 'excited',
};

const GaneshaPresence = ({
  pose = 'blessing',
  size = 120,
  expression = null,
  breathing = false,
  blink = false,
  className = '',
  style = {},
  ...rest
}) => {
  const resolvedExpression = expression || POSE_EXPRESSION_MAP[pose] || 'happy';

  return (
    <GaneshaCharacter
      pose={pose}
      expression={resolvedExpression}
      size={size}
      breathing={breathing}
      blink={blink}
      className={className}
      style={style}
      {...rest}
    />
  );
};

export default GaneshaPresence;
