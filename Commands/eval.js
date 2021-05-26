const Discord = require(`discord.js`)
const fs = require(`fs`);
const chalk = require(`chalk`)

const guildinfo = require(`../JSON/guildInfo.json`)
const userinfo = require(`../JSON/userinfo.json`)

const modules = require(`../modules.js`)
const main = require(`../Coronanews.js`)

const serverStats = require(`../JSON/Stats/serverStats`),
globalStats = require(`../JSON/Stats/globalStats`),
userStats = require(`../JSON/Stats/userStats.json`)

module.exports.run = async (bot, message, args, coreMessage, prefix) => {
    // try {
        evaluation = await eval(coreMessage);
    // }
    // catch(err) {
    //     evaluation = `There was an error during evaluation!\n${err}`
    // }

    let embed = new Discord.MessageEmbed()
        .setColor(`BLACK`)
        .setTitle(`<a:loading:504323385824641045> Eval <a:loading:504323385824641045>`)
        .addField(`Code`,`\`\`\`js\n${coreMessage} \`\`\``)
        .addField(`Result`, `\`\`\`\n${evaluation} \`\`\``)
    message.channel.send({embed})
}

module.exports.info = {
    name: `eval`,
    developer: true
}