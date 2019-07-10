module.exports = (sequelize, DataTypes) => {
    return sequelize.define('users', {
        discord_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        player_ign: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true,
        },
    });
};