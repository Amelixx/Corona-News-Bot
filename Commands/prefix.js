const Discord = require(`discord.js`)
const fs = require(`fs`);

const guildinfo = require(`../JSON/guildinfo.json`)

module.exports.run = async (bot, message, args, content, prefix) => {
    if (!content) return message.channel.send(`Usage: \`${prefix}prefix <New server prefix>\`\nDon't include the <> brackets.`)

    guildinfo[message.guild.id].prefix = args[1]
    fs.writeFileSync(`./JSON/guildinfo.json`, JSON.stringify(guildinfo, null, 4))

    return message.channel.send(`Prefix for ${message.guild.name} has been to set to \`${args[1]}\`.`)
}

module.exports.info = {
    name: `prefix`,
    aliases: [`setprefix`, `newprefix`],
    type: `config`,
    summary: `Set the prefix for the server`,
    usage: `(New Prefix)`,

    requiresGuildinfo: true,
    permissions: [`MANAGE_GUILD`]
}