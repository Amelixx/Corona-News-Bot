const Discord = require(`discord.js`)
const fs = require(`fs`);

const guildinfo = require(`../JSON/guildinfo.json`),
modules = require(`../modules.js`)

module.exports.run = async (bot, message, args, content, prefix) => {
    if (!guildinfo[message.guild.id].voice_stats || Object.keys(guildinfo[message.guild.id].voice_stats.channels).length == 0) {
        message.channel.send(`There are no voice channels on this server to update.`)
        return false
    }

    for (let id in guildinfo[message.guild.id].voice_stats.channels) {
        await modules.updateVoiceChannel(id);
    }
    return await message.channel.send(`Voice stats successfully updated.`)
}

module.exports.info = {
    name: `renew`,
    aliases: [`resetvoicestats`, `updatevoicestats`],
    summary: `Update the voice statistics in your server more frequently at your discretion.`,

    requiresGuildinfo: true,
    permissions: [`MANAGE_CHANNELS`],
    requiresDblVote: true,
    guildCooldown: 600000 // 10 Minutes
}