import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase, createTables } from "@/lib/db"; // Importing functions

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      const pool = await connectToDatabase();
      if (!pool) throw new Error("Database connection failed");
  
      await createTables(pool); // Ensure tables exist
  
      if (req.method === "GET") {
        const result = await pool.request().query("SELECT * FROM items");
        return res.status(200).json(result.recordset);
      } else if (req.method === "POST") {
        const { name, amount, purchasePrice } = req.body;
  
        if (!name || amount == null || purchasePrice == null) {
          return res.status(400).json({ message: "Missing required fields" });
        }
  
        await pool
          .request()
          .input("name", name)
          .input("amount", amount)
          .input("purchasePrice", purchasePrice)
          .query("INSERT INTO items (name, amount, purchasePrice) VALUES (@name, @amount, @purchasePrice)");
  
        return res.status(201).json({ message: "Item added successfully" });
      } else {
        return res.status(405).json({ message: "Method Not Allowed" });
      }
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Database error", error: error });
    }
  }
  
