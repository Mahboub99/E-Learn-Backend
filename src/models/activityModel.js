module.exports = (sequelize, DataTypes) => {
    return sequelize.define("activity", {
        _id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING, // {"youtube", "pdf"}
            allowNull: false,
        },
        link: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // allowNull: true // uncomment me in case of adding quizzes 👌
        },
    });
};