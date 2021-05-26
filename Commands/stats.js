const Discord = require(`discord.js`)
const fs = require(`fs`);

const modules = require(`../modules.js`)
const corona = require(`../JSON/corona.json`)

module.exports.run = async (bot, message, args, content, prefix) => {
    let data = corona.all

    let embed = new Discord.MessageEmbed()
    .setColor(`0DEABF`)
    .setAuthor(`Coronavirus Statistics Worldwide`, `https://cdn.discordapp.com/icons/538361750651797504/b9950a2556dfa394b1812ccfb556096b.jpg`)

    .addField(`Cases Today`, (data.todayCases || 0).toLocaleString(), true)
    .addField(`Deaths Today`, (data.todayDeaths || 0).toLocaleString(), true)
    .addField(`Recovered`, (data.recovered || 0).toLocaleString(), true)

    .addField(`Cases (Infected)`, (data.cases || 0).toLocaleString(), true)
    .addField(`Deaths`, (data.deaths || 0).toLocaleString(), true)
    .addField(`Critical`, (data.critical || 0).toLocaleString(), true)
    .addField("\u200B", "\u200B")

    .addField(`Cases Per Million`, (data.casesPerOneMillion || 0).toLocaleString(), true)
    .addField(`Deaths Per Million`, (data.deathsPerOneMillion || 0 ).toLocaleString(), true)
    .addField("\u200B", "\u200B", true)

    .addField(`Tests`, (data.tests || 0).toLocaleString(),true)
    .addField(`Tests Per Million`, (data.testsPerOneMillion || 0).toLocaleString(), true)
    .addField("\u200B", "\u200B",true)

    .setFooter(modules.generateTip(prefix))

    return message.channel.send({embed})
}

module.exports.info = {
    name: `stats`,
    aliases: [`globalstats`, `all`],
    summary: `Get information on the world situation. Every country combined.`,

    botPermissions: [`EMBED_LINKS`]
}