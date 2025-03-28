import { Request, Response } from "express";
import db from "../dbconfig";

class AdminModule{
async addGroceries(req:Request, res:Response)  {
  try {
    if (!req.body.name || !req.body.stock || !req.body.price) {
      return res.status(400).send({ msg: "bad request" });
    }
    const { name, price, stock } = req.body;
    const saveData = await db.query(
      "INSERT INTO groceries (name, price, stock) VALUES (?, ?, ?)",
      [name, price, stock]
    );
    res.status(201).json({ message: "Grocery item added successfully!" });
  } catch (err:any) {
    return res.status(500).send({
      msg: err.original.sqlMessage,
    });
  }
};

async getGroceries(req:Request, res:Response)  {
  try {
    const [rows] = await db.query("SELECT * FROM groceries");
    res.status(200).json(rows);
  } catch (err:any) {
    return res.status(500).send({
      msg: err.original.sqlMessage,
    });
  }
};

async getGroceryById(req:Request, res:Response) {
  try {
    const { id } = req.params;
    const fetchGroceries = await db.query(
      "SELECT * FROM groceries WHERE id = ?",
      [id]
    );
    res.send(fetchGroceries);
  } catch (err:any) {
    return res.status(500).send({
      msg: err.original.sqlMessage,
    });
  }
};

async updateGroceries(req:Request, res:Response) {
  try {
    const { id } = req.params;
    const { name, price, stock } = req.body;
    const updateGroceries = await db.query(
      "UPDATE groceries SET name = ?, price = ?, stock = ? WHERE id = ?",
      [name, price, stock, id]
    );
    res.status(200).json({ message: "Grocery item updated successfully!" });
  } catch (err:any) {
    return res.status(500).send({
      msg: err.original.sqlMessage,
    });
  }
};

async deleteGroceries(req:Request, res:Response) {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM groceries WHERE id = ?", [id]);
    res.status(200).json({ message: "Grocery item deleted successfully!" });
  } catch (err:any) {
    console.log("err-------->",err)
    return res.status(500).send({
      msg: err.original.sqlMessage,
    });
  }
};
};

export default new AdminModule();
