const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const port = 3000;

app.use(bodyParser.json());

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

app.post('/books', async (req, res) => {
    const { title, authors, genres, position } = req.body;

    db.beginTransaction(err => {
        if (err) return res.status(500).send(err);

        const insertBook = `INSERT INTO books (title, position_id) VALUES (?, ?)`;
        db.query(insertBook, [title, position], (err, bookResult) => {
            if (err) {
                db.rollback();
                return res.status(500).send(err);
            }

            const bookId = bookResult.insertId;

            const authorPromises = authors.map(authorId =>
                new Promise((resolve, reject) => {
                    const query = `INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)`;
                    db.query(query, [bookId, authorId], err => (err ? reject(err) : resolve()));
                })
            );

            const genrePromises = genres.map(genreId =>
                new Promise((resolve, reject) => {
                    const query = `INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)`;
                    db.query(query, [bookId, genreId], err => (err ? reject(err) : resolve()));
                })
            );

            Promise.all([...authorPromises, ...genrePromises])
                .then(() => {
                    db.commit();
                    res.status(201).json({ id: bookId, title });
                })
                .catch(err => {
                    db.rollback();
                    res.status(500).send(err);
                });
        });
    });
});

app.get('/books', (req, res) => {
    const { title, author, genre, position } = req.query;
    let sql = `
        SELECT b.id, b.title, p.name AS position,
            GROUP_CONCAT(DISTINCT CONCAT(a.first_name, ' ', a.last_name)) AS authors,
            GROUP_CONCAT(DISTINCT g.name) AS genres
        FROM books b
        LEFT JOIN positions p ON b.position_id = p.id
        LEFT JOIN book_authors ba ON b.id = ba.book_id
        LEFT JOIN authors a ON ba.author_id = a.id
        LEFT JOIN book_genres bg ON b.id = bg.book_id
        LEFT JOIN genres g ON bg.genre_id = g.id
        WHERE 1=1
    `;

    const params = [];
    if (title) {
        sql += ` AND b.title LIKE ?`;
        params.push(`%${title}%`);
    }
    if (author) {
        sql += ` AND CONCAT(a.first_name, ' ', a.last_name) LIKE ?`;
        params.push(`%${author}%`);
    }
    if (genre) {
        sql += ` AND g.name = ?`;
        params.push(genre);
    }
    if (position) {
        sql += ` AND p.name = ?`;
        params.push(position);
    }

    sql += ` GROUP BY b.id`;

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM books WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).send('Libro non trovato');
        res.status(204).send();
    });
});

app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});
