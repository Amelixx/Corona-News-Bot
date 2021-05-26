const Discord = require(`discord.js`)
const fs = require(`fs`);

const main = require(`../Coronanews.js`)
const modules = require(`../modules.js`),

userStats = require(`../JSON/Stats/userStats`)

module.exports.run = async (bot, message, args, content, prefix) => {
    let add = ""
    if (!userStats[message.author.id] || !userStats[message.author.id]["Command Usage"].help) add = `Welcome to Corona News! I see this is your first time running the help command - if there are any difficulties understanding how the commands work, please don't hesitate to contact the support at our official server: https://discord.gg/bAqyGbZ\nThis message will not show again.`
    msg = `${add}\`\`\`asciidoc\nCorona News - Help Menu\n=======================\n\nParameters in (normal brackets) are required.\nParameters in {curly brackets} are optional.\n\n[Square brackets] indicate aliases, alternative shorthands to typing a command.\n\nDon't include the brackets in parameters! e.g ${prefix}country Belgium  :: <- Don't include the commas either\n\n`

    main.commands.forEach(cmd => {
        if (cmd.info.noHelp || cmd.info.developer) return;
        let aliasString = "", usageString = "";

        if (cmd.info.usage) usageString = `${prefix}${cmd.info.name} ${cmd.info.usage}\n`

        if (cmd.info.aliases) {
            aliasString += `[`
            for (let x in cmd.info.aliases) {
                aliasString += `${cmd.info.aliases[x]}, `
            }
            aliasString = aliasString.slice(0, aliasString.length - 2) + `]\n`
        }

        msg += `${prefix}${cmd.info.name} ::\n${usageString}${aliasString}'${cmd.info.summary}'\n\n`
    })
    
    msg += `\`\`\``
    return message.channel.send(msg)
}

module.exports.info = {
    name: `help`,
    noHelp: true
}