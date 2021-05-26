const Discord = require(`discord.js`)
const fs = require(`fs`);

const modules = require(`../modules.js`)
const corona = require(`../JSON/corona.json`),
userinfo = require(`../JSON/userinfo.json`)

module.exports.run = async (bot, message, args, content, prefix) => {
    if (userinfo[message.author.id].voteReminder) {
        delete userinfo[message.author.id].voteReminder

        message.channel.send(`I'll no longer send you notifications when you can vote.`)
    }
    else {
        userinfo[message.author.id].voteReminder = true

        message.channel.send(`I'll send you notifications when you can vote from now on.`)
    }
    fs.writeFileSync(`./JSON/userinfo.json`, JSON.stringify(userinfo, null, 4))
}

module.exports.info = {
    name: `votereminder`,
    aliases: [`remindme`],
    summary: `Toggle the option to have the bot remind you when you can vote again.`,

    requiresUserinfo: true
}