const express = require('express');
const router = express.Router();
const pool = require('./../database');
router.post('/api/timetable/add', async (req, res) => {
    try {
      const { subject, day , time } = req.body;
      const queryText = 'INSERT INTO usermanagement.timetable(subject, day , time) VALUES ($1, $2, $3) RETURNING *'; 
      const { rows } = await pool.query(queryText, [subject, day, time]);
      const timedata = rows[0];
      const timedata1 = {...timedata, message: 'Added Successfully' };
      res.json(timedata1);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  
  router.get('/api/timetable/get/all', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM usermanagement.timetable');
      res.json(rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  
  router.get('/api/timetable/getbasedonday', async (req, res) => {
    try {
      const { day } = req.query;
      const { rows } = await pool.query('SELECT * FROM usermanagement.timetable where day= $1', [day]);
      if (rows.length === 0)
      {
        res.json({ message: "No Data Found" })
      }
      res.json(rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  
  
  router.get('/api/timetable/delete', async (req, res) => {
    try {
      const { time_id } = req.query;
      const selectQueryText = 'SELECT * FROM usermanagement.timetable WHERE time_id = $1';
      const selectResult = await pool.query(selectQueryText, [time_id]);
      if (selectResult.rows.length === 0)
      {
        return res.status(404).json({ message: "Data not found" });
      }
      const timetable = selectResult.rows[0];
      const deleteQueryText = 'DELETE FROM usermanagement.timetable WHERE time_id = $1';
      await pool.query(deleteQueryText, [time_id]); // No need to capture result for DELETE operation
  
      res.json(timetable);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  module.exports = router; 