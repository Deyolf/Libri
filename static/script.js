const API_URL = 'http://localhost:3000/books';

        // Load books when the page loads
        document.addEventListener('DOMContentLoaded', fetchBooks);

        // Form submission to add a new book
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

        // Fetch all books from the API
        async function fetchBooks() {
            const response = await fetch(API_URL);
            const books = await response.json();
            const tableBody = document.getElementById('booksTableBody');
            tableBody.innerHTML = ''; // Clear existing rows
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

        // Add a new book
        async function addBook(book) {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(book)
            });
        }

        // Delete a book
        async function deleteBook(id) {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchBooks();
        }

        // Edit a book
        function editBook(id, title, author, year, genre) {
            document.getElementById('title').value = title;
            document.getElementById('author').value = author;
            document.getElementById('year').value = year;
            document.getElementById('genre').value = genre;

            // Update the form submission for editing
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