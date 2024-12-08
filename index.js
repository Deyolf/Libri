const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const fs = require('fs')
const path = require('path')

//variabili globali
const app = express();//app x utilizzo modulo express
const hostname = 'localhost';
const port = 3000;//porta per determinare la porta di ascolto del server api
const hostSQL = 'localhost';//definizione hostname per SQL
const userSQL = 'root';//definizione user per sql
const databaseSQL = 'library';//definizione database per SQL
const passwordSQL = '';//definizione password per SQL

//inizializzazione path statici per utilizzo cartelle come siti in locale con path relativi
app.use(express.static(path.join(__dirname, "static")));//inizializzazione cartella static per gestione Homepage
app.use(express.static(path.join(__dirname, "static/Sottopagine")));//inizializzazione cartella sottopagine per gestione manage

app.use(bodyParser.json());//inizializzazione bodyparserer

//parametri connessione mysql
const db = mysql.createConnection({
    host: hostSQL,
    user: userSQL,
    password: passwordSQL,
    database: databaseSQL
});

//connessione SQL
db.connect(err => {
    if (err) {
        console.error('Errore di connessione al database:', err);
        process.exit(1);
    }
    console.log('Connesso al database MySQL.');
});

//caricamento homepage
function loadHomepage(req,res){
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200);
    
    const filepath = path.join(__dirname, "static", "Homepage.html");
    res.write(fs.readFileSync(filepath, "utf-8"));

    res.end();
}

//caricamento manage
function loadManage(req,res){
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200);

    const filepath = path.join(__dirname, "static", "Sottopagine", "manage.html");
    res.write(fs.readFileSync(filepath, "utf-8"));

    res.end();
}

async function addBook(req,res){
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
}

//definizione routes
app.get("/", (req,res) => loadHomepage(req, res));
app.get("/manage", (req, res) => loadManage(req,res));
app.post('/books', async (req, res) => addBook(req,res));



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

app.post('/authors', (req, res) => {
    const { first_name, last_name } = req.body;
    const sql = `INSERT INTO authors (first_name, last_name) VALUES (?, ?)`;
    db.query(sql, [first_name, last_name], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ id: result.insertId, first_name, last_name });
    });
});

app.get('/authors', (req, res) => {
    const sql = `SELECT * FROM authors`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.delete('/authors/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM authors WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).send('Autore non trovato');
        res.status(204).send();
    });
});

app.post('/genres', (req, res) => {
    const { name } = req.body;
    const sql = `INSERT INTO genres (name) VALUES (?)`;
    db.query(sql, [name], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ id: result.insertId, name });
    });
});

app.get('/genres', (req, res) => {
    const sql = `SELECT * FROM genres`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.delete('/genres/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM genres WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).send('Genere non trovato');
        res.status(204).send();
    });
});

app.post('/positions', (req, res) => {
    const { name } = req.body;
    const sql = `INSERT INTO positions (name) VALUES (?)`;
    db.query(sql, [name], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ id: result.insertId, name });
    });
});

app.get('/positions', (req, res) => {
    const sql = `SELECT * FROM positions`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.delete('/positions/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM positions WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).send('Posizione non trovata');
        res.status(204).send();
    });
});

app.listen(port, hostname, () => {
    console.log(`Server in esecuzione su http://${hostname}:${port}`);
});
