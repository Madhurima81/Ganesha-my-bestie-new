import React, { useState, useEffect, Suspense, lazy } from 'react';
import GameStateManager from '../../lib/services/GameStateManager';
import ProgressManager from '../../lib/services/ProgressManager';
import ScreenHeader from '../../lib/components/shared/ScreenHeader';
import './SymbolMountainFlipbook.css';

// ✅ ACTUAL SCENE IMPORTS - Lazy load your existing scenes
const ModakScene = lazy(() => import('./scenes/modak/NewModakSceneV5'));
const PondScene = lazy(() => import('./scenes/pond/PondSceneSimplifiedV4'));
const TuskScene = lazy(() => import('./scenes/tusk/SymbolMountainSceneV3'));
const AssemblyScene = lazy(() => import('./scenes/final scene/SacredAssemblySceneV8'));

const SymbolMountainFlipbook = (props) => {
  const [viewMode, setViewMode] = useState('chapter'); // 'chapter' | 'page'
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageTurning, setIsPageTurning] = useState(false);
  const [turnDirection, setTurnDirection] = useState('next');
  const [progressData, setProgressData] = useState({});

  // ✅ CONNECT TO YOUR PROGRESS SYSTEM
  const loadProgress = () => {
    const activeProfileId = localStorage.getItem('activeProfileId');
    if (!activeProfileId) return {};
    
    try {
      const progress = ProgressManager.getZoneProgress(activeProfileId, 'symbol-mountain');
      console.log('📖 Flipbook progress loaded:', progress);
      setProgressData(progress || {});
      return progress || {};
    } catch (error) {
      console.error('Error loading progress:', error);
      return {};
    }
  };

  // Load progress on component mount
  useEffect(() => {
    loadProgress();
  }, []);

  // ✅ DYNAMIC SCENE STATUS based on your progress system
  const getSceneStatus = (sceneId) => {
    const sceneData = progressData[sceneId];
    if (sceneData?.completed) return 'completed';
    
    // First scene is always unlocked
    if (sceneId === 'modak') return 'unlocked';
    
    // Check if previous scene is completed
    const sceneOrder = ['modak', 'pond', 'symbol', 'final-scene'];
    const currentIndex = sceneOrder.indexOf(sceneId);
    
    if (currentIndex > 0) {
      const previousScene = sceneOrder[currentIndex - 1];
      const previousData = progressData[previousScene];
      return previousData?.completed ? 'unlocked' : 'locked';
    }
    
    return 'locked';
  };

  // ✅ SYMBOL MOUNTAIN CHAPTER DATA with real progress
  const chapterData = {
    id: 2,
    title: "Symbol Mountain",
    subtitle: "Discover the Sacred Symbols",
    icon: "⛰️",
    totalPages: 4,
    scenes: [
      {
        id: 1,
        sceneKey: 'modak',
        title: "Modak Forest",
        subtitle: "Sweet Beginnings",
        icon: "🍯",
        symbol: "Modak",
        status: getSceneStatus('modak'),
        stars: progressData.modak?.stars || 0,
        symbols: progressData.modak?.symbols || {}
      },
      {
        id: 2,
        sceneKey: 'pond',
        title: "Sacred Pond",
        subtitle: "Reflection and Wisdom",
        icon: "🏞️", 
        symbol: "Lotus",
        status: getSceneStatus('pond'),
        stars: progressData.pond?.stars || 0,
        symbols: progressData.pond?.symbols || {},
        requirement: "Complete Modak Forest"
      },
      {
        id: 3,
        sceneKey: 'symbol',
        title: "Sacred Tusk",
        subtitle: "Strength and Protection",
        icon: "🐘",
        symbol: "Tusk",
        status: getSceneStatus('symbol'),
        stars: progressData.symbol?.stars || 0,
        symbols: progressData.symbol?.symbols || {},
        requirement: "Complete Sacred Pond"
      },
      {
        id: 4,
        sceneKey: 'final-scene',
        title: "Sacred Assembly",
        subtitle: "Unity and Completion",
        icon: "🕉️",
        symbol: "Om",
        status: getSceneStatus('final-scene'),
        stars: progressData['final-scene']?.stars || 0,
        symbols: progressData['final-scene']?.symbols || {},
        requirement: "Complete Sacred Tusk"
      }
    ],
    progress: {
      symbols: Object.keys(progressData).reduce((total, key) => {
        const sceneSymbols = progressData[key]?.symbols || {};
        return total + Object.keys(sceneSymbols).length;
      }, 0),
      completedScenes: Object.keys(progressData).filter(key => progressData[key]?.completed).length,
      adventures: `${Object.keys(progressData).filter(key => progressData[key]?.completed).length}/4`
    }
  };

  const handlePageTurn = (direction) => {
    if (isPageTurning) return;
    
    const newPage = currentPage + direction;
    if (newPage < 1 || newPage > chapterData.totalPages) return;
    
    // Check if new page is unlocked
    const targetScene = chapterData.scenes[newPage - 1];
    if (targetScene.status === 'locked') {
      console.log('🔒 Cannot navigate to locked scene:', targetScene.title);
      return;
    }
    
    setIsPageTurning(true);
    setTurnDirection(direction > 0 ? 'next' : 'prev');
    
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsPageTurning(false);
    }, 400);
  };

  const handleSceneSelect = (sceneId) => {
    const scene = chapterData.scenes.find(s => s.id === sceneId);
    if (scene.status === 'locked') {
      console.log('🔒 Scene locked:', scene.title);
      return;
    }
    
    setCurrentPage(sceneId);
    setViewMode('page');
  };

  const handleBackToChapter = () => {
    setViewMode('chapter');
    // Reload progress when returning to chapter
    loadProgress();
  };

  const handleBackToMap = () => {
    // ✅ USE YOUR APP'S NAVIGATION SYSTEM
    if (props.onNavigate) {
      props.onNavigate('map');
    } else {
      console.error('No onNavigate prop provided to flipbook');
    }
  };

  // ✅ HANDLE SCENE COMPLETION from your scenes
  const handleSceneComplete = (sceneKey, completionData) => {
    console.log('📖 Flipbook: Scene completed:', sceneKey, completionData);
    
    // Pass completion up to your main app
    if (props.onComplete) {
      props.onComplete(sceneKey, completionData);
    }
    
    // Refresh progress and stay in flipbook
    setTimeout(() => {
      loadProgress();
      // Force re-render with updated progress
      setViewMode('chapter');
    }, 1000);
  };

  if (viewMode === 'chapter') {
    return <ChapterOverview 
      chapterData={chapterData}
      onSceneSelect={handleSceneSelect}
      onBackToMap={handleBackToMap}
    />;
  }

  return (
    <div className="flipbook-container">
      {/* Book Spine */}
      <BookSpine 
        currentChapter={2}
        onBackToChapter={handleBackToChapter}
      />
      
      {/* Main Page Content */}
      <div className={`book-page ${isPageTurning ? `turning-${turnDirection}` : ''}`}>
        <PageContent 
          chapterData={chapterData}
          currentPage={currentPage}
          onPageTurn={handlePageTurn}
          onSceneComplete={handleSceneComplete}
          onNavigate={props.onNavigate}
        />
      </div>
      
      {/* Page Navigation */}
      <PageNavigation 
        currentPage={currentPage}
        totalPages={chapterData.totalPages}
        onPageTurn={handlePageTurn}
        isPageTurning={isPageTurning}
        chapterData={chapterData}
      />
    </div>
  );
};

// Chapter Overview (Your existing zone navigation styled as book chapter)
const ChapterOverview = ({ chapterData, onSceneSelect, onBackToMap }) => {
  return (
    <div className="chapter-overview">

      {/* Divine center glow */}
      <div className="map-glow" aria-hidden="true" />

      {/* Floating particles */}
      <div className="ch-particles" aria-hidden="true">
        <span/><span/><span/><span/>
      </div>

      {/* Header with back button */}
      <div className="chapter-header">
        <button className="back-to-map-btn" onClick={onBackToMap}>
          ← Back to Map
        </button>
        <div className="chapter-title-section">
          <ScreenHeader
            title={chapterData.title}
            subtitle={chapterData.subtitle}
            glowColor="gold"
            icon={chapterData.icon}
          />
        </div>
      </div>

      {/* Scene Selection Grid */}
      <div className="scenes-grid">
        {chapterData.scenes.map((scene, index) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            pageNumber={index + 1}
            onSelect={() => onSceneSelect(scene.id)}
          />
        ))}
      </div>

      {/* Progress Footer */}
      <div className="chapter-progress">
        <div className="progress-stat">
          <span className="stat-icon">🔮</span>
          <span>{chapterData.progress.symbols} SYMBOLS</span>
        </div>
        <div className="progress-stat">
          <span className="stat-icon">🔍</span>
          <span>Wisdom Seeker</span>
        </div>
        <div className="progress-stat">
          <span className="stat-icon">🏆</span>
          <span>{chapterData.progress.adventures} ADVENTURES</span>
        </div>
      </div>
    </div>
  );
};

// Individual Scene Card
const SceneCard = ({ scene, pageNumber, onSelect }) => {
  const getActionText = () => {
    switch (scene.status) {
      case 'completed': return '🎮 Play Again';
      case 'unlocked': return '🚀 Start Adventure';
      case 'locked': return '🔒 ' + (scene.requirement || 'Complete Previous');
      default: return 'Unknown';
    }
  };

  return (
    <div
      className={`scene-card ${scene.status}`}
      onClick={scene.status !== 'locked' ? onSelect : undefined}
    >
      {/* Inner surface — spec's zone-inner */}
      <div className="zone-inner">
        <div className="card-header">
          <span className="page-number">{pageNumber}</span>
          <span className="scene-icon">{scene.icon}</span>
        </div>

        <div className="card-content">
          <h3>{scene.title}</h3>
          <p>{scene.subtitle}</p>
          <div className="symbol-preview">
            Symbol: {scene.symbol}
          </div>
          {Object.keys(scene.symbols).length > 0 && (
            <div className="discovered-symbols">
              Discovered: {Object.keys(scene.symbols).join(', ')}
            </div>
          )}
        </div>

        <div className="card-footer">
          <button
            className={`action-btn ${scene.status}`}
            disabled={scene.status === 'locked'}
          >
            {getActionText()}
          </button>

          {scene.stars > 0 && (
            <div className="stars">
              {'⭐'.repeat(scene.stars)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Book Spine Navigation
const BookSpine = ({ currentChapter, onBackToChapter }) => {
  const chapters = [
    { id: 1, title: "About Me", icon: "🏠", status: "completed" },
    { id: 2, title: "Symbol Mountain", icon: "⛰️", status: "current" },
    { id: 3, title: "Cave of Secrets", icon: "🕳️", status: "locked" },
    { id: 4, title: "Shloka River", icon: "🌊", status: "locked" },
    { id: 5, title: "Story Tree", icon: "🌳", status: "locked" },
    { id: 6, title: "Obstacle Forest", icon: "🌲", status: "locked" },
    { id: 7, title: "Festival Square", icon: "🎪", status: "locked" }
  ];

  return (
    <div className="book-spine">
      <div className="book-title">
        📖 Ganesha's<br/>Learning Book
      </div>
      
      <button className="back-to-chapter" onClick={onBackToChapter}>
        ← Chapter Overview
      </button>
      
      <div className="chapters-list">
        {chapters.map(chapter => (
          <div 
            key={chapter.id}
            className={`spine-chapter ${chapter.id === currentChapter ? 'current' : chapter.status}`}
          >
            <span className="chapter-icon">{chapter.icon}</span>
            <span className="chapter-title">{chapter.title}</span>
            {chapter.status === 'completed' && <span className="chapter-mark">✓</span>}
            {chapter.status === 'current' && <span className="chapter-mark">📖</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// Page Content (Individual scene as book page)
const PageContent = ({ chapterData, currentPage, onPageTurn, onSceneComplete, onNavigate }) => {
  const currentScene = chapterData.scenes[currentPage - 1];
  
  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-info">
          <span className="page-number">Page {currentPage}</span>
          <span className="chapter-name">Chapter 2: Symbol Mountain</span>
        </div>
        <div className="scene-title">
          <span className="scene-icon">{currentScene.icon}</span>
          <span>{currentScene.title}</span>
        </div>
      </div>

      {/* Main Scene Content */}
      <div className="scene-content">
        <SceneWrapper 
          currentPage={currentPage} 
          currentScene={currentScene}
          onSceneComplete={onSceneComplete}
          onNavigate={onNavigate}
        />
      </div>

      {/* Page Footer with Turn Corners */}
      <div className="page-footer">
        <div 
          className="page-corner-left"
          onClick={() => onPageTurn(-1)}
          style={{ 
            opacity: currentPage === 1 ? 0.3 : 1,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          {currentPage > 1 && (
            <>
              <span>◀</span>
              <span>{chapterData.scenes[currentPage - 2]?.title}</span>
            </>
          )}
        </div>
        
        <div className="page-center">
          <div className="symbol-learning">
            <span className="symbol-icon">🔮</span>
            <span>Symbol: {currentScene.symbol}</span>
          </div>
        </div>
        
        <div 
          className="page-corner-right"
          onClick={() => onPageTurn(1)}
          style={{ 
            opacity: currentPage === chapterData.totalPages ? 0.3 : 1,
            cursor: currentPage === chapterData.totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          {currentPage < chapterData.totalPages && (
            <>
              <span>{chapterData.scenes[currentPage]?.title}</span>
              <span>▶</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ SCENE WRAPPER - Handles loading your actual scenes with proper props
const SceneWrapper = ({ currentPage, currentScene, onSceneComplete, onNavigate }) => {
  const sceneKey = currentScene.sceneKey;
  
  // ✅ PROPS TO PASS TO YOUR SCENES
  const sceneProps = {
    onNavigate,
    onComplete: (completionData) => onSceneComplete(sceneKey, completionData),
    onSceneSelect: onNavigate, // For any scene-to-scene navigation
    zoneId: 'symbol-mountain',
    sceneId: sceneKey
  };

  const LoadingSpinner = () => (
    <div className="scene-loading">
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>
        {currentScene.icon}
      </div>
      <div style={{ fontSize: '24px', color: '#333' }}>
        Loading {currentScene.title}...
      </div>
    </div>
  );

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {currentPage === 1 && <ModakScene {...sceneProps} />}
      {currentPage === 2 && <PondScene {...sceneProps} />}
      {currentPage === 3 && <TuskScene {...sceneProps} />}
      {currentPage === 4 && <AssemblyScene {...sceneProps} />}
    </Suspense>
  );
};

// Page Navigation
const PageNavigation = ({ currentPage, totalPages, onPageTurn, isPageTurning, chapterData }) => {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages && chapterData.scenes[currentPage]?.status !== 'locked';

  return (
    <div className="page-navigation">
      <button 
        className="nav-btn prev"
        onClick={() => onPageTurn(-1)}
        disabled={!canGoPrev || isPageTurning}
      >
        ◀ Previous Page
      </button>
      
      <div className="page-indicator">
        <div className="page-dots">
          {Array.from({ length: totalPages }, (_, i) => {
            const pageScene = chapterData.scenes[i];
            const isLocked = pageScene?.status === 'locked';
            return (
              <div
                key={i}
                className={`page-dot ${i + 1 === currentPage ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => !isPageTurning && !isLocked && onPageTurn(i + 1 - currentPage)}
                title={isLocked ? `🔒 ${pageScene.requirement || 'Complete previous scenes'}` : pageScene.title}
              />
            );
          })}
        </div>
        <span className="page-text">Page {currentPage} of {totalPages}</span>
      </div>
      
      <button 
        className="nav-btn next"
        onClick={() => onPageTurn(1)}
        disabled={!canGoNext || isPageTurning}
      >
        Next Page ▶
      </button>
    </div>
  );
};

export default SymbolMountainFlipbook;
