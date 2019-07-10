module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user_payments', {
        payment_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        discord_id: DataTypes.STRING,
        due_date: DataTypes.DATE,
        tokens_owed: DataTypes.INTEGER,
        amount_owed: DataTypes.INTEGER,
        amount_paid: DataTypes.INTEGER,
        is_amount_paid: {
            type: DataTypes.BOOLEAN,
            default: 0
        },
        is_token_paid: {
            type: DataTypes.BOOLEAN,
            default: 0
        },
        is_amount_verified: {
            type: DataTypes.BOOLEAN,
            default: 0
        },
        is_token_verified: {
            type: DataTypes.BOOLEAN,
            default: 0
        },
        amount_verified_by_id: DataTypes.STRING,
        token_verified_by_id: DataTypes.STRING,
    });
};