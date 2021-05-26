const settings = require("./config.json");
const Discord = require("discord.js");
const bot = new Discord.Client(),
modules = require(`./modules.js`)
module.exports.bot = bot

const config = settings,
chalk = require('chalk'),

DBL = require('dblapi.js'),
dbl = new DBL(config.DBLtoken, {webhookPort: 5001, webhookAuth: 'fdathfdfe', webhookPath: `/dbl`}),

fs = require(`fs`),
guildinfo = require(`./JSON/guildinfo.json`),
userinfo = require(`./JSON/userinfo.json`)

const globalStats = require(`./JSON/Stats/globalStats.json`),
serverStats = require(`./JSON/Stats/serverStats.json`),
userStats = require(`./JSON/Stats/userStats.json`),

corona = require(`./JSON/corona.json`)

module.exports.run = async () => {
    let botCommands = new Discord.Collection();
    files = fs.readdirSync(`./Commands/`).concat(fs.readdirSync(`./dev_commands/`))

    let jsfiles = files.filter(f => f.split(".").pop() === `js`);
    if (jsfiles.length <= 0) console.log(chalk.red(`No commands to load.`));
    else {
        console.log(chalk.magentaBright(`Loading ${jsfiles.length} commands. . .`))
        for (let file in jsfiles) {
            file = jsfiles[file]
            try {
                if (fs.existsSync(`./Commands/${file}`)) cmd = require(`./Commands/${file}`);
                else cmd = require(`./dev_commands/${file}`)
            }
            catch (e) {console.log(chalk.magenta(`${file} couldn't load properly....` + chalk.red(e))); continue}

            if (!cmd.info) {console.log(chalk.red(`No info for command ${file}!`)); continue}
            if (!cmd.run) {console.log(chalk.red(`No run function for command ${file}!`)); continue}
            let props = cmd;
            botCommands.set(props.info.name, props);
        };
        console.log(chalk.green(`Commands loaded!`))
    }
    module.exports.botCommands = botCommands
    module.exports.commands = new Object(botCommands)

    console.log(chalk.magentaBright('Logging in. . .'))
    await bot.login(settings.token).catch(e => {console.log(`Error when logging in. . .`); console.error(e)})
    module.exports.bot = bot

    return bot
}

bot.on('ready', async () => {
    console.log(chalk.cyan(`Logged in as...
        

    
    ▄████▄   ▒█████   ██▀███   ▒█████   ███▄    █  ▄▄▄          ███▄    █ ▓█████  █     █░  ██████ 
    ▒██▀ ▀█  ▒██▒  ██▒▓██ ▒ ██▒▒██▒  ██▒ ██ ▀█   █ ▒████▄        ██ ▀█   █ ▓█   ▀ ▓█░ █ ░█░▒██    ▒ 
    ▒▓█    ▄ ▒██░  ██▒▓██ ░▄█ ▒▒██░  ██▒▓██  ▀█ ██▒▒██  ▀█▄     ▓██  ▀█ ██▒▒███   ▒█░ █ ░█ ░ ▓██▄   
    ▒▓▓▄ ▄██▒▒██   ██░▒██▀▀█▄  ▒██   ██░▓██▒  ▐▌██▒░██▄▄▄▄██    ▓██▒  ▐▌██▒▒▓█  ▄ ░█░ █ ░█   ▒   ██▒
    ▒ ▓███▀ ░░ ████▓▒░░██▓ ▒██▒░ ████▓▒░▒██░   ▓██░ ▓█   ▓██▒   ▒██░   ▓██░░▒████▒░░██▒██▓ ▒██████▒▒
    ░ ░▒ ▒  ░░ ▒░▒░▒░ ░ ▒▓ ░▒▓░░ ▒░▒░▒░ ░ ▒░   ▒ ▒  ▒▒   ▓▒█░   ░ ▒░   ▒ ▒ ░░ ▒░ ░░ ▓░▒ ▒  ▒ ▒▓▒ ▒ ░
    ░  ▒     ░ ▒ ▒░   ░▒ ░ ▒░  ░ ▒ ▒░ ░ ░░   ░ ▒░  ▒   ▒▒ ░   ░ ░░   ░ ▒░ ░ ░  ░  ▒ ░ ░  ░ ░▒  ░ ░
    ░        ░ ░ ░ ▒    ░░   ░ ░ ░ ░ ▒     ░   ░ ░   ░   ▒         ░   ░ ░    ░     ░   ░  ░  ░  ░  
    ░ ░          ░ ░     ░         ░ ░           ░       ░  ░            ░    ░  ░    ░          ░  
    ░                                                                                               



       `))
    
    await modules.updateCoronaData()

    await modules.setGame()
    bot.setInterval(async () => {
        await modules.setGame()
        modules.backupJSON()

        bot.channels.cache.get(settings.guildCountChannel).setName(`${bot.guilds.cache.size.toLocaleString()} Corona News Guilds`)
    }, 900000 /* 15 minutes */)

    bot.setInterval(async () => {
        await modules.updateVoiceStats()
    }, 480000)

    bot.setInterval(async () => {
        await modules.updateCoronaData()

        for (let id in userinfo) {
            if (userinfo[id].voteReminder && userinfo[id].nextVote <= Date.now() && !userinfo[id].sentReminder) {
                let user = bot.users.cache.get(id),
                voteMsgs = [
                    `*Have you remembered to vote today?*`,
                    `You can vote again!`,
                    `You can now vote again for Corona News ;)`,
                    `It would seem you can vote again - go on, **click the button.**`
                ]
                user.send(`${voteMsgs[modules.randomInt(0, voteMsgs.length - 1)]}\nYou asked me to remind you when you can vote again. To disable this, type \`->voteReminder\`.\nhttps://top.gg/bot/690024532853129292/vote`)
                userinfo[id].sentReminder = true
                fs.writeFileSync(`./JSON/userinfo.json`, JSON.stringify(userinfo, null, 4))
            }
        }
    }, 60000 /* 1 minute */)

    bot.setInterval(async () => {
        modules.updateDBLStats()
    }, 3600000 /*1 hour*/)
});

bot.on('message', async (message) => {
    const time = new Date().toUTCString().split(" ")[4]
    const args = message.content.split(/\s+/);

    let x = 0, i = 0
    while (x != 1 && message.content[i]) {
        if (message.content[i] == " ") x ++
        i ++
    }
    let content = message.content.slice(i)
    
    if (message.channel.type != "dm" && guildinfo[message.guild.id] && guildinfo[message.guild.id].prefix) prefix = guildinfo[message.guild.id].prefix
    else prefix = settings.defaultPrefix

    if (message.channel.type == "dm" && !message.content.startsWith(prefix)) {
        if (message.author == bot.user) return;
        globalStats.lastDM = message.author.id;
        fs.writeFileSync(`./JSON/Stats/globalStats.json`, JSON.stringify(globalStats, null, 4))

        let embed = new Discord.MessageEmbed()
        .setColor(`0DEABF`)
        .setAuthor(`${message.author.tag} ${message.author.id}`, message.author.displayAvatarURL)
        .setDescription(message.content)
        .setTimestamp(Date.now())

        if (message.content.toLowerCase().includes(`help`)) {
            message.channel.send(`You seem lost - the command in DMs is always ${prefix}help\nIf you would like assistance from our human support team, join the support server here: https://discord.gg/bAqyGbZ`)
            embed.setFooter(`✔️ Help message was sent.`)
        }

        return bot.channels.cache.get(config.dmLogChannel).send({embed})
    }

    if (message.channel.type != "dm" && !message.channel.permissionsFor(message.guild.me).has(`SEND_MESSAGES`)) return;
    if (message.author.bot || !args[0]) return;
    if (!message.content.startsWith(prefix) && !message.mentions.users.has(bot.user.id)) {
        if (message.channel.id == config.dmLogChannel) message.delete()
        return;
    }

    aliasCheck = `${prefix}%X%`

    // Command Handler
    if (args[0] == `<@${bot.user.id}>` || args[0] == `<@!${bot.user.id}>`) {
        args.splice(0, 1)
        content = args.slice(1).join(" ")
        cmd = this.botCommands.get(args[0])
        aliasCheck = `%X%`
        if (message.mentions.members) message.mentions.members = message.mentions.members.filter(x => {x != message.mentions.members.first()})
    }
    else if (message.content.startsWith(prefix)) cmd = this.botCommands.get(args[0].toLowerCase().slice(prefix.length));
    else return;
    if (!cmd && args.length != 0) this.botCommands.forEach(command => {
        if (command.info.aliases) {
            command.info.aliases.forEach(x => {
                if (args[0].toLowerCase() == aliasCheck.replace(`%X%`, x)) { return cmd = command }
            })
        }
    });
    if (cmd) {
        if (message.channel.type != "dm") {
            // In a guild
            console.log(chalk.blue(`${time} | ${message.author.tag} executed "${message.content}" | ${message.channel.name} | ${message.guild.name} | ${message.guild.id}`))
        }
        else /*In a DM ->*/ console.log(chalk.blue(`${time} | ${message.author.tag} executed "${message.content}" | DM Channel`))

        if (!userinfo[message.author.id] && cmd.info.requiresUserinfo) modules.registerUser(message.author)
        if (message.guild && !guildinfo[message.guild.id] && cmd.info.requiresGuildinfo) modules.registerGuild(message.guild)

        if (cmd.info.ignore) return;
        if (cmd.info.ignoreDM && message.channel.type == `dm`) return message.channel.send(`This command cannot be used in Direct Messages.`)
        if (await cmd.info.developer && !settings.developerIDs.includes(message.author.id)) return;

        if (cmd.info.permissions && message.guild) {
            permissionsNeeded = ""
            for (let i in cmd.info.permissions) {
                perm = cmd.info.permissions[i]
                if (!message.channel.permissionsFor(message.member).has(perm)) permissionsNeeded += `\`${perm}\`, `
            }
            if (permissionsNeeded && !config.developerIDs.includes(message.author.id)) return message.channel.send(`You don't have permission to run this command.\nMissing required permissions: ${permissionsNeeded.slice(0, permissionsNeeded.length - 2)}`)
        }
        if (cmd.info.botPermissions && message.guild) {
            permissionsNeeded = ""
            for (let i in cmd.info.botPermissions) {
                perm = cmd.info.botPermissions[i]
                if (!message.channel.permissionsFor(message.guild.me).has(perm)) permissionsNeeded += `\`${perm}\`, `
            }
            if (permissionsNeeded) return message.channel.send(`I don't have sufficient permissions to run this command.\nMissing required permissions: ${permissionsNeeded.slice(0, permissionsNeeded.length - 2)}`)
        }

        if (cmd.info.guildCooldown) {
            let info = guildinfo[message.guild.id]
            if (!info.cooldowns) guildinfo[message.guild.id].cooldowns = {}
            if (!info.cooldowns[cmd.info.name] || info.cooldowns[cmd.info.name] <= Date.now()) {
                guildinfo[message.guild.id].cooldowns[cmd.info.name] = Date.now() + cmd.info.guildCooldown;
                fs.writeFileSync(`./JSON/guildinfo.json`, JSON.stringify(guildinfo, null, 4))
            }
            else return message.channel.send(`⏱️ Slow down! This command can only be used every **${cmd.info.guildCooldown / 60000} minutes!**\nYou can use this command again in ${await modules.getTimeString(info.cooldowns[cmd.info.name])}.\nThis is a server-wide cooldown.`)
        }

        if (cmd.info.support && !message.member.roles.cache.has(`695805579163205664`)) return message.channel.send(`This command is reserved for the support staff on Rubix Bot Hub. If you are support, you can only use this command on Rubix Bot Hub.`)

        if (cmd.info.requiresDblVote && !await dbl.hasVoted(message.author.id)) return message.channel.send(`This command requires voting for the bot on Discord Bot List - this supports the bot and is free! You can do so by following this link:\nhttps://top.gg/bot/690024532853129292/vote`)

        try {
            await cmd.run(bot, message, args, content, prefix, time)
            if (cmd.info) modules.updateCmdStats(cmd, message)
        } catch (error) {
            if (settings.developerIDs.includes(message.author.id)) message.channel.send(`Error.\n\`\`\`${error}\`\`\``)
            else message.channel.send(`Ok um, an error occurred. If this happens frequently, please DM me to send feedback to my developer. Alternatively, join the official discord server in ${prefix}links.\nWe'll get to solving this issue as soon as we can.`)
            if (cmd && cmd.info && cmd.info.name) {
                console.error(`Error running ${cmd.info.name}:`)
                console.error(error)
            }
        }
    }
})

dbl.webhook.on('ready', hook => {
    console.log(chalk.green(`DBL webhook ready.\n${hook}`))
})

dbl.webhook.on('vote', vote => {
    let date = new Number(Date.now()),
    user = bot.users.cache.get(vote.user)
    console.log(vote.toString())
    console.log(user)
    if (user) {
        console.log(chalk.green(`${user.tag} just voted!`))
        if (!userinfo[user.id]) modules.registerUser(user)
        if (!userStats[user.id]) userStats[user.id] = {"Command Usage": {"total": 0}, votes: 0}
        userinfo[user.id].votedThisMonth = true;
        userinfo[user.id].nextVote = date + 43230000 // 12 Hours and 30 seconds
        userinfo[user.id].sentReminder = false
        fs.writeFileSync(`./JSON/userinfo.json`, JSON.stringify(userinfo, null, 4))

        userStats[user.id].votes ++
        fs.writeFileSync(`./JSON/Stats/userStats.json`, JSON.stringify(userStats, null, 4))

        if (userinfo[user.id] && userinfo[user.id].votedThisMonth) return; 
        user.send(`Thank you for voting for Corona News! This message only sends the first time you vote for Corona News in a month, so don't worry about spam.\n\nVoting gives you access to the \`->renew\` command. This resets voice statistics in your server whenever you want without having to wait in hour intervals!\n\nIf you'd like me to remind you when you can vote again, simply run \`->voteReminder\`. Have a nice day!`)
    }
})

bot.on('guildCreate', async (guild) => {
    console.log(`Guild "${guild.name}" added.`)
    await modules.setGame()
    await modules.updateGuildCount()

    let members = await modules.separateBots(guild)
    let invite = await modules.findInvite(guild).catch(e => {return null})
    if (invite) inviteString = `[https://discord.gg/${invite.code}](https://discord.gg/${invite.code})`
    if (!invite) inviteString = `Invite can't be found.`

    if (guild.me.hasPermission(`ADMINISTRATOR`)) admin = `Yes.`
    else admin = `Nope`

    let embed = new Discord.MessageEmbed()
        .setColor(`GREEN`)
        .setTitle(guild.name)
        .setThumbnail(guild.iconURL)
        .addField(`ID`, guild.id, true)
        .addField(`Server Owner`, guild.owner.user.tag, true)
        .addField(`Humans | Bots | Total`, `${members.humans} | ${members.bots} | ${guild.memberCount}`, true)
        .addField(`Administrator`, admin)
        .addField(`Invite`, inviteString, true)

    let channel = bot.channels.cache.get(settings.guildLogChannel)
    channel.send({ embed })
})

bot.on(`guildDelete`, async (guild) => {
    if (!guild || !guild.name) return;

    let owner = "Couldn't get :C"
    if (guild.owner) owner = `${guild.owner.user.tag} (${guild.ownerID})`
    let embed = new Discord.MessageEmbed()
        .setColor(`FD0404`)
        .setTitle(guild.name)
        .setThumbnail(guild.iconURL)
        .addField(`ID`, guild.id, true)
        .addField(`Server Owner`, owner, true)
        .addField(`Total Members`, guild.memberCount, true)

    let channel = bot.channels.cache.get(settings.guildLogChannel)
    channel.send({ embed })
    console.log(chalk.red(`Guild "${guild.name}" removed.`))
    await modules.setGame()
    await modules.updateGuildCount()
})

bot.on(`guildMemberAdd`, (member) => {
    if (member.guild.id == /*Coronanews Discord*/`689734320784408667`) {
        let embed = new Discord.MessageEmbed()
            .setColor(`GREEN`)
            .setDescription(`${member} joined! (${member.user.tag})`)

            .setTimestamp(Date.now())

        member.guild.channels.cache.get(settings.memberLogChannel).send({ embed })
    }
})

bot.on('guildMemberRemove', async (member) => {
    if (member.guild.id == /*Coronanews*/`689734320784408667`) {
        let embed = new Discord.MessageEmbed()
            .setColor(`FD0404`)
            .setDescription(`${member} left. (${member.user.tag})`)

            .setTimestamp(Date.now())

        await member.guild.channels.cache.get(settings.memberLogChannel).send({ embed })
    }
})

bot.on('channelDelete', async (channel) => {
    let info = guildinfo[channel.guild.id]
    if (info && info.voice_stats && info.voice_stats.channels[channel.id]) {
        delete guildinfo[channel.guild.id].voice_stats.channels[channel.id]
    }

    if (channel.type == 'category' && info && info.voice_stats && info.voice_stats.categories.includes(channel.id)) {
        guildinfo[channel.guild.id].voice_stats.categories.splice(guildinfo[channel.guild.id].voice_stats.categories.indexOf(channel.id), 1)
    }
    fs.writeFileSync(`./JSON/guildinfo.json`, JSON.stringify(guildinfo, null, 4))
})

bot.on(`disconnect`, (event) => {
    console.log(`${bot.user.username} has disconnected. Attempting to reconnect...`)
    return this.run()
})

bot.on('error', (e) => {
    console.log(chalk.red(`Unexpected Error!\n${e}`))
})

this.run()