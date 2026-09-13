import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, BookOpen, Check, ChevronRight, CircleHelp, Clipboard, Command, Crown, Gift, Hash, Menu, MessageCircle, Search, Settings2, ShieldCheck, Sparkles, TerminalSquare, X, Zap } from 'lucide-react';
import './styles.css';

const commandGroups = [
  { name: 'Moderation', icon: ShieldCheck, tone: 'cyan', description: 'Keep your community safe and easy to manage.', commands: [
    { name: 'kick', syntax: ',kick @member [reason]', description: 'Remove a member from the server.' },
    { name: 'ban', syntax: ',ban @member [reason]', description: 'Permanently ban a member.' },
    { name: 'timeout', syntax: ',timeout @member 10m', description: 'Temporarily restrict a member.' },
    { name: 'purge', syntax: ',purge 25', description: 'Instantly delete a chosen number of messages.' },
  ] },
  { name: 'Community', icon: Sparkles, tone: 'peach', description: 'Give members more reasons to take part.', commands: [
    { name: 'level', syntax: ',level [@member]', description: 'Check a member’s XP and server level.' },
    { name: 'leaderboard', syntax: ',leaderboard', description: 'Show the most active members.' },
    { name: '8ball', syntax: ',8ball [question]', description: 'Ask the cosmos a question.' },
    { name: 'coinflip', syntax: ',coinflip', description: 'Leave your next move to chance.' },
  ] },
  { name: 'Utilities', icon: TerminalSquare, tone: 'violet', description: 'Small tools that make server life smoother.', commands: [
    { name: 'snipe', syntax: ',snipe', description: 'Reveal the most recently deleted message.' },
    { name: 'help', syntax: ',help', description: 'Open the full command menu in Discord.' },
    { name: 'prefix', syntax: ',prefix ?', description: 'Change Stellar’s prefix for this server.' },
    { name: 'profile', syntax: '/stellar profile', description: 'Set Stellar’s name, bio, and avatar per server.' },
  ] },
  { name: 'Engagement', icon: Gift, tone: 'green', description: 'Turn good moments into community events.', commands: [
    { name: 'giveaway start', syntax: ',giveaway start', description: 'Start a giveaway with time, winners, and requirements.' },
    { name: 'giveaway end', syntax: ',giveaway end [message-id]', description: 'End an active giveaway early.' },
    { name: 'giveaway reroll', syntax: ',giveaway reroll [message-id]', description: 'Choose a new winner from an ended giveaway.' },
  ] },
];

function App() {
  const [active, setActive] = useState('Commands');
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const filteredGroups = commandGroups.map((group) => ({ ...group, commands: group.commands.filter((command) => `${command.name} ${command.syntax} ${command.description}`.toLowerCase().includes(query.toLowerCase())) })).filter((group) => group.commands.length);
  const navigate = (page) => { setActive(page); setMobileOpen(false); };

  return <div className="docs-shell">
    <aside className={mobileOpen ? 'docs-sidebar open' : 'docs-sidebar'}>
      <div className="docs-brand"><div className="brand-orbit"><span /></div><span>stellar</span><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
      <div className="docs-label">Documentation</div>
      <nav className="docs-nav">
        <button className={active === 'Overview' ? 'docs-nav-item active' : 'docs-nav-item'} onClick={() => navigate('Overview')}><BookOpen size={16} /> Overview</button>
        <button className={active === 'Commands' ? 'docs-nav-item active' : 'docs-nav-item'} onClick={() => navigate('Commands')}><Command size={16} /> Commands <span>15</span></button>
        <button className={active === 'Setup' ? 'docs-nav-item active' : 'docs-nav-item'} onClick={() => navigate('Setup')}><Settings2 size={16} /> Setup guide</button>
        <button className={active === 'Permissions' ? 'docs-nav-item active' : 'docs-nav-item'} onClick={() => navigate('Permissions')}><ShieldCheck size={16} /> Permissions</button>
      </nav>
      <div className="docs-label docs-label-spaced">Resources</div>
      <nav className="docs-nav"><a className="docs-nav-item" href="#faq"><CircleHelp size={16} /> FAQ</a><a className="docs-nav-item" href="https://discord.com" target="_blank" rel="noreferrer"><MessageCircle size={16} /> Community <ArrowUpRight size={13} /></a></nav>
      <div className="docs-sidebar-bottom"><div className="online-line"><span /> Stellar is online</div><div className="docs-version">v1.0.0 · Last updated today</div></div>
    </aside>
    <main className="docs-main">
      <header className="docs-topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><div className="docs-breadcrumb"><span>Stellar docs</span><ChevronRight size={14} /><strong>{active}</strong></div><a className="top-discord" href="https://discord.com" target="_blank" rel="noreferrer"><MessageCircle size={15} /> Join Discord <ArrowUpRight size={13} /></a></header>
      {active === 'Overview' ? <Overview onCommands={() => navigate('Commands')} /> : active === 'Setup' ? <Setup /> : active === 'Permissions' ? <Permissions /> : <Commands groups={filteredGroups} query={query} setQuery={setQuery} />}
    </main>
  </div>;
}

function Overview({ onCommands }) { return <div className="docs-content overview-content"><div className="docs-eyebrow"><span /> THE COMMUNITY BOT FOR EVERY CONSTELLATION</div><h1>Make your server<br /><em>feel stellar.</em></h1><p className="lead">Moderation, games, levels, giveaways, and the little utilities that keep your community moving.</p><div className="overview-actions"><button className="solid-button" onClick={onCommands}><Command size={16} /> Browse commands</button><button className="outline-button" onClick={() => document.getElementById('setup')?.scrollIntoView({ behavior: 'smooth' })}>Quick start <ArrowUpRight size={14} /></button></div><div className="overview-grid"><div className="overview-card card-wide"><div className="card-icon cyan-bg"><Zap size={18} /></div><span className="card-kicker">ONE PREFIX, LOTS OF POWER</span><h2>Everything starts with <code>,</code></h2><p>Stellar’s default prefix is a comma. Change it anytime with <code>,prefix ?</code> when your server needs its own rhythm.</p></div><div className="overview-card"><div className="card-icon peach-bg"><Gift size={18} /></div><span className="card-kicker">COMMUNITY EVENTS</span><h2>Giveaways without the busywork.</h2><p>Set a topic, duration, winners, requirements, and bonus roles. Stellar handles the rest.</p></div><div className="overview-card"><div className="card-icon violet-bg"><ShieldCheck size={18} /></div><span className="card-kicker">CALM MODERATION</span><h2>Clear tools for your team.</h2><p>Kick, ban, timeout, and purge from one consistent command set.</p></div></div><section className="overview-next" id="setup"><span className="card-kicker">START HERE</span><h2>Invite Stellar, then try <code>,help</code></h2><p>Once the bot is in your server, the help command gives your moderators and members a map of the whole constellation.</p></section></div>; }
function Commands({ groups, query, setQuery }) { return <div className="docs-content commands-content"><div className="page-heading"><div><div className="docs-eyebrow"><span /> COMMAND REFERENCE</div><h1>Every command,<br /><em>within reach.</em></h1><p className="lead">Copy a command, paste it into Discord, and keep your server in orbit.</p></div><div className="command-count"><strong>15</strong><span>commands<br />documented</span></div></div><div className="command-toolbar"><div className="docs-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by command or action" /></div><div className="prefix-display"><Hash size={14} /> Default prefix <code>,</code></div></div><div className="command-groups">{groups.map((group) => <CommandGroup key={group.name} {...group} />)}{!groups.length && <div className="no-results">No commands found. Try a different search.</div>}</div></div>; }
function CommandGroup({ name, icon: Icon, tone, description, commands }) { return <section className="command-group"><div className="group-heading"><div className={`group-icon ${tone}-bg`}><Icon size={17} /></div><div><h2>{name}</h2><p>{description}</p></div><span className="group-count">{commands.length}</span></div><div className="command-table">{commands.map((command) => <CommandItem key={command.name} {...command} />)}</div></section>; }
function CommandItem({ name, syntax, description }) { const [copied, setCopied] = useState(false); const copy = () => { navigator.clipboard?.writeText(syntax); setCopied(true); window.setTimeout(() => setCopied(false), 1300); }; return <div className="command-item"><div className="command-name"><code>{name}</code><span>{description}</span></div><code className="command-syntax">{syntax}</code><button className="copy-command" onClick={copy}>{copied ? <><Check size={14} /> Copied</> : <><Clipboard size={14} /> Copy</>}</button></div>; }
function Setup() { return <div className="docs-content simple-page"><div className="docs-eyebrow"><span /> GETTING STARTED</div><h1>Ready for<br /><em>liftoff.</em></h1><p className="lead">A three-minute setup for a server that feels a little more considered.</p><div className="steps"><Step number="01" title="Invite Stellar" text="Add Stellar to your Discord server with the bot and applications.commands scopes. Grant only the permissions your team needs." /><Step number="02" title="Try the essentials" text="Run ,help to see the command menu, then try ,level and ,snipe in a test channel." code=",help   ,level   ,snipe" /><Step number="03" title="Set your rhythm" text="Change the prefix with ,prefix ? or use /stellar profile to customize Stellar’s name, bio, and avatar for this server." /></div><div className="setup-note"><Crown size={16} /><div><strong>Tip for admins</strong><p>Give Stellar a dedicated bot role and keep moderation commands limited to trusted roles.</p></div></div></div>; }
function Step({ number, title, text, code }) { return <div className="step"><span className="step-number">{number}</span><div><h2>{title}</h2><p>{text}</p>{code && <code className="step-code">{code}</code>}</div></div>; }
function Permissions() { return <div className="docs-content simple-page"><div className="docs-eyebrow"><span /> SERVER PERMISSIONS</div><h1>Give Stellar<br /><em>the right access.</em></h1><p className="lead">Stellar works best with focused permissions. Start small, then expand as your community grows.</p><div className="permission-list"><Permission title="View Channels" detail="Lets Stellar see where commands are being used." /><Permission title="Send Messages" detail="Required for command replies, level-ups, and giveaway announcements." /><Permission title="Read Message History" detail="Allows purge, snipe, and context-aware responses to work properly." /><Permission title="Manage Messages" detail="Required for ,purge and giveaway cleanup." /><Permission title="Kick, Ban, and Moderate Members" detail="Required only if your team plans to use the moderation commands." /></div></div>; }
function Permission({ title, detail }) { return <div className="permission"><div className="permission-check"><Check size={15} /></div><div><strong>{title}</strong><span>{detail}</span></div></div>; }

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
