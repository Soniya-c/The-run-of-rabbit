const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const db = new sqlite3.Database('game.db');  // Replace with your actual DB path

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Example route to fetch game data
app.get('/getGameData', (req, res) => {
    db.all("SELECT * FROM game_table", [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);  // Send the data as JSON to the frontend
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});