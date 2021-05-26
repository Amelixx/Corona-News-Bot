const Discord = require(`discord.js`)
const fs = require(`fs`)
const snekfetch = require(`snekfetch`)

const chalk = require(`chalk`)

const main = require(`./Coronanews.js`),
bot = main.bot
const settings = require(`./config.json`)
const config = settings

const userinfo = require(`./JSON/userinfo.json`),
guildinfo = require(`./JSON/guildinfo.json`),
node_fetch = require('node-fetch')

const globalStats = require(`./JSON/Stats/globalStats.json`)
const serverStats = require(`./JSON/Stats/serverStats.json`)
const userStats = require(`./JSON/Stats/userStats.json`),

corona = require(`./JSON/corona.json`)

module.exports.vowels = new Array(`a`,`e`,`i`,`o`,`u`)

module.exports.range = async (start, stop, step) => {
    var a=[start], b=start;
    while(b<stop){b+=step;a.push(b)}
    return a;
};

module.exports.randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.maxInArray = array => {
    let max = array.reduce(function(a, b) {
        return Math.max(a, b);
    });
    return max
}

module.exports.registerUser = user => {
    if (typeof user == 'object') id = user.id
    else id = user
    if (!id) return;

    userinfo[id] = {}
    fs.writeFileSync(`./JSON/userinfo.json`, JSON.stringify(userinfo, null, 4))
}

module.exports.registerGuild = guild => {
    if (typeof guild == 'object') id = guild.id
    else id = guild
    if (!id) return;

    guildinfo[id] = {}
    fs.writeFileSync(`./JSON/guildinfo.json`, JSON.stringify(guildinfo, null, 4))
}

module.exports.delay = async seconds => {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

module.exports.capitalise = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports.createHelp = (command, prefix) => {
    if (!command) return;
    let msg = command.help
    while (msg.includes(`%PREFIX%`)) {msg = msg.replace(`%PREFIX%`, prefix)}
    return msg;
}

module.exports.gameMessages = [
    `${Object.keys(corona.countries).length} Countries Affected`,
    `${corona.all.deaths.toLocaleString()} global deaths`,
    `${corona.all.cases.toLocaleString()} global cases`,
    `${corona.all.casesToday.toLocaleString()} cases today`,
    `${corona.all.deathsToday.toLocaleString()} deaths today`,
    `${corona.all.recovered.toLocaleString()} total recoveries`,
]

module.exports.setGame = async () => {
    gameMessage = this.gameMessages[this.randomInt(0, this.gameMessages.length - 1)]

    await main.bot.user.setActivity(`@Coronanews help | ${gameMessage}`, {type: `PLAYING`}).catch((e) => {console.error(chalk.red(`Error when setting status:\n${e}`))})
    // main.bot.user.setActivity(`My developer 👀`, {type: `WATCHING`})
    return `Set status to ${main.bot.user.presence.game}`
}

module.exports.updateGuildCount = async () => {
    return await main.bot.channels.cache.get(settings.guildCountChannel).setName(`${main.bot.guilds.cache.size} Corona News Guilds`)
}

module.exports.backupJSON = () => {
    let databases = [
        {path: `userinfo.json`, data:userinfo},
        {path: `guildinfo.json`, data:guildinfo},
        {path: `Stats/globalStats.json`, data: globalStats},
        {path: `Stats/serverStats.json`, data: serverStats},
        {path: `Stats/userStats.json`, data: userStats}
    ]

    databases.forEach(x => {
        fs.writeFileSync(`../Backup/${main.bot.user.username}/JSON/${x.path}`, JSON.stringify(x.data, null, 4))
    })
    console.log(chalk.green(`Backed up JSON files.`))
    return "Backed up JSON files."
}

module.exports.updateStats = () => {
    snekfetch.post(`https://discordbots.org/api/bots/stats`)
        .set('Authorization', settings.DBLtoken)
        .send({ server_count: bot.guilds.cache.size})
        .then(() => console.log(chalk.green('Discord Bot List stats updated.')))
        .catch(err => console.error(`Error in updating DBL Stats.\n ${err.message}`));

    return "Updated Discord Bot List stats."
}

module.exports.updateCmdStats = (cmd, message) => {
    if (message.guild) {
        if (!serverStats[message.guild.id]) serverStats[message.guild.id] = { "Command Usage": { "Total Commands": { "total": 1 } } }
        else serverStats[message.guild.id][`Command Usage`][`Total Commands`].total++

        if (!serverStats[message.guild.id][`Command Usage`][message.author.id]) serverStats[message.guild.id][`Command Usage`][message.author.id] = { "total": 1 }
        else serverStats[message.guild.id][`Command Usage`][message.author.id].total++

        if (!serverStats[message.guild.id][`Command Usage`][message.author.id][cmd.info.name]) serverStats[message.guild.id][`Command Usage`][message.author.id][cmd.info.name] = 1
        else serverStats[message.guild.id][`Command Usage`][message.author.id][cmd.info.name]++

        if (!serverStats[message.guild.id][`Command Usage`][`Total Commands`][cmd.info.name]) serverStats[message.guild.id][`Command Usage`][`Total Commands`][cmd.info.name] = 1
        else serverStats[message.guild.id][`Command Usage`][`Total Commands`][cmd.info.name]++

        fs.writeFile(`./JSON/Stats/serverStats.json`, JSON.stringify(serverStats, null, 4), err => { if (err) throw err })
    }

    if (!userStats[message.author.id]) userStats[message.author.id] = { "Command Usage": { "total": 1 } }
    else userStats[message.author.id][`Command Usage`].total++

    if (!userStats[message.author.id][`Command Usage`][cmd.info.name]) userStats[message.author.id]["Command Usage"][cmd.info.name] = 1
    else userStats[message.author.id][`Command Usage`][cmd.info.name]++
    fs.writeFile(`./JSON/Stats/userStats.json`, JSON.stringify(userStats, null, 4), err => { if (err) throw err })

    globalStats[`Command Usage`].total++
    if (!globalStats[`Command Usage`][cmd.info.name]) globalStats[`Command Usage`][cmd.info.name] = 1
    else globalStats[`Command Usage`][cmd.info.name]++
    fs.writeFile(`./JSON/Stats/globalStats.json`, JSON.stringify(globalStats, null, 4), err => { if (err) throw err })
}

module.exports.sendMenu = async (user, channel, attributes, options) => {
    // Sends a menu containing {options}, and awaits a user response which it then returns.
    if (!channel || !options || !attributes || !attributes.title) return;
    let msg = `\`\`\`nginx\n${attributes.title}\n\n${attributes.description}\n`

    for (let i in options) {
        msg += `[==[${Number(i)+1}]==] ${options[i]}\n`
    }
    msg += `\nReply with your desired option by entering its number.\nThis message automatically times out in 60 seconds.\nType 'exit' or 'quit' to cancel.\n\`\`\``
    botMsg = await channel.send(msg)

    answer = await channel.awaitMessages(m => (m.content.toLowerCase() == 'exit' || m.content.toLowerCase() == 'quit' || (m.content > 0 && m.content <= options.length)) && m.author.id == user.id, {max: 1, time: 60000, errors: ['time']})
    .catch(c => {botMsg.delete(); channel.send(`⏰ Menu timed out due to inactivity.`).catch(e => {console.error(e)})})
    if (!botMsg || !answer) return false
    answer = answer.first()
    if (['exit', 'quit'].includes(String(answer.content).toLowerCase())) {botMsg.delete(); return false}
    else {botMsg.delete(); return Object(answer)}
}

module.exports.sendQuestion = async (user, channel, question, filter, time=30000) => {
    // Like sendMenu(), but sends a single question wherein the filter can be customised as it isn't restricted to numbers.
    /* Returns a Discord Message instead of a string for the answer. The Message being the user's reply. */
    if (!channel || !question || !filter) throw Error(`sendQuestion -> No channel, question, or filter provided.`)

    botMsg = await channel.send(question + `\n\`\`\`http\nType 'exit' or 'quit' to cancel.\n\`\`\``)

    answer = await channel.awaitMessages(m => (filter(m) == true || m.content.toLowerCase() == 'exit' || m.content.toLowerCase() == 'quit') && m.author == user, {max: 1, time: time, errors: ['time']})
    .catch(c => {botMsg.delete(); channel.send(`⏰ Timed out due to inactivity.`)})
    if (!botMsg || !answer || answer.length == 0) return false

    answer = answer.first()
    if (['exit', 'quit'].includes(String(answer.content).toLowerCase())) {botMsg.delete(); return false}
    else {botMsg.delete(); return Object(answer)}
}

module.exports.suffix = (number) => {
    if (String(number).endsWith("1")) numbersuffix = "st"
    else if (String(number).endsWith("2")) numbersuffix = "nd"
    else if (String(number).endsWith("3")) numbersuffix = "rd"
    else numbersuffix = "th"
    return numbersuffix
}

module.exports.getTime = async (date, add) => {
    let minutes = new Number(); let hours = new Number()
    if (!add) seconds = new Number((date- Date.now()) / 1000)
    else seconds = new Number((date + Date.now()) / 1000)

    while (await seconds > 60) {
        seconds = await seconds - 60
        await minutes ++
    }

    while (await minutes > 60) {
        minutes = await minutes - 60
        await hours ++
    }


    let times = await new Object({
        hours: Math.round(hours),
        minutes: Math.round(minutes),
        seconds: Math.round(seconds)
    })
    return await times
}

module.exports.getTimeString = async (date) => {
    let times = await this.getTime(date)
    
    if (times.hours == 0) times.hours = false
    if (times.minutes == 0) times.minutes = false
    if (times.seconds == 0) times.seconds = false

    if (times.hours > 1) { hourS = "s"; } else hourS = ""
    if (times.minutes > 1) minuteS = "s"; else minuteS = ""
    if (times.seconds > 1) secondS = "s"; else secondS = ""

    if (times.hours && !times.minutes && !times.seconds) return new String(`${times.hours} hour${hourS}`)
    if (!times.hours && times.minutes && !times.seconds) return new String(`${times.minutes} minute${minuteS}`)
    if (!times.hours && !times.minutes && times.seconds) return new String(`${times.seconds} second${secondS}`)

    if (times.hours && times.minutes && times.seconds) return new String(`${times.hours} hour${hourS}, ${times.minutes} minute${minuteS} and ${times.seconds} second${secondS}`)
    if (times.hours && times.minutes && !times.seconds) return new String(`${times.hours} hour${hourS} and ${times.minutes} minute${minuteS}`)
    if (times.hours && !times.minutes && times.seconds) return new String(`${times.hours} hour${hourS} and ${times.seconds} second${secondS}`)
    if (!times.hours && times.minutes && times.seconds) return new String(`${times.minutes} minute${minuteS} and ${times.seconds} second${secondS}`)
    if (!times.hours && !times.minutes && !times.seconds) return new String(`0 seconds. (About now)`)

    return new String(`${hours} ${minutes} ${seconds}`)
    //return `Error :| Hours - ${times.hours} Minutes - ${times.minutes} Seconds - ${times.seconds}`
}

module.exports.findRole = (guild, search) => {
    let filter = x => x.name.toLowerCase().startsWith(search.toLowerCase()) || x.id == search

    let roleArray = guild.roles.cache.filter(filter).array()
    if (roleArray.length == 1) return roleArray[0]
    else if (roleArray.length == 0) return false
    else return roleArray
}

module.exports.fetchGuild = (search) => {
    if (!search || search == "") throw Error(`Error in fetching guild: 'search' is undefined or null.`)
    let filter = x => x.name.toLowerCase().startsWith(search.toLowerCase()) || x.id == search
    let guild = main.bot.guilds.cache.filterArray(filter)

    if (guild.length == 0) return false
    if (guild.length == 1) return guild[0]
    else return guild
}

module.exports.findInvite = async (guild) => {
    let invites = await guild.fetchInvites(),
    invite = invites.find(x => x.maxAge == 0) || invites.find(x => x.maxUses == 0)
   
    if (!invite) invite = invites.first()
    
    if (invite) return invite
    else return null
}

module.exports.separateBots = async (guild) => {
    let members = new Object({
        bots: new Number(),
        humans: new Number()
    })
    guild.members.cache.forEach(async member => {
        if (member.user.bot) members.bots ++
        else members.humans ++
    })
    return members
}

module.exports.fetchChannel = (arg, guild=undefined, firstMatch=false) => {
    if (!arg) return false
    let channels, filter = c => c.name.toLowerCase().startsWith(arg.toLowerCase()) || arg.includes(`<#${c.id}>`) || arg == c.id

    if (guild) channels = guild.channels.filter(filter).array()
    else if (guild == undefined) channels = main.bot.channels.cache.filter(filter).array()

    if (firstMatch && channels.length == 0) return false

    if (channels.length == 1 || firstMatch) return new Object(channels[0])
    else if (channels.length == 0) return false;
    else return Array(channels)
}

module.exports.fetchUser = async (arg) => {
    if (!arg) return false
    else if (arg.toLowerCase() == "greg") return main.bot.users.cache.get(`257482333278437377`)
    let users = main.bot.users.cache.filter(user => user.tag.toLowerCase().startsWith(arg.toLowerCase()) || arg == `<@!${user.id}>` || arg == user.id || user.discriminator.startsWith(arg)).array()
    if (users.length == 1) return new Object(users[0])
    else if (users.length == 0) return await main.bot.users.cache.fetch(arg).catch(err => {return false})
    else return Array(users)
}

module.exports.getUser = async (search, errorChannel) => {
    let user = await this.fetchUser(search)
    if (Array.isArray(user)) {
        let embed = new Discord.MessageEmbed()
        .setTitle(`More than one match.`)
        .setDescription(`More than user found, did you mean one of the following?\n${user.join("  ")}`)
        errorChannel.send({embed})
        return undefined
    }
    if (!user) {
        errorChannel.send(`I couldn't find a user matching \`${search}\`.`)
        return undefined
    }
    else return user
}

module.exports.fetchMember = (guild, search) => {
    if (!search) return false
    search = search.toLowerCase()

    filter = member => member.user.tag.toLowerCase().startsWith(search) || member.user.id == search || search.includes(`<@!${member.id}>`) || search.includes(`<@${member.id}>`)
            || member.user.discriminator.startsWith(search) || member.displayName.toLowerCase().startsWith(search)
    member = guild.members.filter(filter).array()

    if (member.length == 1) return member[0]
    else if (member.length == 0) return false
    else return member
}

module.exports.getMember = (guild, search, errorChannel) => {
    let member = this.fetchMember(guild, search)
    if (Array.isArray(member)) {
        let embed = new Discord.MessageEmbed()
        .setTitle(`More than one match.`)
        .setDescription(`More than user found, did you mean one of the following?\n${member.join("  ")}`)
        errorChannel.send({embed})
        return undefined
    }
    if (!member) {
        errorChannel.send(`I couldn't find a user matching \`${search}\`.`)
        return undefined
    }
    else return member
}

module.exports.fetchState = (search, firstMatch=false) => {
    if (!search) return false
    search = search.toLowerCase()

    state = Object.keys(corona.states).filter(s => s.toLowerCase().startsWith(search))
    
    if (state.length == 1 || firstMatch) return state[0]
    else if (state.length == 0) return false
    else return state
}

module.exports.getState = (search, errorChannel) => {
    let state = this.fetchState(search)
    if (Array.isArray(state)) {
        let embed = new Discord.MessageEmbed()
        .setTitle(`More than one match.`)
        .setDescription(`More than one state found, did you mean one of the following?\n${state.join("  ")}`)
        errorChannel.send({embed})
        return undefined
    }
    if (!state) {
        errorChannel.send(`I couldn't find a state matching \`${search}\`.`)
        return undefined
    }
    else return state
}

module.exports.fetchCounty = (state, search, firstMatch=false) => {
    if (!search) return false
    search = search.toLowerCase()
    
    let county = Object.keys(corona.states[state].counties).filter(s => s.toLowerCase().startsWith(search))
    
    if (county.length == 1 || firstMatch) return county[0]
    else if (county.length == 0) return false
    else return county
}

module.exports.getCounty = (state, search, errorChannel) => {
    let county = this.fetchCounty(state, search)
    if (Array.isArray(county)) {
        let embed = new Discord.MessageEmbed()
        .setTitle(`More than one match.`)
        .setDescription(`More than one county found for ${state}, did you mean one of the following?\n${county.join("  ")}`)
        errorChannel.send({embed})
        return undefined
    }
    if (!county) {
        errorChannel.send(`I couldn't find a county matching \`${search}\`.`)
        return undefined
    }
    else return county
}

module.exports.fetchCountry = (search, firstMatch=false) => {
    if (!search) return false
    search = search.toLowerCase()

    if (["uk", "usa","uae"].includes(search)) return search.toUpperCase()
    if ("iran".startsWith(search.toLowerCase())) return "Iran"
    if ("macedonia".startsWith(search)) return "Macedonia"

    if ("south korea".startsWith(search) || "korea".startsWith(search)) return "S. Korea"

    alphaFilter = c => {
        let info = corona.countries[c].countryInfo
        return info && info.iso2 && info.iso3 && [info.iso2.toLowerCase(), info.iso3.toLowerCase()].includes(search)
    }

    filter = c => c.toLowerCase().startsWith(search) || c.toLowerCase() == search || ("united kingdom".startsWith(search) && c == "UK") || ("united states of america".startsWith(search) && c == "USA") || ("united arab emirates".startsWith(search) && c == "UAE")
    country = this.countries().filter(alphaFilter)
    if (!country || country.length == 0) country = this.countries().filter(filter) 
    
    if (country.length == 1 || firstMatch) return country[0]
    else if (country.length == 0) return false
    else return country
}

module.exports.getCountry = (search, errorChannel) => {
    let country = this.fetchCountry(search)
    if (Array.isArray(country)) {
        let embed = new Discord.MessageEmbed()
        .setTitle(`More than one match.`)
        .setDescription(`More than one country found, did you mean one of the following?\n${country.join("  ")}`)
        errorChannel.send({embed})
        return undefined
    }
    if (!country) {
        errorChannel.send(`I couldn't find a country matching \`${search}\`.`)
        return undefined
    }
    else return country
}

module.exports.countries = () => {
    arr = Object.keys(corona.countries)
    arr.splice(arr.indexOf(`World`), 1)
    return arr
}

module.exports.displayStatistics = [`Cases`,`Cases Today`,`Deaths`,`Deaths Today`,`Recovered`, `Active`, `Critical`, `Cases Per Million`, `Deaths Per Million`, `Tests`, `Tests Per Million`, `Population`, `Active Per Million`, `Recovered Per Million`, `Critical Per Million`]

module.exports.globalDisplayStatistics = [`Cases`,`Cases Today`,`Deaths`,`Deaths Today`,`Recovered`, `Critical`, `Cases Per Million`, `Deaths Per Million`, `Tests`, `Tests Per Million`]

module.exports.updateVoiceStats = async () => {
    // Get all channels that need updating into an object
    let channels = {}
    for (let id in guildinfo) {
        if (!guildinfo[id].voice_stats) continue;

        if (!main.bot.guilds.cache.get(id)) {delete guildinfo[id].voice_stats; continue;}
        let gChannels = guildinfo[id].voice_stats.channels
        for (let channelID in gChannels) {
            if (!gChannels[channelID].updated) guildinfo[id].voice_stats.channels[channelID].updated = 0
        }
        channels = {...channels, ...gChannels}
    }
    fs.writeFileSync(`./JSON/guildinfo.json`, JSON.stringify(guildinfo, null, 4))
    // Sort them in order of last updated
    allChannels = Object.keys(channels).sort((a, b) => channels[a].updated - channels[b].updated).filter(id => {
        let c = main.bot.channels.cache.get(id), channelValue, value;
        if (!c || !c.name) return false
        if (!c.name.startsWith("📊")) return true;
        try {
        channelValue = c.name.split(" ")[1].replace(/\D/g,'')
        } catch { return false; }
        if (!channels[id].country) value = corona.all[channels[id].stat]
        else {
            country = corona.countries[channels[id].country]
            value = country[channels[id].stat]
        }
        return Date.now() - channels[id].updated > 3600000 /*1 Hour*/ && (Math.abs(value - Number(channelValue)) > 10 || !c.name.includes(`Per Million`))
    })
    slicedChannels = allChannels.slice(0, 300),
    start = Date.now(), channelsUpdated = 0
    // Loop through, don't edit if certain threshold isn't passed, don't edit if been updated in the last 2-3 hours
    for (let i in slicedChannels) {
        let id = slicedChannels[i]
        await this.updateVoiceChannel(id)
        channelsUpdated ++
    }
    timeTaken = (Date.now() - start) / 1000 /*In seconds*/
    console.log(chalk.green(`[Voice Stat Update] Successfully updated ${channelsUpdated} channels in ${timeTaken} seconds. There are still ${allChannels.length - 300} channels to update.`))
    fs.writeFileSync(`./JSON/guildinfo.json`, JSON.stringify(guildinfo, null, 4))
    return `[Voice Stat Update] Successfully updated ${channelsUpdated} channels in ${timeTaken} seconds. There are still ${allChannels.length - 300} channels to update.`
}

module.exports.updateVoiceChannel = async (id) => {
    let c = main.bot.channels.cache.get(id), value, stats,
    channels = guildinfo[c.guild.id].voice_stats.channels
    if (!c) return;

    if (!channels[id].country) {
        if (channels[id].stat == "active") channels[id].stat = `critical`
        value = corona.all[channels[id].stat],
        stats = Object.keys(corona.all),
        displayStatistics = this.globalDisplayStatistics
    }
    else {
        country = corona.countries[channels[id].country]
        value = country[channels[id].stat],
        a = Object.keys(country)
        stats = a.slice(2),
        displayStatistics = this.displayStatistics
    }
    // console.log(`Channel '${c.id}' with update value of ${channels[id].updated} - ${value} ${displayStatistics[stats.indexOf(channels[id].stat)]}`)
    if (!value) return false;
    await c.setName(`📊 ${value.toLocaleString()} ${displayStatistics[stats.indexOf(channels[id].stat)]}`).catch(e => {})
    guildinfo[c.guild.id].voice_stats.channels[id].updated = Date.now()
    return c
}

module.exports.updateCoronaData = async () => {
    let res = await node_fetch(`https://corona.lmao.ninja/v2/countries`),
    data = await res.json(),

    globalRes = await node_fetch(`https://corona.lmao.ninja/v2/all`),
    d = await globalRes.json(),

    stateList = await node_fetch(`https://corona.lmao.ninja/v2/historical/usacounties`)
    stateList = await stateList.json()

    let states = await node_fetch(`https://corona.lmao.ninja/v2/jhucsse/counties`) 
    states = await states.json()

    corona.all = {
        cases: d.cases,
        casesToday: d.todayCases,
        deaths: d.deaths,
        deathsToday: d.todayDeaths,
        recovered: d.recovered,
        critical: d.critical,
        casesPerOneMillion: d.casesPerOneMillion,
        deathsPerOneMillion: d.deathsPerOneMillion,
        tests: d.tests,
        testsPerOneMillion: d.testsPerOneMillion
    }

    if (!corona.countries) corona.countries = {}
    if (!corona.states) corona.states = {}

    data.forEach(d => {
        countryName = new String(d.country)
        delete d.country
        delete d.continent
        corona.countries[countryName] = d
    })

    stateList.forEach(stateName => {
        stateInfo = states.filter(x => {return x.province.toLowerCase() == stateName})
        if (stateInfo.length == 0) return;
        stateName = stateInfo[0].province
        corona.states[stateName] = {
            all: {},
            counties: {}
        }
        let all=0, allDeaths=0, allRecovered=0;
        stateInfo.forEach(d => {
            let cases = 0, deaths=0, recovered=0
            if (d.stats) cases = d.stats.confirmed, deaths = d.stats.deaths, recovered = d.stats.recovered;
            corona.states[stateName].counties[d.county] = {
                cases: cases,
                deaths: deaths,
                recovered: recovered
            }
            all += cases
            allDeaths += deaths
            allRecovered += recovered
        })

        corona.states[stateName].all = {
            cases: all,
            deaths: allDeaths,
            recovered: allRecovered
        }
    })

    return fs.writeFileSync(`./JSON/corona.json`, JSON.stringify(corona, null, 4))
}

module.exports.generateTip = (prefix, cmd) => {
    tips = [
        `Please consider voting for us on Discord Bot List! Use ${prefix}links`,
        `We have a support server! Check it out in ${prefix}links`,
        `Don't like the prefix? Change it with ${prefix}prefix.`
    ]

    if (!cmd || cmd != `top`) tips.push(`Use ${prefix}top to see a list of countries most affected!`)

    return tips[this.randomInt(0, tips.length - 1)]
}

module.exports.updateDBLStats = () => {
    snekfetch.post(`https://discordbots.org/api/bots/stats`)
        .set('Authorization', settings.DBLtoken)
        .send({ server_count: main.bot.guilds.cache.size})
        .then(() => console.log(chalk.green('Discord Bot List stats updated.')))
        .catch(err => console.error(`Error in updating DBL Stats.\n ${err.message}`));

    return "Updated Discord Bot List stats."
}