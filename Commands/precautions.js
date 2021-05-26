const Discord = require(`discord.js`)
const fs = require(`fs`);

const guildinfo = require(`../JSON/guildinfo.json`),
modules = require(`../modules.js`)

module.exports.run = async (bot, message, args, content, prefix) => {
    let desc = fs.readFileSync(`./JSON/precautions.txt`, 'utf-8')

    let embed = new Discord.MessageEmbed()
    .setColor(`0DEABF`)
    .setAuthor(`Covid-19 General Information`, bot.user.displayAvatarURL())
    .setDescription(desc)
    .setFooter(modules.generateTip(prefix))

    message.channel.send({embed})
}

module.exports.info = {
    name: `precautions`,
    aliases: [`cautions`, `information`, `info`],
    summary: `View precautions on how to remain safe from Coronavirus`
}