import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "../config/db.js";


// LOGIN
export const loginUser = async (req, res) => {
  const session = getSession();
  const { email, password } = req.body;

  try {
    const result = await session.run(
      `
      MATCH (u:User {email: $email})
      RETURN u
      `,
      { email }
    );

    if (result.records.length === 0) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const user = result.records[0].get("u").properties;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error logging in" });
  } finally {
    await session.close();
  }
};
export const registerUser = async (req, res) => {
  const session = getSession();
  const { name, email, password } = req.body;

  try {
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Password too short" });
    }

    // Check existing email
    const exists = await session.run(
      `
      MATCH (u:User {email: $email}) RETURN u
      `,
      { email }
    );

    if (exists.records.length > 0) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const result = await session.run(
      `
      CREATE (u:User {
        id: $id,
        name: $name,
        email: $email,
        password: $password
      })
      RETURN u
      `,
      { id, name, email, password: hashedPassword }
    );

    const user = result.records[0].get("u").properties;

    res.json({
      success: true,
      users: [{ id: user.id, name: user.name, email: user.email }],
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, users: [] });
  } finally {
    await session.close();
  }
};

export const getUsers = async (req, res) => {
  const session = getSession();

  try {
    const result = await session.run(`
      MATCH (u:User)
      RETURN u
    `);

    const users = result.records.map((r) => {
      const u = r.get("u").properties;
      return { id: u.id, name: u.name, email: u.email };
    });

    res.json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.json({ success: false, users: [] });
  } finally {
    await session.close();
  }
};

export const updateUser = async (req, res) => {
  const session = getSession();
  const { name, email, password } = req.body;
  const userId = req.params.id;

  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $id})
      RETURN u
      `,
      { id: userId }
    );

    if (result.records.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    let hashedPassword = null;
    if (password && password.length >= 8) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updateQuery = `
      MATCH (u:User {id: $id})
      SET 
        u.name = COALESCE($name, u.name),
        u.email = COALESCE($email, u.email),
        u.password = COALESCE($password, u.password)
      RETURN u
    `;

    const updated = await session.run(updateQuery, {
      id: userId,
      name: name || null,
      email: email || null,
      password: hashedPassword || null,
    });

    const user = updated.records[0].get("u").properties;

    res.json({
      success: true,
      users: [{ id: user.id, name: user.name, email: user.email }],
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, users: [] });
  } finally {
    await session.close();
  }
};

export const deleteUser = async (req, res) => {
  const session = getSession();
  const userId = req.params.id;

  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $id})
      DETACH DELETE u
      RETURN COUNT(u) AS deleted
      `,
      { id: userId }
    );

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error deleting user" });
  } finally {
    await session.close();
  }
};

