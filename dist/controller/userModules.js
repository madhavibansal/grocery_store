"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbconfig_1 = __importDefault(require("../dbconfig"));
const createCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.name || !req.body.email || !req.body.address) {
            return res.status(400).send({ msg: "bad request" });
        }
        const { name, email, address } = req.body;
        const saveData = yield dbconfig_1.default.query("INSERT INTO users (name, email, address) VALUES (?, ?, ?)", [name, email, address]);
        res.status(201).json({ message: "Users added successfully!" });
    }
    catch (err) {
        return res.status(500).send({
            msg: err.original.sqlMessage,
        });
    }
});
const getCustomerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const getCustomer = yield dbconfig_1.default.query("SELECT * FROM users WHERE id = ?", [
            id,
        ]);
        res.send(getCustomer);
    }
    catch (err) {
        return res.status(500).send({
            msg: err.original.sqlMessage,
        });
    }
});
const updateCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, email, address } = req.body;
        const updateGroceries = yield dbconfig_1.default.query("UPDATE users SET name = ?, email = ?, address = ? WHERE id = ?", [name, email, address, id]);
        res.status(200).json({ message: "Customer Details updated successfully!" });
    }
    catch (err) {
        return res.status(500).send({
            msg: err.original.sqlMessage,
        });
    }
});
const addGroceriesToCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, items } = req.body;
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
        return res
            .status(400)
            .send({ msg: "Bad request. Provide userId and grocery items." });
    }
    const connection = yield dbconfig_1.default.getConnection();
    try {
        yield connection.beginTransaction();
        for (const item of items) {
            const { groceryId, quantity } = item;
            const [grocery] = yield connection.query("SELECT stock FROM groceries WHERE id = ? FOR UPDATE", [groceryId]);
            if (grocery.length == 0) {
                throw new Error(`Grocery item with ID ${groceryId} not found`);
            }
            if (grocery[0].stock < quantity) {
                throw new Error(`Insufficient stock for grocery item with ID ${groceryId}`);
            }
            yield connection.query("INSERT INTO order_items(user_id,grocery_id,quantity) VALUES (?,?,?)", [userId, groceryId, quantity]);
            yield connection.query("UPDATE groceries SET stock = stock-? WHERE id= ?", [quantity, groceryId]);
        }
        yield connection.commit();
        connection.release();
        res.status(201).json({ message: "Items added successfully!" });
    }
    catch (err) {
        yield connection.rollback();
        connection.release();
        return res.status(500).send({
            msg: err.original.sqlMessage,
        });
    }
});
const getOrderDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ msg: "User ID is required" });
    }
    try {
        const [user] = yield dbconfig_1.default.query("SELECT id, name, email, address FROM users WHERE id = ?", [userId]);
        if (user.length === 0) {
            return res.status(404).json({ msg: "User not found" });
        }
        const [orders] = yield dbconfig_1.default.query(`SELECT 
                oi.id AS order_item_id,
                g.name AS grocery_name,
                g.price AS unit_price,
                oi.quantity,
                (g.price * oi.quantity) AS total_price
            FROM order_items oi
            JOIN groceries g ON oi.grocery_id = g.id
            WHERE oi.user_id = ?`, [userId]);
        if (orders.length === 0) {
            return res.status(404).json({ msg: "No orders found for this user" });
        }
        const totalAmount = orders.reduce((sum, item) => sum + item.total_price, 0);
        res.status(200).json({
            user: user[0],
            groceries: orders,
            totalAmount: totalAmount,
            message: `Total amount to be paid: $${totalAmount}`
        });
    }
    catch (err) {
        res.status(500).json({ msg: err.message || "Internal Server Error" });
    }
});
module.exports = { createCustomer, getCustomerById, updateCustomer, addGroceriesToCustomer, getOrderDetails };
