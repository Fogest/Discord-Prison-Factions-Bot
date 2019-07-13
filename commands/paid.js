const logger = require ('../logger');
const { Users, UserPayments } = require('../dbObjects');
const { Op } = require('sequelize');
const moment = require('moment');

async function markPaid(message, verify=false) {
    if (verify === false) {
        const payment = await UserPayments.findOne({
            attributes: ['payment_id','discord_id', 'amount_owed', 'amount_paid', 'tokens_owed'],
            where: {
                discord_id: {
                    [Op.eq]: message.member.id
                },
                due_date: {
                    [Op.gt]: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
                }
            },
            order: [ [ 'createdAt', 'DESC' ]]
        });

        if (payment) {
            payment.update({
                amount_paid: payment.amount_owed,
                is_amount_paid: 1,
                is_token_paid: 1,
            });
            return message.reply("Marked that you paid and need verification");
        }
        return message.reply("Could not update payment 😢");
    } else {
        const payment = await UserPayments.findOne({
            attributes: ['payment_id', 'discord_id', 'amount_owed', 'amount_paid', 'tokens_owed'],
            where: {
                discord_id: {
                    [Op.eq]: message.mentions.members.first().id
                },
                due_date: {
                    [Op.gt]: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
                }
            }
        });

        if (payment) {
            payment.update({
                amount_paid: payment.amount_owed,
                is_amount_paid: 1,
                is_token_paid: 1,
                is_amount_verified: 1,
                is_token_verified: 1,
                amount_verified_by_id: message.member.id,
                token_verified_by_id: message.member.id
            });
            return message.reply("Marked user as paid!");
        }
        return message.reply("Could not update payment 😢");
    }
}

module.exports = {
    name: 'paid',
    description: 'Allows a user to mark themselves as paid.',
    args: false,
    guildOnly: true,
    admin: false,
    gang: true,
    usage: 'Nothing if marking self as paid || @<discord_name> (for admins only)',
    execute(message, args) {
        // User Self verifying they paid.
        if (args.length === 0) {
            markPaid(message);
        } else if (args.length === 1 && message.member.hasPermission('ADMINISTRATOR')) {
            markPaid(message, true);
        }
    },
};