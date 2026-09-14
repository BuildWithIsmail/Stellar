import 'dotenv/config';
import { Client, GatewayIntentBits, PermissionsBitField } from 'discord.js';

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('DISCORD_TOKEN is missing from .env');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const prefixes = new Map();
const snipes = new Map();
const levels = new Map();

const getPrefix = (guildId) => prefixes.get(guildId) || ',';
const getLevelKey = (guildId, userId) => `${guildId}:${userId}`;
const isModerator = (message) => message.member?.permissions.has(PermissionsBitField.Flags.ManageMessages);
const reply = (message, content) => message.reply({ content, allowedMentions: { repliedUser: false } });

client.once('ready', () => {
  console.log(`Stellar is online as ${client.user.tag}`);
  client.user.setActivity(',help | your community', { type: 0 });
});

client.on('messageDelete', (message) => {
  if (message.author?.bot || !message.guild) return;
  snipes.set(message.channelId, { content: message.content || '[no text]', author: message.author.tag });
});

client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;

  const levelKey = getLevelKey(message.guild.id, message.author.id);
  levels.set(levelKey, (levels.get(levelKey) || 0) + 1);

  const prefix = getPrefix(message.guild.id);
  if (!message.content.startsWith(prefix)) return;
  const [rawCommand, ...args] = message.content.slice(prefix.length).trim().split(/\s+/);
  const command = rawCommand?.toLowerCase();
  if (!command) return;

  if (command === 'help') {
    return reply(message, `**Stellar commands**\n\`${prefix}kick\`, \`${prefix}ban\`, \`${prefix}timeout\`, \`${prefix}purge\`, \`${prefix}snipe\`\n\`${prefix}level\`, \`${prefix}coinflip\`, \`${prefix}8ball\`, \`${prefix}prefix\`\nTry \`${prefix}giveaway start <minutes> <winners> <topic>\`.`);
  }

  if (command === 'prefix') {
    if (!isModerator(message)) return reply(message, 'You need Manage Messages to change the prefix.');
    const nextPrefix = args[0];
    if (!nextPrefix || nextPrefix.length > 2) return reply(message, `Usage: \`${prefix}prefix ?\``);
    prefixes.set(message.guild.id, nextPrefix);
    return reply(message, `Prefix updated to \`${nextPrefix}\` for this server.`);
  }

  if (command === 'level') {
    const target = message.mentions.users.first() || message.author;
    const xp = levels.get(getLevelKey(message.guild.id, target.id)) || 0;
    return reply(message, `**${target.username}** has **${xp} XP** and is level **${Math.floor(xp / 10) + 1}**.`);
  }

  if (command === 'coinflip') return reply(message, Math.random() > 0.5 ? 'The cosmos says **heads**.' : 'The cosmos says **tails**.');
  if (command === '8ball') {
    const answers = ['The stars say yes.', 'Not in this constellation.', 'Ask again later.', 'The outlook is bright.'];
    return reply(message, answers[Math.floor(Math.random() * answers.length)]);
  }

  if (command === 'snipe') {
    const deleted = snipes.get(message.channelId);
    return reply(message, deleted ? `**${deleted.author}** deleted: “${deleted.content}”` : 'There is nothing to snipe in this channel.');
  }

  if (['kick', 'ban', 'timeout'].includes(command)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return reply(message, 'You need the appropriate moderation permission to use that command.');
    const member = message.mentions.members.first();
    if (!member) return reply(message, `Usage: \`${prefix}${command} @member\``);
    if (command === 'kick') await member.kick(args.slice(1).join(' ') || 'Moderated by Stellar');
    if (command === 'ban') await member.ban({ reason: args.slice(1).join(' ') || 'Moderated by Stellar' });
    if (command === 'timeout') await member.timeout(10 * 60 * 1000, 'Moderated by Stellar');
    return reply(message, `${member.user.tag} was ${command === 'timeout' ? 'timed out for 10 minutes' : `${command}ed`}.`);
  }

  if (command === 'purge') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return reply(message, 'You need Manage Messages to use purge.');
    const amount = Number(args[0]);
    if (!Number.isInteger(amount) || amount < 1 || amount > 100) return reply(message, `Usage: \`${prefix}purge 25\` (choose 1-100).`);
    await message.channel.bulkDelete(amount, true);
    const confirmation = await reply(message, `Purged ${amount} messages.`);
    setTimeout(() => confirmation.delete().catch(() => {}), 3500);
  }

  if (command === 'giveaway' && args[0] === 'start') {
    if (!isModerator(message)) return reply(message, 'You need Manage Messages to start a giveaway.');
    const minutes = Number(args[1]);
    const winners = Number(args[2]);
    const topic = args.slice(3).join(' ') || 'a surprise prize';
    if (!Number.isFinite(minutes) || !Number.isInteger(winners) || minutes < 1 || winners < 1) return reply(message, `Usage: \`${prefix}giveaway start 60 1 Nitro Classic\``);
    return reply(message, `🎉 Giveaway ready: **${topic}** · ${winners} winner${winners === 1 ? '' : 's'} · ${minutes} minutes. Add requirements and reactions in your giveaway channel.`);
  }
});

client.login(token);