const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: { ssl: { rejectUnauthorized: false } },
});

const UserResponse = sequelize.define("UserResponse", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    responses: { type: DataTypes.JSONB, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, { timestamps: false, tableName: "users_responses" });

(async () => { await sequelize.sync(); console.log("Database synced successfully."); })();

module.exports = { sequelize, UserResponse };  // ✅ Correct export
