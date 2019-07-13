#!/usr/bin/env node
const { token } = require('./config.json');

const moment = require('moment');

const logger = require ('./logger');

const Discord = require('discord.js');

const { Users, UserPayments } = require('./dbObjects');
const { Op } = require('sequelize');

const client = new Discord.Client();

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);

    logger.info('Grabbing list of who still owes money and who doesn\'t');

// const usersWhoPaidButNeedVerify = UserPayments.findAll({
//     where: {
//         [Op.and]: [{is_amount_paid: 1}, {is_token_paid: 1}],
//         [Op.or]: [{is_amount_verified: 0}, {is_token_verified: 0}]
//     }
// }).map(u => getUserTag(u.discord_id, client)).join(', ');
//
// const usersWhoPaid = UserPayments.findAll({
//     where: {
//         [Op.and]: [{is_amount_paid: 1}, {is_token_paid: 1}, {is_amount_verified: 1}, {is_token_verified: 1}]
//     }
// }).map(u => getUserTag(u.discord_id, client)).join(', ');

    logger.info(`Sending out daily tax payment reminder`);

const channel = client.channels.get('286000301444431872'); // #gangchat channel id
//     const channel = client.channels.get('597982554167050304'); // #bot-testing channel id
    channel.send(`Hello folks, it's time for me to remind everyone about our weekly 'tax'. If you make your payment via the \`/g bank deposit <amount>\`, please mark that you paid on Discord by typing \`!paid\``);
    getUsersToPay(channel);
    getUsersToVerify(channel);
    getUsersWhoPaid(channel);
    setTimeout(killSwitch, 15000);
});
client.login(token);



async function getUsersToPay(channel) {
    const payments = await UserPayments.findAll({
        attributes: ['discord_id', 'amount_owed', 'amount_paid', 'tokens_owed'],
        where: {
            [Op.or]: [{is_amount_paid: null}, {is_token_paid: null}]
        }
    });

    const idList = [];
    payments.forEach((user) => {
        const id = getUserTag(user.get({plain: true}).discord_id);
        const amountOwed = user.get({plain: true}).amount_owed;
        const amountPaid = user.get({plain: true}).amount_paid;
        const tokensOwed = user.get({plain: true}).tokens_owed;
        const amount = amountOwed - amountPaid;
        idList.push(`<@${id}> *(\$${amount} + ${tokensOwed} tokens)*`);
    });
    if (idList.length > 0)
        channel.send('The following users need to pay still: ' + idList.join(', '));
    else
        channel.send('Everyone has paid ♥♥♥');
}

async function getUsersToVerify(channel) {
    const payments = await UserPayments.findAll({
        attributes: ['discord_id'],
        where: {
            [Op.and]: [{is_amount_paid: 1}, {is_token_paid: 1}],
            [Op.or]: [{is_amount_verified: null}, {is_token_verified: null}, {is_amount_verified: 0}, {is_token_verified: 0}]
        }
    });

    const idList = [];
    payments.forEach((user) => {
        const id = getUserTag(user.get({plain: true}).discord_id);
        idList.push(`<@${id}>`);
    });
    if (idList.length > 0)
        channel.send('The following users need to have payments verified: ' + idList.join(', '));
    else
        channel.send('No users need their payments verified!');
}

async function getUsersWhoPaid(channel) {
    const payments = await UserPayments.findAll({
        attributes: ['discord_id', 'due_date'],
        where: {
            [Op.and]: [{is_amount_paid: 1}, {is_token_paid: 1}, {is_amount_verified: 1}, {is_token_verified: 1}],
            due_date: {
                [Op.gt]: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            }
        }
    });

    const idList = [];
    payments.forEach((user) => {
        const id = client.users.find(u => u.id === user.get({plain: true}).discord_id).username;
        idList.push(`${id}`);
    });
    if (idList.length > 0)
        channel.send('The following users have already paid ♥: ' + idList.join(', '));
    else
        channel.send('No one has paid yet 😢');
}

function getUserTag(discordId) {
    return client.users.find(user => user.id === discordId).id;
}

function killSwitch() {
    process.exit();
}