const Discord = require(`discord.js`)
const fs = require(`fs`);

const modules = require(`../modules.js`)
const corona = require(`../JSON/corona.json`)

module.exports.run = async (bot, message, args, content, prefix) => {
    let data = corona.countries,
    arr = Object.keys(corona.countries).sort((a,b) => {return corona.countries[b].cases - corona.countries[a].cases}),
    start = 0,
    timeout = false,
    msg, endingStart,
    pageCount = Math.ceil(arr.length / 5)

    arr.splice(arr.indexOf("World"), 1)

    if (arr.length % 5 == 0) endingStart = arr.length - 5
    else endingStart = Math.floor(arr.length / 5) * 5

    if (content && !isNaN(content) && content >= 1 && content <= pageCount) start = (Math.round(content) * 5) - 5
    else if (content.toLowerCase() == "end") start = endingStart

    while (!timeout) {
        let end = start+5, leftArrow, rightArrow,
        countries = arr.slice(start, end),
        pageNumber = start / 5 + 1,

        img = new Discord.MessageAttachment("../Images/globe.jpg", "globe")
        embed = new Discord.MessageEmbed()
        .setColor(`0DEABF`)
        .setAuthor(`Most Infected Countries - Page ${pageNumber}/${pageCount}`, `attachment://globe`)
        .setFooter(`${modules.generateTip(prefix, 'top')}`)

        for (let i in countries) {
            let name = countries[i], d = data[name]
            embed.addField(`[${Number(arr.indexOf(name))+1}] ${name}`, `Cases (Infected) - ${d.cases.toLocaleString()}\nDeaths - ${d.deaths.toLocaleString()}\nCritical - ${d.critical.toLocaleString()}\nCases Today - ${d.todayCases.toLocaleString()}\nDeaths Today - ${d.todayDeaths.toLocaleString()}\nRecovered - ${d.recovered.toLocaleString()}`)
        }

        if (!msg) {
            msg = await message.channel.send({embed})
            farLeftArrow = await msg.react(`⏮`)
            leftArrow = await msg.react("⬅")
            rightArrow = await msg.react("➡")
            farRightArrow = await msg.react(`⏭`)
        }
        else msg = await msg.edit({embed})
    
        // Remove all user's reactions
        let reactions = msg.reactions.cache.filter(x => x.users.cache.get(message.author.id))
        if (reactions) reactions.forEach(x => {x.remove(message.author)})

        let filter = (r, u) => u == message.author && ((pageNumber != 1 && ["⏮", "⬅"].includes(r.emoji.name)) || (pageNumber != pageCount && ["⏭","➡"].includes(r.emoji.name))),
        reaction = await msg.awaitReactions(filter, {errors: ['time'], max: 1, time: 300000})
        .catch((e) => {
            if (farLeftArrow) farLeftArrow.remove()
            if (leftArrow) leftArrow.remove()
            if (rightArrow) rightArrow.remove()
            if (farRightArrow) farRightArrow.remove()
            timeout = true
        })
        if (!timeout) {
            reaction = reaction.first()
            reaction.users.remove(message.author.id)
            if (reaction.emoji.name == "⬅") start -= 5
            else if (reaction.emoji.name == "➡") start += 5
            else if (reaction.emoji.name == `⏮`) start = 0
            else if (reaction.emoji.name == `⏭`) start = endingStart
        }
    }
}

module.exports.info = {
    name: `top`,
    aliases: [`topcases`, `leaderboard`],
    summary: `View the pandemic broken down country by country, in order of the most infections.`,
    usage: `{page number or "end"}`,

    botPermissions: [`MANAGE_MESSAGES`, `EMBED_LINKS`]
}