const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "static")));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'library'
});

db.connect(err => {
    if (err) {
        console.error('Errore di connessione al database:', err);
        process.exit(1);
    }
    console.log('Connesso al database MySQL.');
});

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200);

    const filepath = path.join(__dirname, "Static", "Home.html");
    res.write(fs.readFileSync(filepath, "utf-8"));

    res.end();
});

app.get('/books', (req, res) => {
    const sql = 'SELECT * FROM books';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.get('/books/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM books WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).send('Libro non trovato');
        res.json(results[0]);
    });
});

app.post('/books', (req, res) => {
    const { title, author, year, genre } = req.body;
    const sql = 'INSERT INTO books (title, author, year, genre) VALUES (?, ?, ?, ?)';
    db.query(sql, [title, author, year, genre], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ id: result.insertId, title, author, year, genre });
    });
});

app.put('/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, year, genre } = req.body;
    const sql = 'UPDATE books SET title = ?, author = ?, year = ?, genre = ? WHERE id = ?';
    db.query(sql, [title, author, year, genre, id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).send('Libro non trovato');
        res.json({ id, title, author, year, genre });
    });
});

app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM books WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).send('Libro non trovato');
        res.status(204).send();
    });
});

app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});
