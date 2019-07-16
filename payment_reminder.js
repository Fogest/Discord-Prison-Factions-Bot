#!/usr/bin/env node
const { token, day_of_week_to_generate_payment, payment_amount, token_amount } = require('./config.json');

const moment = require('moment');

const logger = require ('./logger');

const Discord = require('discord.js');

const { Users, UserPayments } = require('./dbObjects');
const { Op } = require('sequelize');

const client = new Discord.Client();

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);

    logger.info('Grabbing list of who still owes money and who doesn\'t');

    logger.info(`Sending out daily tax payment reminder`);

const channel = client.channels.get('286000301444431872'); // #gangchat channel id
//      const channel = client.channels.get('597982554167050304'); // #bot-testing channel id

    //Is it Wednesday?
    if (moment().weekday() === day_of_week_to_generate_payment) {
        channel.send("Generating the new payments for this week!");
        channel.send(`The payments this week will be \$${payment_amount} and ${token_amount} tokens.`);
        generatePayments(channel);

        setTimeout(function(){userPaymentMessage(channel)}, 6000);
    } else {
        setTimeout(function(){userPaymentMessage(channel)}, 1000);
    }


    setTimeout(killSwitch, 25000);
});
client.login(token);


function userPaymentMessage(channel) {
    channel.send(`Hello folks, it's time for me to remind everyone about our weekly 'tax'. If you make your payment via the \`/g bank deposit <amount>\`, please mark that you paid on Discord by typing \`!paid\``);
    getUsersToPay(channel);
    getUsersToVerify(channel);
    getUsersWhoPaid(channel);
}

async function generatePayments(channel) {
    const oldPayments = await UserPayments.findAll({
        attributes: ['payment_id', 'discord_id', 'reminder_completed'],
        where: {
            [Op.or]: [{is_amount_verified: null}, {is_token_verified: null}, {is_amount_verified: 0}, {is_token_verified: 0}],
            due_date: {
                [Op.between]: [moment().startOf('day').toDate(), moment().endOf('day').toDate()]
            }
        }
    });


    const idList = [];
    oldPayments.forEach((user) => {
        const id = client.users.find(u => u.id === user.get({plain: true}).discord_id).username;
        idList.push(`${id}`);
    });
    if (idList.length > 0)
        channel.send('The following users did not pay last week: ' + idList.join(', '));
    else
        channel.send('Everyone made their payments this week!');

    const oldReminders = await UserPayments.findAll({
        attributes: ['payment_id', 'discord_id', 'reminder_completed'],
        where: {
            [Op.or]: [{reminder_completed: null}, {reminder_completed: 0}],
            due_date: {
                [Op.between]: [moment().startOf('day').toDate(), moment().endOf('day').toDate()]
            }
        }
    });

    oldReminders.forEach(function(old) {
        old.update({
            reminder_completed: 1
        })
    });

    const userList = await Users.findAll({
        attributes: ['discord_id']
    });

    userList.forEach((user) => {
        const payment = UserPayments.create({
            discord_id: user.get({plain: true}).discord_id,
            due_date: moment().add(7, 'days').format("YYYY-MM-DD HH:mm:ss"),
            tokens_owed: token_amount,
            amount_owed: payment_amount,
        });
    });
}

async function getUsersToPay(channel) {
    const payments = await UserPayments.findAll({
        attributes: ['discord_id', 'amount_owed', 'amount_paid', 'tokens_owed'],
        where: {
            [Op.or]: [{is_amount_paid: null}, {is_token_paid: null}],
            [Op.and]: {
                reminder_completed: 0
            }
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
            reminder_completed: 0,
            [Op.and]: [{is_amount_paid: 1}, {is_token_paid: 1}],
            [Op.or]: [{is_amount_verified: 0}, {is_token_verified: 0}, {is_amount_verified: null}, {is_token_verified: null}]
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
            is_amount_paid: 1,
            is_token_paid: 1,
            is_amount_verified: 1,
            is_token_verified: 1,
            reminder_completed: 0
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

function getNextDay(dayWanted) {
    if (moment().weekday() <= dayWanted && moment().weekday() !== dayWanted) {
        // then just give me this week's instance of that day
        return moment().weekday(dayWanted);
    } else {
        // otherwise, give me next week's instance of that day
        return moment().add(1, 'weeks').weekday(dayWanted);
    }
}

function killSwitch() {
    process.exit();
}