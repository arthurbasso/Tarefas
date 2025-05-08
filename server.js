const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'arthur.basso@universo.univates.br', 
    pass: 'hcvu bbbg wuls ukld', 
  },
});

db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY,
    nome TEXT,
    email TEXT UNIQUE,
    senha TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS tarefas (
    id INTEGER PRIMARY KEY,
    descricao TEXT,
    data_criacao TEXT,
    data_prevista TEXT,
    data_encerramento TEXT,
    situacao TEXT,
    idUsuario INTEGER,
    FOREIGN KEY(idUsuario) REFERENCES usuarios(id)
)`);

app.post('/register', (req, res) => {
    const { nome, email, senha } = req.body;
    db.run(`INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`, [nome, email, senha], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ id: this.lastID, nome, email });
    });
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    db.get(`SELECT * FROM usuarios WHERE email = ? AND senha = ?`, [email, senha], (err, row) => {
        if (err || !row) return res.status(401).json({ error: 'Credenciais inválidas' });
        res.json({ id: row.id, nome: row.nome, email: row.email });
    });
});

app.get('/tarefas', (req, res) => {
    db.all('SELECT * FROM tarefas', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/tarefas', (req, res) => {
    const { descricao, data_criacao, data_prevista, data_encerramento, situacao, idUsuario } = req.body;
    const sql = `INSERT INTO tarefas (descricao, data_criacao, data_prevista, data_encerramento, situacao, idUsuario)
                VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [descricao, data_criacao, data_prevista, data_encerramento, situacao, idUsuario], function (err) {
      if (err) return res.status(500).json({ error: err.message });
  
      db.get('SELECT * FROM tarefas WHERE id = ?', [this.lastID], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        db.get('SELECT email FROM usuarios WHERE id = ?', [idUsuario], (err, usuario) => {
          if (err) return res.status(500).json({ error: err.message });

          const mailOptions = {
            from: 'arthur.basso@universo.univates.br',
            to: usuario.email,
            subject: 'Tarefa Criada',
            text: `Tarefa criada com sucesso!\n\nDescrição: ${row.descricao}\nData Criada: ${row.data_criacao}\nData Prevista: ${row.data_prevista}\nSituação: ${row.situacao}`,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log('Erro ao enviar e-mail: ', error);
            } else {
              console.log('E-mail enviado: ' + info.response);
            }
          });
        });

        res.status(201).json(row);
      });
    });
});

app.put('/tarefas/:id', (req, res) => {
    const { id } = req.params;
    const { descricao, data_criacao, data_prevista, data_encerramento, situacao } = req.body;
    const sql = `UPDATE tarefas SET descricao = ?, data_criacao = ?, data_prevista = ?, data_encerramento = ?, situacao = ? WHERE id = ?`;
    db.run(sql, [descricao, data_criacao, data_prevista, data_encerramento, situacao, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Enviar e-mail após atualizar a tarefa
        db.get('SELECT email FROM usuarios WHERE id = (SELECT idUsuario FROM tarefas WHERE id = ?)', [id], (err, usuario) => {
          if (err) return res.status(500).json({ error: err.message });

          const mailOptions = {
            from: 'arthur.basso@universo.univates.br',
            to: usuario.email,
            subject: 'Tarefa Atualizada',
            text: `A tarefa foi atualizada com sucesso!\n\nDescrição: ${descricao}\nData de Criação: ${data_criacao}\nData Prevista: ${data_prevista}\nSituação: ${situacao}`,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log('Erro ao enviar e-mail: ', error);
            } else {
              console.log('E-mail enviado: ' + info.response);
            }
          });
        });

        res.json({ message: "Tarefa atualizada com sucesso." });
    });
});

app.delete('/tarefas/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM tarefas WHERE id = ?`, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Tarefa deletada com sucesso." });
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));