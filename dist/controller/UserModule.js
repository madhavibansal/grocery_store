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
class UserModule {
    constructor() {
        this.createCustomer = this.createCustomer.bind(this);
        this.getCustomerById = this.getCustomerById.bind(this);
        this.updateCustomer = this.updateCustomer.bind(this);
    }
    createCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
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
    }
    ;
    getCustomerById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
    }
    ;
    updateCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
    }
    ;
    addGroceriesToCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, items } = req.body;
            const connection = yield dbconfig_1.default.getConnection();
            let totalAmount = 0;
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
                    const itemTotal = grocery[0].price * quantity;
                    totalAmount += itemTotal;
                    yield connection.query("INSERT INTO order_items(user_id,grocery_id,quantity) VALUES (?,?,?)", [userId, groceryId, quantity]);
                    yield connection.query("UPDATE groceries SET stock = stock-? WHERE id= ?", [quantity, groceryId]);
                }
                yield connection.query("INSERT INTO customer_pay (user_id, status, totalAmount) VALUES (?, ?, ?)", [userId, "PENDING", totalAmount]);
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
    }
    ;
    getOrderDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
    }
    ;
    updatePaymentStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, status } = req.body;
            if (!["PENDING", "COMPLETED"].includes(status)) {
                return res.status(400).json({ msg: "Invalid status. Allowed values: PENDING, COMPLETED" });
            }
            const connection = yield dbconfig_1.default.getConnection();
            try {
                const [payment] = yield connection.query("SELECT * FROM customer_pay WHERE user_id = ?", [userId]);
                if (payment.length === 0) {
                    return res.status(404).json({ msg: "No payment record found for this user" });
                }
                yield connection.query("UPDATE customer_pay SET status = ? WHERE user_id = ?", [status, userId]);
                connection.release();
                res.status(200).json({ message: `Payment status updated to ${status}` });
            }
            catch (err) {
                connection.release();
                return res.status(500).json({ msg: err.message || "Internal Server Error" });
            }
        });
    }
}
exports.default = UserModule;
