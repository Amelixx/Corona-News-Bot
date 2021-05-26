const Discord = require(`discord.js`)
const fs = require(`fs`);

const modules = require(`../modules.js`)
const corona = require(`../JSON/corona.json`),
guildinfo = require(`../JSON/guildinfo.json`)

module.exports.run = async (bot, message, args, content, prefix, time) => {
    let info = guildinfo[message.guild.id], desc,

    menuOptions = [
        `[Recommended] Create quick/basic setup of global statistics [1 Category, 10 Voice Channels] [Global stats]`,
        `[Recommended] Create quick/basic setup of specific country statistics [1 Category, 11 Voice Channels]`,
        `Advanced Setup - 1 voice channel with a global statistic of your choosing`,
        `Advanced Setup - 1 voice channel with statistic of a particular country`
    ]

    if (info.voice_stats && Object.keys(info.voice_stats.channels).length > 0) {
        desc = `✔️ There are voice statistics currently enabled on this server.`
        menuOptions.push(`Delete all voice statistic channels in this server`)
    }
    else desc = `❌ There are currently no voice statistics enabled on this server.`

    desc += `\n\nOnce created, voice channels can be moved around into different categories or deleted. You may want to quickly setup the first option but then delete a couple of the channels or rename the category, for example. Customise it how you see fit!\n`

    answer = await modules.sendMenu(message.author, message.channel, {title: `Voice Statistics`, description: desc}, menuOptions)
    if (!answer) return;

    if (!info.voice_stats) guildinfo[message.guild.id].voice_stats = {}
    if (!info.voice_stats.channels) guildinfo[message.guild.id].voice_stats.channels = {}
    if (!info.voice_stats.categories) guildinfo[message.guild.id].voice_stats.categories = []

    if (message.deletable) message.delete()
    if (answer.deletable) answer.delete()

    let everyoneID = message.guild.roles.cache.find(x => x.name == "@everyone").id,
    permissionOverwrites = [{id: everyoneID, allow: 1024, deny: 1048576, type: 'role'}, {id: bot.user.id, allow: 2146958847, type: 'user'}]

    console.log(`${time} | [VoiceStats] ${message.author.tag} responsed with ${answer} | ${message.channel.name} | ${message.guild.name}`)

    let data, country, name;
    switch (answer.content) {
        case "1": case "2":
            if (answer.content == "1") {
                name = "Coronavirus Stats [Global]"
                data = corona.all
                country = null,
                stats = Object.keys(data),
                displayStatistics = modules.globalDisplayStatistics
            }
            else {
                answer2 = await modules.sendQuestion(message.author, message.channel, `Alrightly, enter the name of the country you wish to have statistics for. This can even be the start of its name, such as "Belgi" for "Belgium".\n\nIf I don't respond to your message, then I can't find any country matching your input. Just send a message again and I'll continue trying to find a country.\nThis message times out in 60 seconds.`, m => {c = modules.fetchCountry(m.content, true); return c != undefined}, 60000)
                if (!answer2) return;

                country = modules.fetchCountry(answer2.content, true)

                if (answer2.deletable) answer2.delete()
                data = corona.countries[country]
                name = `Coronavirus Stats [${country}]`,
                a = Object.keys(data),
                stats = a.slice(2),
                displayStatistics = modules.displayStatistics
            }

            let category = await message.guild.channels.create(name, {type: 'category'})

            guildinfo[message.guild.id].voice_stats.categories.push(category.id)
            for (let i in stats) {
                let stat = stats[i],
                value = data[stat],
                c = await message.guild.channels.create(`📊 ${value.toLocaleString()} ${displayStatistics[i]}`, {type: 'voice', permissionOverwrites: permissionOverwrites, parent: category}).catch(e => {return message.channel.send(`An error occurred. This might be because I don't have permissions to create channels in this server. If this persists, please contact my developer in the support server in ${prefix}links`)})

                guildinfo[message.guild.id].voice_stats.channels[c.id] = {country: country, stat: stat, updated: Date.now() + 3600000 /*1 Hour*/}
            }
            fs.writeFileSync(`./JSON/guildinfo.json`, JSON.stringify(guildinfo, null, 4))

            return message.channel.send(`:white_check_mark: ${name} category with ${stats.length} channels set up. These will automatically update once per day. Some additional customisation you can do includes:\n\`Renaming the category or deleting it entirely\`\n\`Moving the channels or deleting a few of them.\`\n\nTo delete all channels I've created, use the ${prefix}voicestats command again and select option 5.`)
        
        case "3": case "4":
            if (answer.content == "3") data = corona.all, country = null, name = "Global", statistics = Object.keys(data), displayStatistics = modules.globalDisplayStatistics
            else {
                answer2 = await modules.sendQuestion(message.author, message.channel, `Alrightly, enter the name of the country you wish to have statistics for. This can even be the start of its name, such as "Belgi" for "Belgium".\n\nIf I don't respond to your message, then I can't find any country matching your input. Just send a message again and I'll continue trying to find a country.\nThis message times out in 60 seconds.`, m => {c = modules.fetchCountry(m.content, true); return c != undefined}, 60000)
                if (!answer2) return;

                country = modules.fetchCountry(answer2.content, true)
                if (answer2.deletable) answer2.delete()
                data = corona.countries[country],
                name = country,
                a = Object.keys(data),
                statistics = a.slice(2),
                displayStatistics = modules.displayStatistics
            }
            let string = ""
            for (let i in statistics) {
                string += `[${Number(i)+1}] ${displayStatistics[i]}\n`
            }

            answer3 = await modules.sendQuestion(message.author, message.channel, `Cool, tell me the statistic you would like in the new channel. There are ${statistics.length} variables I can keep track of:\n**${string}**\n\nEnter a valid number next to the statistic you would like in 30 seconds.`, m => Number(m.content) != NaN && Number(m.content) >= 1 && Number(m.content) <= statistics.length)
            if (!answer3) return;

            displayStat = displayStatistics[Number(answer3.content) - 1]
            stat = statistics[displayStatistics.indexOf(displayStat)]
            if (answer3.deletable) answer3.delete()
            value = data[stat]

            c = await message.guild.channels.create(`📊 ${value.toLocaleString()} ${name} ${displayStat}`, {type: 'voice', permissionOverwrites: permissionOverwrites})
            guildinfo[message.guild.id].voice_stats.channels[c.id] = {country: country, stat: stat, updated: Date.now() + 3600000 /*1 Hour*/}
            fs.writeFileSync(`./JSON/guildinfo.json`, JSON.stringify(guildinfo, null, 4))

            return message.channel.send(`:white_check_mark: Created a voice channel for ${displayStat}. Move this around however you wish, you may delete the channel manually if you do not want to have it anymore.\nTo delete all channels I've made, access my menu with ${prefix}voicestats and use the fifth option.`)

        case "5":
            let channels = Object.keys(info.voice_stats.channels),
            categories = info.voice_stats.categories
            for (let i in channels) {
                let c = bot.channels.cache.get(channels[i])
                if (c) await c.delete()
            }
            for (let i in categories) {
                let c = bot.channels.cache.get(categories[i])
                if (c) await c.delete()
            }
            
            return message.channel.send(`:white_check_mark: All channels in my databases deleted.`)
    }
}

module.exports.info = {
    name: `voicestats`,
    aliases: [`voice`, `configurevc`, `configurevoice`, `vc`],
    summary: `Configure auto-updating voice channels to keep track of the virus directly in your discord server`,

    requiresGuildinfo: true,
    permissions: [`MANAGE_CHANNELS`],
    botPermissions: [`MANAGE_CHANNELS`]
}