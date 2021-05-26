const Discord = require(`discord.js`)
const fs = require(`fs`);

const globalStats = require(`../JSON/Stats/globalStats.json`),
config = require(`../config.json`)

module.exports.run = async (bot, message, args, content, prefix) => {
    message.delete()
    let user = bot.users.cache.get(args[1])
    if (!user) return message.channel.send(`Couldn't find a user to send to. Copy the ID in like this: ${prefix}send (ID) (message)`)

    user.send(`__**Sent by ${message.author.tag}**__\n${content.slice(args[1].length + 1)}`).catch(e => {})

    let embed = new Discord.MessageEmbed()
    .setColor(`BLACK`)
    .setAuthor(`${message.author.tag} sent to ${user.tag}`, message.author.displayAvatarURL)
    .setDescription(content.slice(args[1].length + 1))
    .setTimestamp(Date.now())

    bot.channels.cache.get(config.dmLogChannel).send({embed})
}

module.exports.info = {
    name: `send`,
    support: true,
    noHelp: true
}