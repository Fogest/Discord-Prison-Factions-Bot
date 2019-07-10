#!/usr/bin/env node
const fs = require('fs');
const { prefix, token } = require('./config.json');

const logger = require ('./logger');

const Discord = require('discord.js');

const { Users, UserPayments } = require('./dbObjects');
const { Op } = require('sequelize');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

// Initialize Discord Bot and Database
client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);

    client.user.setActivity('Enforcer Training')
        .then(logger.info(`Bot activity set!`));
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;


    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();


    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if (command.admin === true && !message.member.hasPermission('ADMINISTRATOR'))
        return message.reply('Only admins can use this command!');

    if (command.gang === true && !message.member.roles.some(role => role.name === 'Gang Members'))
        return message.reply('Only gang members can use this command!');

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
        	reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(message, args);
    } catch (error) {
        logger.error(error);
        message.reply('There was an error trying to execute that command! Maybe it doesn\'t exist?');
    }
});

client.login(token);