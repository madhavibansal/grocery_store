import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const initDB = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST as string,
            user: process.env.DB_USER as string,
            password: process.env.DB_PASS as string,
            multipleStatements: true,
        });

        console.log("Connected to MySQL");

        // Read SQL file
        const sqlFilePath = path.join(__dirname, "grocerySchema.sql");
        const sqlScript = fs.readFileSync(sqlFilePath, "utf8");

        // Run SQL script
        await connection.query(sqlScript);
        console.log("Database and tables initialized successfully!");

        await connection.end();
    } catch (err) {
        console.error("Error initializing database:", err);
        process.exit(1);
    }
};

initDB();
