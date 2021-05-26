const Discord = require(`discord.js`)
const fs = require(`fs`);

const modules = require(`../modules.js`)
const corona = require(`../JSON/corona.json`)

module.exports.run = async (bot, message, args, content, prefix) => {
    if (!content) return message.channel.send(`Enter an argument to search against, e.g ${prefix}country Belgium`)
    let country = modules.getCountry(content, message.channel)
    if (!country || country == undefined) return;

    let data = corona.countries[country],

    embed = new Discord.MessageEmbed()
    .setColor(`0DEABF`)
    .setAuthor(`Coronavirus Statistics for ${country}`, bot.users.cache.get(bot.user.id).displayAvatarURL)
    .setThumbnail(data.countryInfo.flag)
    .addField(`Cases Today`, (data.todayCases || 0).toLocaleString(), true)
    .addField(`Deaths Today`, (data.todayDeaths || 0).toLocaleString(), true)
    .addField(`Recovered`, (data.recovered || 0).toLocaleString(), true)

    .addField(`Cases (Infected)`, (data.cases || 0).toLocaleString(), true)
    .addField(`Deaths`, (data.deaths || 0).toLocaleString(), true)
    .addField(`Critical`, (data.critical || 0).toLocaleString(), true)
    .addField("\u200B", "\u200B")

    .addField(`Cases Per Million`, (data.casesPerOneMillion || 0).toLocaleString(), true)
    .addField(`Deaths Per Million`, (data.deathsPerOneMillion || 0 ).toLocaleString(), true)
    .addField(`Active`, (data.active || 0).toLocaleString(), true)

    .addField(`Tests`, (data.tests || 0).toLocaleString(),true)
    .addField(`Tests Per Million`, (data.testsPerOneMillion || 0).toLocaleString(), true)
    .addField("\u200B", "\u200B", true)

    .setFooter(modules.generateTip(prefix))

    return message.channel.send({embed})
}

module.exports.info = {
    name: `countrydata`,
    aliases: [`country`, `c`],
    summary: `Get information on a particular country.`,
    usage: `(Country Name)`,

    botPermissions: [`EMBED_LINKS`]
}