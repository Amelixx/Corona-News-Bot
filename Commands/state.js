const Discord = require(`discord.js`)
const fs = require(`fs`);

const guildinfo = require(`../JSON/guildinfo.json`),
modules = require(`../modules.js`),
corona = require(`../JSON/corona.json`)

module.exports.run = async (bot, message, args, content, prefix) => {
    if (!content) return message.channel.send(`Enter an argument to search against, e.g \`${prefix}state Alabama\``)

    let stateName, stateCounty;
    if (content.split(`"`).length == 3 || content.split("'").length == 3) {
        let x = 0, i = 0, initial = Number()
        while (x < 2 && content[i]) {
            if ((content[i] == '"' || content[i] == "'") && content[i - 1] != "\\") {
                x ++
                if (x == 1) initial = i
            }
            i ++
        }
        stateName = content.slice(initial + 1, i - 1).trim(),
        stateCounty = content.slice(i).trim()
    } 
    else stateName = content

    let state = modules.getState(stateName, message.channel), county;
    if (!state || state == undefined) return;

    let data = corona.states[state],
    desc = new String(`To see information on a specific county, type \`${prefix}state ${state} (County Name)\`\n${state} has ${Object.keys(data.counties).length} counties with coronavirus cases.`),
    countyString = ""
    data = data.all

    if (stateCounty) {
        county = modules.getCounty(state, stateCounty, message.channel)
        if (!county || county == undefined) return;
        data = corona.states[state].counties[county]
        desc = "",
        countyString = `in county ${county}`
    }

    embed = new Discord.MessageEmbed()
    .setColor(`0DEABF`)
    .setAuthor(`Coronavirus Statistics for ${state} ${countyString}`, bot.user.displayAvatarURL)

    .setDescription(desc)
    
    .addField(`Cases (Infected)`, (data.cases || 0).toLocaleString(), true)
    .addField(`Deaths`, (data.deaths || 0).toLocaleString(), true)
    .addField(`Recovered`, (data.recovered || 0).toLocaleString(), true)

    .setFooter(modules.generateTip(prefix))

    return message.channel.send({embed})
}

module.exports.info = {
    name: `state`,
    aliases: [`s`],
    summary: `View information on a US state.`,
    usage: `(State name)  OR  "State Name" (County Name)`
}