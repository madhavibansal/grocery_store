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
const addGroceries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.name || !req.body.stock || !req.body.price) {
            return res.status(400).send({ msg: "bad request" });
        }
        const { name, price, stock } = req.body;
        const saveData = yield dbconfig_1.default.query("INSERT INTO groceries (name, price, stock) VALUES (?, ?, ?)", [name, price, stock]);
        res.status(201).json({ message: "Grocery item added successfully!" });
    }
    catch (err) {
        return res.status(500).send({
            msg: err.original.sqlMessage,
        });
    }
});
const getGroceries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield dbconfig_1.default.query("SELECT * FROM groceries");
        res.status(200).json(rows);
    }
    catch (err) {
        return res.status(500).send({
            msg: err.original.sqlMessage,
        });
    }
});
const getGroceryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const fetchGroceries = yield dbconfig_1.default.query("SELECT * FROM groceries WHERE id = ?", [id]);
        res.send(fetchGroceries);
    }
    catch (err) {
        return res.status(500).send({
            msg: err.original.sqlMessage,
        });
    }
});
const updateGroceries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, price, stock } = req.body;
        const updateGroceries = yield dbconfig_1.default.query("UPDATE groceries SET name = ?, price = ?, stock = ? WHERE id = ?", [name, price, stock, id]);
        res.status(200).json({ message: "Grocery item updated successfully!" });
    }
    catch (err) {
        return res.status(500).send({
            msg: err.original.sqlMessage,
        });
    }
});
const deleteGroceries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield dbconfig_1.default.query("DELETE FROM groceries WHERE id = ?", [id]);
        res.status(200).json({ message: "Grocery item deleted successfully!" });
    }
    catch (err) {
        return res.status(500).send({
            msg: err.original.sqlMessage,
        });
    }
});
module.exports = {
    addGroceries,
    getGroceries,
    getGroceryById,
    updateGroceries,
    deleteGroceries,
};
