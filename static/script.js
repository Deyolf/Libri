const API_URL = 'http://localhost:3000/books';

document.addEventListener('DOMContentLoaded', fetchBooks);

const bookForm = document.getElementById('bookForm');
bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const book = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        year: document.getElementById('year').value,
        genre: document.getElementById('genre').value
    };
    await addBook(book);
    bookForm.reset();
    fetchBooks();
});

async function fetchBooks() {
    const response = await fetch(API_URL);
    const books = await response.json();
    const tableBody = document.getElementById('booksTableBody');
    tableBody.innerHTML = '';
    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${book.id}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.year}</td>
                    <td>${book.genre}</td>
                    <td class="actions">
                        <button onclick="deleteBook(${book.id})">Delete</button>
                        <button onclick="editBook(${book.id}, '${book.title}', '${book.author}', ${book.year}, '${book.genre}')">Edit</button>
                    </td>
                `;
        tableBody.appendChild(row);
    });
}

async function addBook(book) {
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
    });
}

async function deleteBook(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchBooks();
}

function editBook(id, title, author, year, genre) {
    document.getElementById('title').value = title;
    document.getElementById('author').value = author;
    document.getElementById('year').value = year;
    document.getElementById('genre').value = genre;

    bookForm.onsubmit = async (e) => {
        e.preventDefault();
        const updatedBook = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            year: document.getElementById('year').value,
            genre: document.getElementById('genre').value
        };
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBook)
        });
        bookForm.reset();
        bookForm.onsubmit = async (e) => {
            e.preventDefault();
            await addBook(updatedBook);
            fetchBooks();
        };
        fetchBooks();
    };
}