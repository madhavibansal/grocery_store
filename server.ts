import express, { Application } from "express";
import userRoutes from "./app/routes/userRoutes";
import adminRoutes from "./app/routes/adminRoutes";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import "./initDB";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(bodyParser.json());

userRoutes(app);
adminRoutes(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
