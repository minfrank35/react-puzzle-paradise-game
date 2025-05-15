import React, { useState, useEffect } from 'react';

function Settings() {
  // 로컬 스토리지에서 설정 가져오기 (또는 기본값 사용)
  const [settings, setSettings] = useState({
    volume: localStorage.getItem('settings_volume') || 70,
    soundEffects: localStorage.getItem('settings_soundEffects') === 'true',
    showTimer: localStorage.getItem('settings_showTimer') === 'true',
    defaultDifficulty: localStorage.getItem('settings_defaultDifficulty') || 'normal',
    theme: localStorage.getItem('settings_theme') || 'light',
    adPreference: localStorage.getItem('settings_adPreference') || 'video',
  });
  
  // 설정 변경시 로컬 스토리지 업데이트
  useEffect(() => {
    localStorage.setItem('settings_volume', settings.volume);
    localStorage.setItem('settings_soundEffects', settings.soundEffects);
    localStorage.setItem('settings_showTimer', settings.showTimer);
    localStorage.setItem('settings_defaultDifficulty', settings.defaultDifficulty);
    localStorage.setItem('settings_theme', settings.theme);
    localStorage.setItem('settings_adPreference', settings.adPreference);
  }, [settings]);
  
  // 설정 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // 기본 설정으로 초기화
  const resetDefaults = () => {
    const defaultSettings = {
      volume: 70,
      soundEffects: true,
      showTimer: true,
      defaultDifficulty: 'normal',
      theme: 'light',
      adPreference: 'video',
    };
    
    setSettings(defaultSettings);
  };
  
  return (
    <div className="settings-page">
      <h2>설정</h2>
      
      <div className="settings-container">
        <section className="settings-section">
          <h3>소리 설정</h3>
          
          <div className="setting-item">
            <label htmlFor="volume">볼륨</label>
            <input
              type="range"
              id="volume"
              name="volume"
              min="0"
              max="100"
              value={settings.volume}
              onChange={handleChange}
            />
            <span>{settings.volume}%</span>
          </div>
          
          <div className="setting-item">
            <label htmlFor="soundEffects">효과음</label>
            <input
              type="checkbox"
              id="soundEffects"
              name="soundEffects"
              checked={settings.soundEffects}
              onChange={handleChange}
            />
          </div>
        </section>
        
        <section className="settings-section">
          <h3>게임 설정</h3>
          
          <div className="setting-item">
            <label htmlFor="showTimer">타이머 표시</label>
            <input
              type="checkbox"
              id="showTimer"
              name="showTimer"
              checked={settings.showTimer}
              onChange={handleChange}
            />
          </div>
          
          <div className="setting-item">
            <label htmlFor="defaultDifficulty">기본 난이도</label>
            <select
              id="defaultDifficulty"
              name="defaultDifficulty"
              value={settings.defaultDifficulty}
              onChange={handleChange}
            >
              <option value="easy">쉬움</option>
              <option value="normal">보통</option>
              <option value="hard">어려움</option>
            </select>
          </div>
        </section>
        
        <section className="settings-section">
          <h3>표시 설정</h3>
          
          <div className="setting-item">
            <label htmlFor="theme">테마</label>
            <select
              id="theme"
              name="theme"
              value={settings.theme}
              onChange={handleChange}
            >
              <option value="light">라이트 모드</option>
              <option value="dark">다크 모드</option>
            </select>
          </div>
        </section>
        
        <section className="settings-section">
          <h3>광고 설정</h3>
          
          <div className="setting-item">
            <label htmlFor="adPreference">광고 유형 선호도</label>
            <select
              id="adPreference"
              name="adPreference"
              value={settings.adPreference}
              onChange={handleChange}
            >
              <option value="video">비디오 광고</option>
              <option value="image">이미지 광고</option>
              <option value="interactive">인터랙티브 광고</option>
            </select>
            <p className="setting-description">
              선호하는 광고 유형을 선택하세요. 실제 노출되는 광고는 상황에 따라 달라질 수 있습니다.
            </p>
          </div>
        </section>
        
        <button onClick={resetDefaults} className="reset-button">
          기본 설정으로 초기화
        </button>
      </div>
    </div>
  );
}

export default Settings; 