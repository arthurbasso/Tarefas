const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(express.json());
app.use(cors());

db.run(`CREATE TABLE IF NOT EXISTS tarefas (id INTEGER PRIMARY KEY, descricao TEXT, data_criacao TEXT, data_prevista TEXT, data_encerramento TEXT, situacao TEXT)`);

app.get('/tarefas', (req, res) => {
    db.all('SELECT * FROM tarefas', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

const PORT = 3000;
const HOST = '0.0.0.0'; 

app.listen(PORT, HOST, () => console.log(`Server running on http://${HOST}:${PORT}`));
