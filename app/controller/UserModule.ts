import { Request, Response } from "express";
import db from "../dbconfig";

class UserModule{
  constructor() {
    this.createCustomer = this.createCustomer.bind(this);
    this.getCustomerById = this.getCustomerById.bind(this);
    this.updateCustomer = this.updateCustomer.bind(this);
}
async createCustomer (req:Request, res:Response):Promise<Response | void> {
  try {
    const { name, email, address } = req.body;
    const saveData = await db.query(
      "INSERT INTO users (name, email, address) VALUES (?, ?, ?)",
      [name, email, address]
    );
    res.status(201).json({ message: "Users added successfully!" });
  } catch (err:any) {
    return res.status(500).send({
      msg: err.original.sqlMessage,
    });
  }
};

async getCustomerById(req:Request, res:Response):Promise<Response | void> {
  try {
    const { id } = req.params;
    const getCustomer = await db.query("SELECT * FROM users WHERE id = ?", [
      id,
    ]);
    res.send(getCustomer);
  } catch (err:any) {
    return res.status(500).send({
      msg: err.original.sqlMessage,
    });
  }
};

async updateCustomer(req:Request, res:Response):Promise<Response | void> {
  try {
    const { id } = req.params;
    const { name, email, address } = req.body;
    const updateGroceries = await db.query(
      "UPDATE users SET name = ?, email = ?, address = ? WHERE id = ?",
      [name, email, address, id]
    );
    res.status(200).json({ message: "Customer Details updated successfully!" });
  } catch (err:any) {
    return res.status(500).send({
      msg: err.original.sqlMessage,
    });
  }
};

async addGroceriesToCustomer(req:Request, res:Response):Promise<Response | void> {
  const { userId, items } = req.body;
  const connection = await db.getConnection();
  let totalAmount = 0;
  try {
    await connection.beginTransaction();
    for (const item of items) {
      const { groceryId, quantity } = item;
      const [grocery]:any[] = await connection.query(
        "SELECT stock FROM groceries WHERE id = ? FOR UPDATE",
        [groceryId]
      );
      if (grocery.length == 0) {
        throw new Error(`Grocery item with ID ${groceryId} not found`);
      }
      if (grocery[0].stock < quantity) {
        throw new Error(
          `Insufficient stock for grocery item with ID ${groceryId}`
        );
      }
      const itemTotal = grocery[0].price * quantity;
      totalAmount += itemTotal;
      await connection.query(
        "INSERT INTO order_items(user_id,grocery_id,quantity) VALUES (?,?,?)",
        [userId, groceryId, quantity]
      );
      await connection.query(
        "UPDATE groceries SET stock = stock-? WHERE id= ?",
        [quantity, groceryId]
      );
    }
    await connection.query(
      "INSERT INTO customer_pay (user_id, status, totalAmount) VALUES (?, ?, ?)",
      [userId, "PENDING", totalAmount]
    );
    await connection.commit();
    connection.release();
    res.status(201).json({ message: "Items added successfully!" });
  } catch (err:any) {
    await connection.rollback()
    connection.release()
    return res.status(500).send({
      msg: err.original.sqlMessage,
    });
  }
};

async getOrderDetails(req:Request, res:Response):Promise<Response | void> {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ msg: "User ID is required" });
    }
    try {
        const [user]:any[] = await db.query(
            "SELECT id, name, email, address FROM users WHERE id = ?",
            [userId]
        );
        if (user.length === 0) {
            return res.status(404).json({ msg: "User not found" });
        }
        const [orders]:any = await db.query(
            `SELECT 
                oi.id AS order_item_id,
                g.name AS grocery_name,
                g.price AS unit_price,
                oi.quantity,
                (g.price * oi.quantity) AS total_price
            FROM order_items oi
            JOIN groceries g ON oi.grocery_id = g.id
            WHERE oi.user_id = ?`,
            [userId]
        );
        if (orders.length === 0) {
            return res.status(404).json({ msg: "No orders found for this user" });
        }
        const totalAmount = orders.reduce((sum:number, item:any) => sum + item.total_price, 0);
        res.status(200).json({
            user: user[0],
            groceries: orders,
            totalAmount: totalAmount,
            message: `Total amount to be paid: $${totalAmount}`
        });
    } catch (err:any) {
        res.status(500).json({ msg: err.message || "Internal Server Error" });
    }
};

async updatePaymentStatus(req: Request, res: Response): Promise<Response | void> {
  const { userId, status } = req.body;
  if (!["PENDING", "COMPLETED"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status. Allowed values: PENDING, COMPLETED" });
  }
  const connection = await db.getConnection();
  try {
      const [payment]: any[] = await connection.query(
          "SELECT * FROM customer_pay WHERE user_id = ?",
          [userId]
      );
      if (payment.length === 0) {
          return res.status(404).json({ msg: "No payment record found for this user" });
      }
      await connection.query(
          "UPDATE customer_pay SET status = ? WHERE user_id = ?",
          [status, userId]
      );
      connection.release();
      res.status(200).json({ message: `Payment status updated to ${status}` });
  } catch (err: any) {
      connection.release();
      return res.status(500).json({ msg: err.message || "Internal Server Error" });
  }
}


}

export default UserModule;
