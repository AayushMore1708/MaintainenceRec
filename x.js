const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 4000;

const db = new sqlite3.Database('record.db');
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS record (day2020 NUMBER(12),day2021 NUMBER(12),day2022 NUMBER(12),day2023 NUMBER(12))");
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'MaintainenceRecord.html'));
});

app.post('/add-date', (req, res) => {
  const { day, year, mn } = req.body;

  db.run(`UPDATE record SET day${year} = ? WHERE ROWID = ${mn} `, [day], (err) => {

    if (err) {
      console.error(err.message);
      console.log(`${mn}`);
      res.status(500).send('Error updating record in the database');
    } else {
      console.log(`Record updated in the database. day: ${day},year: ${year}`);
      res.redirect('/');
    }
  });
});


app.get('/st/:year', (req, res) => {
  const year = req.params.year;
  db.all("SELECT * FROM record", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    const data = rows.map(row => row[`day${year}`]);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let tableHTML = '<h1> Record</h1>';
    tableHTML += '<table border="1">';
    tableHTML += '<thead><tr><th>Month</th><th>Day ' + year + '</th></tr></thead>';
    tableHTML += '<tbody>';

    months.forEach((month, index) => {
      tableHTML += '<tr><td>' + month + '</td><td>' + (data[index] || '') + '</td></tr>';
    });

    tableHTML += '</tbody></table>';


    res.send(tableHTML);
  });
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
