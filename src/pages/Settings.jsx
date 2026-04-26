import { useState } from 'react';
import { useApp } from '../context/AppContext';
import styles from './Settings.module.css';

const AVATAR_OPTIONS = [
  'A','B','C','D','E','F','G','H',
  'J','K','L','M','N','P','R','S',
  'T','U','V','W','X','Y','Z',
  '★','◆','▲','●','◈','⬡','∞','⚡',
];

const BG_PRESETS = [
  '#1a7fd4', '#16a34a', '#d97706', '#dc2626',
  '#7c3aed', '#0891b2', '#1e3a5f', '#374151',
  '#065f46', '#92400e', '#1e40af', '#be185d',
];

export default function Settings() {
  const { user, setUser, getAvatarStyle } = useApp();
  const [saved, setSaved] = useState(false);
  const [localAvatar, setLocalAvatar] = useState(user.avatar);
  const [localBg, setLocalBg] = useState(user.avatarBg || '');
  const [localName, setLocalName] = useState(user.name);
  const [localCountry, setLocalCountry] = useState(user.country || '');

  function save() {
    setUser(u => ({
      ...u,
      avatar: localAvatar,
      avatarBg: localBg,
      name: localName || u.name,
      country: localCountry,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const previewStyle = localBg
    ? { background: localBg, color: '#fff', borderColor: localBg }
    : {};

  return (
    <div className="page-container">
      <h1 className={styles.title}>Settings</h1>

      <div className={styles.layout}>
        {/* Avatar Editor */}
        <div className="card">
          <div className="section-title">Avatar</div>

          <div className={styles.previewRow}>
            <div className={styles.bigAvatar} style={previewStyle}>
              {localAvatar}
            </div>
            <div className={styles.previewInfo}>
              <div className={styles.previewName}>{localName || user.name}</div>
              <div className={styles.previewRank} style={{ color: '#1a7fd4' }}>{user.rank}</div>
            </div>
          </div>

          <div className="divider" />

          <div className="section-title">Choose Symbol</div>
          <div className={styles.avatarGrid}>
            {AVATAR_OPTIONS.map(opt => (
              <button
                key={opt}
                className={`${styles.avatarOption} ${localAvatar === opt ? styles.avatarOptionActive : ''}`}
                onClick={() => setLocalAvatar(opt)}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="divider" />

          <div className="section-title">Background Color</div>
          <div className={styles.bgPresets}>
            {BG_PRESETS.map(c => (
              <button
                key={c}
                className={`${styles.colorSwatch} ${localBg === c ? styles.colorSwatchActive : ''}`}
                style={{ background: c }}
                onClick={() => setLocalBg(c)}
                title={c}
              />
            ))}
            <button
              className={`${styles.colorSwatch} ${!localBg ? styles.colorSwatchActive : ''}`}
              style={{ background: '#e8f0fb', border: '1px solid #c0d4f0' }}
              onClick={() => setLocalBg('')}
              title="Default"
            >
              <span style={{ fontSize: 10, color: '#1a7fd4', fontWeight: 700 }}>DEF</span>
            </button>
          </div>

          <div className={styles.customColor}>
            <span className={styles.customLabel}>Custom hex:</span>
            <input
              type="color"
              value={localBg || '#1a7fd4'}
              onChange={e => setLocalBg(e.target.value)}
              style={{ width: 48, height: 32, padding: 2, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{localBg || 'default'}</span>
          </div>
        </div>

        {/* Profile Info */}
        <div>
          <div className="card">
            <div className="section-title">Profile Info</div>
            <div className={styles.fieldList}>
              <div className={styles.field}>
                <label className={styles.label}>Display Name</label>
                <input
                  type="text"
                  value={localName}
                  onChange={e => setLocalName(e.target.value)}
                  placeholder="Your name"
                  maxLength={24}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Country Code</label>
                <input
                  type="text"
                  value={localCountry}
                  onChange={e => setLocalCountry(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="MN"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <div className="section-title">Account</div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>Coins</span>
              <span className={styles.infoVal}>⬡ {user.coins}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>Rank</span>
              <span className={styles.infoVal}>{user.rank}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>Joined</span>
              <span className={styles.infoVal}>{user.joinDate}</span>
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-accent" onClick={save}>Save Changes</button>
            {saved && <span className={styles.savedMsg}>✓ Saved!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
