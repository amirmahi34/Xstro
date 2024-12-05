import { bot } from '../lib/plugins.js';
import { serialize } from '../lib/serialize.js';
import { loadMessage } from './sql/store.js';
import { numtoId } from '../lib/utils.js';

bot(
	{
		pattern: 'vv',
		isPublic: false,
		desc: 'Download ViewOnce Messages',
		type: 'whatsapp',
	},
	async message => {
		if (!message.reply_message.viewonce) return message.sendReply('_Reply A ViewOnce_');
		const media = await message.downloadAndSaveMedia();
		return await message.send(media);
	},
);

bot(
	{
		pattern: 'myname',
		isPublic: false,
		desc: 'Changes your WhatsApp Name',
		type: 'whatsapp',
	},
	async (message, match) => {
		if (!match) return message.sendReply('_Provide A New Name_');
		await message.updateName(match.toString());
		return message.sendReply('_WhatsApp Name Updated!_');
	},
);

bot(
	{
		pattern: 'setpp',
		isPublic: false,
		desc: 'Set Your Profile Picture',
		type: 'whatsapp',
	},
	async message => {
		if (!message.reply_message?.image) return message.sendReply('_Reply An Image_');
		const img = await message.downloadAndSaveMedia();
		await message.updatePP(img);
		return await message.sendReply('_Profile Picture Updated_');
	},
);

bot(
	{
		pattern: 'quoted',
		isPublic: false,
		desc: 'quoted message',
		type: 'whatsapp',
	},
	async message => {
		if (!message.reply_message) return await message.sendReply('```Reply A Message```');
		let key = message.reply_message.key.id;
		let msg = await loadMessage(key);
		if (!msg) return await message.sendReply('```Xstro will not quoted Bot Message```');
		msg = await serialize(JSON.parse(JSON.stringify(msg.message)), message.client);
		if (!msg.quoted) return await message.sendReply('_No quoted message found_');
		await message.forward(message.jid, msg.quoted, { quoted: msg.quoted });
	},
);

bot(
	{
		pattern: 'dlt',
		isPublic: false,
		desc: 'Deletes Message',
		type: 'whatsapp',
	},
	async message => {
		if (!message.reply_message) return message.sendReply('_Reply A Message_');
		return await message.delete();
	},
);

bot(
	{
		pattern: 'archive',
		isPublic: false,
		desc: 'archive whatsapp chat',
		type: 'whatsapp',
	},
	async message => {
		await message.archiveChat(true);
		await message.sendReply('_Archived_');
	},
);

bot(
	{
		pattern: 'unarchive',
		isPublic: false,
		desc: 'unarchive whatsapp chat',
		type: 'whatsapp',
	},
	async message => {
		await message.archiveChat(false);
		await message.sendReply('_Unarchived_');
	},
);

bot(
	{
		pattern: 'blocklist',
		isPublic: false,
		desc: 'Fetches BlockList',
		type: 'whatsapp',
	},
	async message => {
		const blocklist = await message.client.fetchBlocklist();
		if (blocklist.length > 0) {
			const mentions = blocklist.map(number => `${number}`);
			const formattedList = blocklist.map(number => `• @${number.split('@')[0]}`).join('\n');
			await message.sendReply(`*_Blocked contacts:_*\n\n${formattedList}`, { mentions });
		} else {
			await message.sendReply('_No blocked Numbers!_');
		}
	},
);

bot(
	{
		pattern: 'clear ?(.*)',
		isPublic: false,
		desc: 'delete whatsapp chat',
		type: 'whatsapp',
	},
	async message => {
		await message.clearChat();
		await message.sendReply('_Cleared_');
	},
);

bot(
	{
		pattern: 'rpp',
		isPublic: false,
		desc: 'Removes Profile Picture',
		type: 'whatsapp',
	},
	async message => {
		await message.rPP();
		return message.sendReply('_Profile Picture Removed!_');
	},
);

bot(
	{
		pattern: 'pin',
		isPublic: false,
		desc: 'pin a chat',
		type: 'whatsapp',
	},
	async message => {
		await message.client.chatModify({ pin: true }, message.jid);
		return message.sendReply('_Pined.._');
	},
);

bot(
	{
		pattern: 'unpin ?(.*)',
		isPublic: false,
		desc: 'unpin a msg',
		type: 'whatsapp',
	},
	async message => {
		await message.client.chatModify({ pin: false }, message.jid);
		return message.sendReply('_Unpined.._');
	},
);

bot(
	{
		pattern: 'save',
		isPublic: false,
		desc: 'Saves Status',
		type: 'whatsapp',
	},
	async message => {
		if (!message.reply_message) return message.sendReply('_Reply A Status_');
		const msg = await message.data?.quoted;
		await message.forward(message.user, msg, { force: false, quoted: msg });
	},
);

bot(
	{
		pattern: 'forward',
		isPublic: false,
		desc: 'Forwards A Replied Message',
		type: 'whatsapp',
	},
	async (message, match) => {
		if (!message.reply_message) return message.sendReply('_Reply A Message!_');
		let jid;
		if (message.mention && message.mention[0]) {
			jid = message.mention[0];
		} else if (match) {
			jid = numtoId(match);
		}
		if (!jid) return message.sendReply('_You have to provide a number/tag someone_');
		const msg = message.data?.quoted;
		await message.forward(jid, msg, { quoted: msg });
		return await message.sendReply(`_Message forward to @${jid.split('@')[0]}_`, {
			mentions: [jid],
		});
	},
);

bot(
	{
		pattern: 'block',
		isPublic: false,
		desc: 'Blocks A Person',
		type: 'whatsapp',
	},
	async (message, match) => {
		const jid = await message.thatJid(match);
		await message.Block(jid);
	},
);

bot(
	{
		pattern: 'unblock',
		isPublic: false,
		desc: 'Unblocks A Person',
		type: 'whatsapp',
	},
	async (message, match) => {
		const jid = await message.thatJid(match);
		await message.Unblock(jid);
	},
);

bot(
	{
		pattern: 'edit',
		isPublic: false,
		desc: 'Edits A Sent Message',
		type: 'whatsapp',
	},
	async (message, match, { prefix }) => {
		if (!message.reply_message) return message.sendReply('_Reply Your Own Message_');
		if (!match) return await message.sendReply('```' + prefix + 'edit hello```');
		await message.edit(match);
	},
);

bot(
	{
		pattern: 'jid',
		isPublic: true,
		desc: 'Get Jid of Current Chat',
		type: 'whatsapp',
	},
	async message => {
		const jid = await message.thatJid();
		message.sendReply(jid);
	},
);

bot(
	{
		pattern: 'bio',
		isPublic: true,
		desc: 'Change your whatsapp bio',
		type: 'whatsapp',
	},
	async (message, match, { prefix }) => {
		if (!match) return message.sendReply(`_Usage:_\n_${prefix}bio Hello World_`);
		await message.client.updateProfileStatus(match);
		return await message.sendReply('```WhatsApp bio Updated to "' + match + '"```');
	},
);

bot(
	{
		pattern: 'react',
		isPublic: false,
		desc: 'React to A Message',
		type: 'whatsapp',
	},
	async (message, match) => {
		if (!message.reply_message) return message.sendReply('```Reply A Message```');
		if (message.reply_message?.fromMe) return message.sendReply('```Cannot React to yourself Bro```');
		if (!match) return message.sendReply('```react 😊```');
		return await message.react(match, { key: message.reply_message?.key });
	},
);
