import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  ArrowUpRight,
  Bell,
  Bot,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  Copy,
  Crown,
  Gift,
  Hash,
  Layers3,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquareText,
  MoreHorizontal,
  Palette,
  Plus,
  Radio,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Trophy,
  UsersRound,
  X,
  Zap,
} from 'lucide-react';
import './styles.css';

const commands = [
  { name: 'kick', description: 'Remove a member from the server', category: 'Moderation', icon: ShieldCheck, tone: 'blue', usage: ',kick @member [reason]' },
  { name: 'ban', description: 'Permanently ban a member', category: 'Moderation', icon: ShieldCheck, tone: 'rose', usage: ',ban @member [reason]' },
  { name: 'timeout', description: 'Temporarily restrict a member', category: 'Moderation', icon: Clock3, tone: 'amber', usage: ',timeout @member 10m' },
  { name: 'purge', description: 'Instantly delete recent messages', category: 'Moderation', icon: Layers3, tone: 'blue', usage: ',purge [amount]' },
  { name: 'snipe', description: 'Reveal the last deleted message', category: 'Utility', icon: Radio, tone: 'violet', usage: ',snipe' },
  { name: 'profile', description: 'Set Stellar name, bio and avatar', category: 'Appearance', icon: Palette, tone: 'blue', usage: '/stellar profile' },
  { name: 'level', description: 'Check your server progress', category: 'Community', icon: Trophy, tone: 'amber', usage: ',level [@member]' },
  { name: 'coinflip', description: 'Leave your next move to chance', category: 'Games', icon: Sparkles, tone: 'violet', usage: ',coinflip' },
  { name: '8ball', description: 'Ask the cosmos a question', category: 'Fun', icon: Sparkles, tone: 'violet', usage: ',8ball [question]' },
  { name: 'giveaway', description: 'Launch a tailored giveaway', category: 'Engagement', icon: Gift, tone: 'rose', usage: ',giveaway start' },
];

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Commands', icon: Command },
  { label: 'Giveaways', icon: Gift },
  { label: 'Appearance', icon: Palette },
  { label: 'Activity log', icon: Activity },
];

function App() {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('Overview');
  const [prefix, setPrefix] = useState(',');
  const [saved, setSaved] = useState(false);
  const [showGiveaway, setShowGiveaway] = useState(false);
  const [query, setQuery] = useState('');
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    fetch('/api/session').then((response) => response.json()).then((data) => setSession(data.authenticated ? data : null)).catch(() => setSession(null)).finally(() => setSessionLoading(false));
  }, []);

  if (sessionLoading) return <div className="auth-screen"><div className="brand-mark"><div className="brand-orbit"><span /></div><span>stellar</span></div><div className="auth-loading">Mapping your constellation...</div></div>;
  if (!session) return <Landing />;

  const displayName = session.user.global_name || session.user.username;
  const servers = session.guilds || [];
  const selectedServer = servers[0];
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); setSession(null); };

  const filteredCommands = commands.filter((command) =>
    `${command.name} ${command.description} ${command.category}`.toLowerCase().includes(query.toLowerCase()),
  );

  const savePrefix = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark"><div className="brand-orbit"><span /></div><span>stellar</span></div>
        <div className="workspace-switcher">
          <div className="server-avatar">{selectedServer?.name?.charAt(0) || 'S'}</div>
          <div className="workspace-copy"><strong>{selectedServer?.name || 'Select a server'}</strong><span>Discord server</span></div>
          <ChevronDown size={15} />
        </div>
        <div className="sidebar-label">Workspace</div>
        <nav className="primary-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button className={activeNav === label ? 'nav-item active' : 'nav-item'} onClick={() => setActiveNav(label)} key={label}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{label === 'Commands' && <span className="nav-count">24</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-label server-label">Your servers <Plus size={14} /></div>
        <div className="server-list">
          {servers.map((server, index) => <button className={index === 0 ? 'server-row selected' : 'server-row'} key={server.id}><span className={`server-dot ${['cyan', 'peach', 'green'][index % 3]}`}>{server.name.charAt(0)}</span><span>{server.name}</span>{index === 0 && <span className="live-dot" />}</button>)}
          <button className="add-server"><Plus size={15} /> Add a server</button>
        </div>
        <div className="sidebar-bottom">
          <button className="help-link"><CircleHelp size={16} /> Help center</button>
          <div className="user-card"><div className="user-avatar">{displayName.slice(0, 2).toUpperCase()}</div><div><strong>{displayName}</strong><span>Discord account</span></div><button className="logout-button" onClick={logout} title="Sign out"><LogOut size={15} /></button></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="crumb"><span>{selectedServer?.name || 'Discord servers'}</span><span className="slash">/</span><strong>{activeNav}</strong></div><div className="top-actions"><button className="icon-button"><Bell size={18} /><span className="notification-dot" /></button><button className="view-server"><Hash size={15} /> View server <ArrowUpRight size={14} /></button></div></header>
        <div className="content-wrap">
          <section className="hero-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> System online</div><h1>Good evening, {displayName}<span className="period">.</span></h1><p>Here’s what’s happening across <strong>{selectedServer?.name || 'your servers'}</strong> tonight.</p></div><button className="primary-button" onClick={() => setShowGiveaway(true)}><Gift size={16} /> Create giveaway</button></section>
          <section className="stat-grid">
            <StatCard icon={UsersRound} label="Members" value="12,840" delta="+8.2%" note="this month" tone="cyan" />
            <StatCard icon={MessageSquareText} label="Messages handled" value="48.2k" delta="+12.5%" note="this week" tone="peach" />
            <StatCard icon={Zap} label="Commands used" value="3,891" delta="+4.8%" note="this week" tone="violet" />
            <StatCard icon={Trophy} label="XP awarded" value="128k" delta="+18.3%" note="this month" tone="green" />
          </section>

          <section className="section-heading"><div><h2>Command center</h2><p>Manage what Stellar can do in your community.</p></div><button className="text-button" onClick={() => setActiveNav('Commands')}>View all commands <ArrowUpRight size={15} /></button></section>
          <section className="command-layout">
            <div className="command-panel panel">
              <div className="panel-top"><div className="panel-title"><Command size={17} /><strong>Popular commands</strong></div><div className="search-box"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search commands" /></div></div>
              <div className="command-list">{filteredCommands.slice(0, 5).map(({ name, description, category, icon: Icon, tone, usage }) => <CommandRow key={name} name={name} description={description} category={category} Icon={Icon} tone={tone} usage={usage} />)}{filteredCommands.length === 0 && <div className="empty-state">No commands found in this constellation.</div>}</div>
              <button className="panel-footer" onClick={() => setActiveNav('Commands')}>Browse command library <ArrowUpRight size={14} /></button>
            </div>
            <div className="settings-panel panel">
              <div className="panel-top"><div className="panel-title"><Settings2 size={17} /><strong>Quick settings</strong></div><button className="kebab"><MoreHorizontal size={17} /></button></div>
              <div className="setting-block"><div className="setting-heading"><div><span>Bot status</span><small>Stellar is active in this server</small></div><button aria-label="Toggle bot status" className={enabled ? 'toggle on' : 'toggle'} onClick={() => setEnabled(!enabled)}><span /></button></div><div className="status-line"><span className={enabled ? 'status-pip' : 'status-pip muted'} />{enabled ? 'Online and listening' : 'Paused for this server'}</div></div>
              <div className="setting-block"><div className="setting-heading"><div><span>Command prefix</span><small>Use this before every command</small></div><code className="prefix-chip">{prefix}</code></div><div className="prefix-editor"><input maxLength="2" value={prefix} onChange={(event) => setPrefix(event.target.value)} aria-label="Command prefix" /><button onClick={savePrefix}>{saved ? 'Saved' : 'Save'}</button></div><div className="helper-text"><TerminalSquare size={13} /> Try <code>{prefix || ','}help</code> in your server</div></div>
              <div className="setting-block compact-setting"><div className="setting-heading"><div><span>Server profile</span><small>Customize Stellar for this server</small></div><button className="edit-button" onClick={() => setActiveNav('Appearance')}>Edit <ArrowUpRight size={13} /></button></div><div className="profile-preview"><div className="bot-avatar"><Bot size={17} /></div><div><strong>Stellar</strong><span>your community companion</span></div><button className="copy-button" title="Copy profile name"><Copy size={14} /></button></div></div>
            </div>
          </section>

          <section className="section-heading activity-heading"><div><h2>Recent activity</h2><p>A quiet pulse check on your community.</p></div><button className="filter-button">Last 7 days <ChevronDown size={14} /></button></section>
          <section className="activity-panel panel"><div className="activity-chart"><div className="chart-meta"><div><strong>Community activity</strong><span>Messages and commands</span></div><div className="chart-legend"><span><i className="legend-cyan" /> Messages</span><span><i className="legend-peach" /> Commands</span></div></div><div className="chart-area"><div className="y-axis"><span>1.2k</span><span>900</span><span>600</span><span>300</span><span>0</span></div><div className="chart-lines"><span /><span /><span /><span /><div className="bars">{[42, 54, 48, 70, 61, 82, 67].map((height, index) => <div className="bar-group" key={index}><div className="bar messages" style={{ height: `${height}%` }} /><div className="bar commands" style={{ height: `${Math.max(height - 28, 18)}%` }} /></div>)}</div><div className="x-axis"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div></div></div><div className="activity-side"><div className="side-kicker"><Activity size={14} /> LIVE SIGNALS</div><div className="signal-number">86<span>%</span></div><strong>Healthy engagement</strong><p>Members are finding their rhythm. Keep the energy going.</p><div className="signal-line"><span style={{ width: '86%' }} /></div><div className="signal-foot"><span>0</span><span>100</span></div></div></section>
        </div>
      </main>
      {showGiveaway && <GiveawayModal onClose={() => setShowGiveaway(false)} />}
    </div>
  );
}

function Landing() {
  return <div className="auth-screen landing-screen"><div className="landing-nav"><div className="brand-mark"><div className="brand-orbit"><span /></div><span>stellar</span></div><span className="landing-status"><span className="eyebrow-dot" /> Discord control center</span></div><main className="landing-content"><div className="eyebrow"><span className="eyebrow-dot" /> Your community, in orbit</div><h1>One calm place<br />for your <em>whole</em> server.</h1><p>Connect Discord to manage moderation, engagement, giveaways, and more across every server where Stellar is installed.</p><a className="primary-button connect-button" href="/api/auth/discord"><LogIn size={16} /> Continue with Discord</a><small className="privacy-note">Stellar only requests your identity and server list. Your password is never shared.</small></main><div className="landing-orbit-card"><div><span className="card-kicker">CONNECTED COMMUNITIES</span><strong>See every server<br />in your constellation.</strong></div><div className="mini-server-stack"><span className="server-dot cyan">A</span><span className="server-dot peach">N</span><span className="server-dot green">S</span><span className="server-dot violet">+</span></div></div></div>;
}

function StatCard({ icon: Icon, label, value, delta, note, tone }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={18} /></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small><b>{delta}</b> {note}</small></div><div className="mini-sparkline"><i /><i /><i /><i /><i /></div></div>; }
function CommandRow({ name, description, category, Icon, tone, usage }) { const [copied, setCopied] = useState(false); return <div className="command-row"><div className={`command-icon ${tone}`}><Icon size={16} /></div><div className="command-info"><strong>{name}</strong><span>{description}</span></div><span className="category-tag">{category}</span><button className="command-more" title={`Copy ${usage}`} onClick={() => { navigator.clipboard?.writeText(usage); setCopied(true); window.setTimeout(() => setCopied(false), 1200); }}>{copied ? <span className="copied-label">Copied</span> : <MoreHorizontal size={16} />}</button></div>; }
function GiveawayModal({ onClose }) { return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal"><div className="modal-header"><div><div className="eyebrow"><Gift size={13} /> New giveaway</div><h2>Make it memorable.</h2><p>Set the rules and let Stellar handle the rest.</p></div><button className="close-button" onClick={onClose}><X size={18} /></button></div><div className="modal-form"><label>Giveaway topic<input placeholder="e.g. Nitro Classic, merch drop..." /></label><div className="form-row"><label>Duration<div className="input-with-suffix"><input defaultValue="3" /><span>days</span></div></label><label>Winners<div className="input-with-suffix"><input defaultValue="1" /><span>people</span></div></label></div><label>Requirements<input placeholder="e.g. Be a member of Astro Lounge" /></label><label>Bonus entries <div className="role-select"><Crown size={15} /><span>Add a role for 2x entries</span><ChevronDown size={15} /></div></label></div><div className="modal-actions"><button className="cancel-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={onClose}><Gift size={15} /> Schedule giveaway</button></div></div></div>; }

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
