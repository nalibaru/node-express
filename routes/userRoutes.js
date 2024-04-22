const express = require('express');
const router = express.Router();
const pool = require('./../database');
const bcrypt = require('bcrypt'); 
const saltRounds = 10;

router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM usermanagement.userslist');
      res.json(rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  
 

 router.get('/authenticate', async (req, res) => {
    try {
      const { username,password } = req.query;
      const { rows } = await pool.query('SELECT * FROM usermanagement.userslist where username = $1', [username]);
      if (rows.length > 0)
      {
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (match)
        {
          const {password, ...userWithoutPassword}  = user;
          res.json({ message: "Authentication successful",...userWithoutPassword }); 
        }
        else {
          res.json({ message: "Authentication failed" });
        }
      }
      else {
        res.json({ message: "User not found" })
      }
    } catch (err)
    {
      console.log(err.message);
      res.status(500).send('Server error');
    }
  });
  
  const hashPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds);
  };
  
  router.post('/add', async (req, res) => {
    try {
      const { username, password } = req.body;
      const hashedPassword = await hashPassword(password);
      const queryText = 'INSERT INTO usermanagement.userslist(username, password) VALUES ($1, $2) RETURNING *'; 
      const { rows } = await pool.query(queryText, [username, hashedPassword]);
      const user = rows[0];
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  
  router.get('/delete', async (req, res) => {
    try {
      const { username } = req.query;
      const selectQueryText = 'SELECT * FROM usermanagement.userslist WHERE username = $1';
      const selectResult = await pool.query(selectQueryText, [username]);
      if (selectResult.rows.length === 0)
      {
        return res.status(404).json({ message: "User not found" });
      }
      const user = selectResult.rows[0];
      const { password: _, ...userWithoutPassword } = user;
      const deleteQueryText = 'DELETE FROM usermanagement.userslist WHERE username = $1';
      await pool.query(deleteQueryText, [username]); 
  
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  module.exports = router;   