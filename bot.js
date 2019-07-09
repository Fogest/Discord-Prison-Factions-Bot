
const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

const logger = require ('./logger');

// Initialize Discord Bot

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === 'ping') {
        msg.reply('pong');
    }
});

client.login(auth.token);