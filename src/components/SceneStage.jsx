import './SceneStage.css';

/**
 * Fixed-design-resolution stage. All children positioned in %
 * of designWidth × designHeight render identically on every device.
 */
export default function SceneStage({
  designWidth = 1280,
  designHeight = 800,
  background,
  className = '',
  children
}) {
  return (
    <div className="scene-stage-viewport">
      <div
        className={`scene-stage ${className}`.trim()}
        style={{
          width: designWidth,
          height: designHeight,
          '--dw': designWidth,
          '--dh': designHeight,
          backgroundImage: background ? `url(${background})` : undefined
        }}
      >
        {children}
      </div>
    </div>
  );
}
