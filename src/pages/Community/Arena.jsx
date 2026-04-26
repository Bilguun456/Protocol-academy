import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ARENA_LOBBY } from '../../data/users';
import { TOPICS } from '../../data/problems';
import { useApp } from '../../context/AppContext';
import styles from './Arena.module.css';

const ROOM_CODE = 'PA-' + Math.random().toString(36).slice(2, 8).toUpperCase();
const ROOM_LINK = `https://protocolacademy.io/join/${ROOM_CODE}`;

const GAMEMODES = [
  { id: 'classic', label: 'Classic',        desc: 'Standard match, no rank effects', available: true },
  { id: 'ranked',  label: 'Ranked',          desc: 'Affects your ELO rating',         available: false },
  { id: 'special', label: 'Special Events',  desc: 'Limited-time formats',            available: true },
];

export default function Arena() {
  const { triggerDailyTask } = useApp();
  useEffect(() => { triggerDailyTask('visit_arena'); }, []); // eslint-disable-line

  const [gamemode, setGamemode] = useState('classic');
  const [timeLimit, setTimeLimit] = useState(30);
  const [topic, setTopic] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState([
    { user: 'tourist', text: 'gl hf everyone', time: '2m ago' },
    { user: 'jiangly', text: "let's go", time: '1m ago' },
  ]);
  const overlayRef = useRef(null);

  function sendMsg() {
    if (!chatMsg.trim()) return;
    setMessages(prev => [...prev, { user: 'You', text: chatMsg.trim(), time: 'now' }]);
    setChatMsg('');
  }

  function copyLink() {
    navigator.clipboard.writeText(ROOM_LINK).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function closeInvite(e) {
    if (e.target === overlayRef.current) setInviteOpen(false);
  }

  return (
    <div className={styles.arena}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Arena Lobby</h2>
          <p className={styles.sub}>Room {ROOM_CODE} · Classic</p>
        </div>
        <div className={styles.headerBtns}>
          <button className="btn" onClick={() => setChatOpen(o => !o)}>💬 Chat</button>
          <button className="btn btn-accent" onClick={() => setInviteOpen(true)}>+ Invite</button>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>

          {/* Players */}
          <div className="card">
            <div className="section-title">Players ({ARENA_LOBBY.length}/8)</div>
            <div className={styles.playerList}>
              {ARENA_LOBBY.map(p => (
                <div key={p.id} className={styles.playerRow}>
                  <div className="avatar">{p.avatar}</div>
                  <Link to={`/profile/${p.name}`} className={styles.playerName}>
                    {p.name}
                  </Link>
                  {p.isOwner && <span className={styles.crown} title="Room owner">👑</span>}
                  <span className={p.online ? 'online-dot' : 'offline-dot'} style={{ marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="card" style={{ marginTop: 12 }}>
            <div className="section-title">
              Room Settings <span className={styles.ownerNote}>(Owner Only)</span>
            </div>
            <div className={styles.settingsGrid}>
              <div className={styles.settingItem}>
                <label className={styles.settingLabel}>Time Limit (min)</label>
                <input type="number" min="5" max="180" value={timeLimit}
                  onChange={e => setTimeLimit(e.target.value)} style={{ width: 80 }} />
              </div>
              <div className={styles.settingItem}>
                <label className={styles.settingLabel}>Topic</label>
                <select value={topic} onChange={e => setTopic(e.target.value)} style={{ flex: 1 }}>
                  <option value="">Any Topic</option>
                  {TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Gamemodes */}
          <div className="card" style={{ marginTop: 12 }}>
            <div className="section-title">Gamemode</div>
            <div className={styles.gamemodes}>
              {GAMEMODES.map(gm => (
                <button key={gm.id}
                  className={`${styles.gmBtn} ${gamemode === gm.id ? styles.gmActive : ''} ${!gm.available ? styles.gmDisabled : ''}`}
                  onClick={() => gm.available && setGamemode(gm.id)}
                  disabled={!gm.available}
                >
                  <span className={styles.gmLabel}>{gm.label}</span>
                  {!gm.available && <span className={styles.comingSoon}>Coming Soon</span>}
                  <span className={styles.gmDesc}>{gm.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-accent"
            style={{ width: '100%', justifyContent: 'center', marginTop: 12, padding: '11px' }}>
            Start Match
          </button>
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <div className={`card ${styles.chatPanel}`}>
            <div className="section-title">Chat</div>
            <div className={styles.messages}>
              {messages.map((m, i) => (
                <div key={i} className={styles.message}>
                  <span className={styles.msgUser}>{m.user}</span>
                  <span className={styles.msgText}>{m.text}</span>
                  <span className={styles.msgTime}>{m.time}</span>
                </div>
              ))}
            </div>
            <div className={styles.chatInput}>
              <input type="text" placeholder="Message..." value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMsg()} />
              <button className="btn btn-accent" style={{ padding: '8px 12px' }} onClick={sendMsg}>→</button>
            </div>
          </div>
        )}
      </div>

      {/* Invite modal */}
      {inviteOpen && (
        <div className={styles.overlay} ref={overlayRef} onClick={closeInvite}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Invite to Room</h3>
              <button className={styles.closeBtn} onClick={() => setInviteOpen(false)}>✕</button>
            </div>

            <div className={styles.roomCodeBlock}>
              <div className={styles.roomCodeLabel}>Room Code</div>
              <div className={styles.roomCode}>{ROOM_CODE}</div>
            </div>

            <div className={styles.modalSection}>Share link</div>
            <div className={styles.linkRow}>
              <input type="text" value={ROOM_LINK} readOnly className={styles.linkInput} />
              <button className={`btn ${copied ? 'btn-accent' : ''}`} onClick={copyLink}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <p className={styles.modalNote}>
              Share this code or link with friends. They can paste it in the Join Room field.
            </p>

            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
              onClick={() => setInviteOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
