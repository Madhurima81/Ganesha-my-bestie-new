// GaneshaEngineTest.jsx
// DEV ONLY — test harness for useGaneshaEngine
// Access via: http://localhost:5173/?engine-test
// Remove or gate behind isDev flag before production build

import { useGaneshaEngine } from '../../hooks/useGaneshaEngine';

export default function GaneshaEngineTest() {
  const engine = useGaneshaEngine({ childAge: 8 });

  const testAnger = () => {
    engine.setEmotionContext({
      primary_emotion:       'anger',
      intensity_level:       'strong',
      nervous_system_need:   'energy_release',
      nature_zone:           'mountain',
      symbol_anchor:         'trunk',
      desired_after_state:   'calm',
      safety_flag:           'none',
    });
  };

  const testWorry = () => {
    engine.setEmotionContext({
      primary_emotion:       'anxiety',
      intensity_level:       'medium',
      nervous_system_need:   'stillness',
      nature_zone:           'river',
      symbol_anchor:         'lotus',
      desired_after_state:   'grounded',
      safety_flag:           'none',
    });
  };

  const testSadness = () => {
    engine.setEmotionContext({
      primary_emotion:       'sadness',
      intensity_level:       'mild',
      nervous_system_need:   'connection',
      nature_zone:           'cave',
      symbol_anchor:         'belly',
      desired_after_state:   'hopeful',
      safety_flag:           'none',
    });
  };

  const testNegSelf = () => {
    engine.processChildMessage("I am stupid and nobody likes me");
  };

  const testWithdrawal = () => {
    engine.processChildMessage("whatever forget it");
  };

  const btnStyle = (color) => ({
    background: color,
    color: 'white',
    border: 'none',
    borderRadius: 10,
    padding: '10px 18px',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    minHeight: 44,
  });

  const sectionStyle = {
    marginBottom: 20,
    padding: '14px 16px',
    background: '#FAF6EE',
    borderRadius: 12,
    border: '1px solid #E8DFF5',
  };

  return (
    <div style={{ padding: 24, fontFamily: 'Nunito, sans-serif', maxWidth: 900, margin: '0 auto' }}>

      <h2 style={{ fontFamily: 'Baloo 2, cursive', color: '#6752B8', marginBottom: 4 }}>
        🐘 Ganesha Engine — Test Harness
      </h2>
      <p style={{ color: '#8B7AB0', fontSize: 13, marginBottom: 24 }}>
        DEV ONLY — tap buttons, check console output below
      </p>

      {/* Emotion context setters */}
      <div style={sectionStyle}>
        <div style={{ fontWeight: 700, color: '#5A4A7A', marginBottom: 10 }}>Set Emotion Context</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={btnStyle('#FF5722')} onClick={testAnger}>😡 Anger (strong)</button>
          <button style={btnStyle('#9C84FF')} onClick={testWorry}>😰 Anxiety (medium)</button>
          <button style={btnStyle('#39AFA3')} onClick={testSadness}>😢 Sadness (mild)</button>
        </div>
      </div>

      {/* Message processors */}
      <div style={sectionStyle}>
        <div style={{ fontWeight: 700, color: '#5A4A7A', marginBottom: 10 }}>Process Child Message</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={btnStyle('#E91E63')} onClick={testNegSelf}>⚠️ Negative self-language</button>
          <button style={btnStyle('#FF9800')} onClick={testWithdrawal}>🚪 Withdrawal</button>
          <button
            style={btnStyle('#607D8B')}
            onClick={() => engine.processChildMessage("I just feel really sad today")}
          >
            💬 Process message
          </button>
        </div>
      </div>

      {/* Engine outputs */}
      <div style={sectionStyle}>
        <div style={{ fontWeight: 700, color: '#5A4A7A', marginBottom: 10 }}>Engine Outputs (→ console)</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            style={btnStyle('#2E7D32')}
            onClick={() => {
              const tools = engine.getDoorwayTools();
              console.log('🐘 Doorway tools:', tools);
            }}
          >
            🚪 Get doorway tools
          </button>
          <button
            style={btnStyle('#1565C0')}
            onClick={() => {
              const line = engine.getInvitationLine();
              console.log('💬 Invitation line:', line);
            }}
          >
            ✉️ Get invitation line
          </button>
          <button
            style={btnStyle('#6A1B9A')}
            onClick={() => {
              const result = engine.getCompletionMessage();
              console.log('⭐ Completion message:', result);
            }}
          >
            ⭐ Get completion msg
          </button>
          <button
            style={btnStyle('#5D4037')}
            onClick={() => {
              const should = engine.shouldShowInvitation();
              console.log('❓ Should show invitation?', should);
            }}
          >
            ❓ Should invite?
          </button>
        </div>
      </div>

      {/* Reset */}
      <div style={{ marginBottom: 20 }}>
        <button
          style={{ ...btnStyle('#90A4AE'), background: 'none', color: '#90A4AE', border: '1.5px solid #90A4AE' }}
          onClick={() => { engine.resetSession(); console.log('🔄 Session reset'); }}
        >
          🔄 Reset session
        </button>
      </div>

      {/* Live session state */}
      <div style={sectionStyle}>
        <div style={{ fontWeight: 700, color: '#5A4A7A', marginBottom: 8 }}>Live Session State</div>
        <pre style={{
          fontSize: 11,
          color: '#3D2D5C',
          background: '#F0EBF8',
          padding: 12,
          borderRadius: 8,
          overflowX: 'auto',
          margin: 0,
        }}>
          {JSON.stringify(engine.session, null, 2)}
        </pre>
      </div>

    </div>
  );
}
