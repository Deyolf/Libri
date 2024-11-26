document.addEventListener('DOMContentLoaded', () => {
    fetchAuthors();
    fetchGenres();
    fetchPositions();
    fetchBooks();

    document.getElementById('authorForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('authorFirstName').value;
        const lastName = document.getElementById('authorLastName').value;
        await fetch('/authors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ first_name: firstName, last_name: lastName })
        });
        fetchAuthors();
    });

    document.getElementById('genreForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('genreName').value;
        await fetch('/genres', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        fetchGenres();
    });

    document.getElementById('positionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('positionName').value;
        await fetch('/positions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        fetchPositions();
    });

    document.getElementById('bookForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('bookTitle').value;
        const authors = Array.from(document.getElementById('bookAuthors').selectedOptions).map(opt => opt.value);
        const genres = Array.from(document.getElementById('bookGenres').selectedOptions).map(opt => opt.value);
        const position = document.getElementById('bookPosition').value;

        await fetch('/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                authors: authors,
                genres: genres,
                position: position
            })
        });

        fetchBooks();
        document.getElementById('bookForm').reset();
    });
});

async function fetchAuthors() {
    const response = await fetch('/authors');
    const authors = await response.json();
    const list = document.getElementById('authorList');
    list.innerHTML = authors.map(author => `
<li class="list-group-item">
    ${author.first_name} ${author.last_name}
    <button class="btn btn-danger btn-sm float-end" onclick="deleteAuthor(${author.id})">Delete</button>
</li>
`).join('');
}

async function fetchGenres() {
    const response = await fetch('/genres');
    const genres = await response.json();
    const list = document.getElementById('genreList');
    list.innerHTML = genres.map(genre => `
<li class="list-group-item">
    ${genre.name}
    <button class="btn btn-danger btn-sm float-end" onclick="deleteGenre(${genre.id})">Delete</button>
</li>
`).join('');
}

async function fetchPositions() {
    const response = await fetch('/positions');
    const positions = await response.json();
    const list = document.getElementById('positionList');
    list.innerHTML = positions.map(position => `
<li class="list-group-item">
    ${position.name}
    <button class="btn btn-danger btn-sm float-end" onclick="deletePosition(${position.id})">Delete</button>
</li>
`).join('');
}

async function fetchBooks() {
    const response = await fetch('/books');
    const books = await response.json();
    const tableBody = document.getElementById('booksTableBody');
    tableBody.innerHTML = books.map(book => `
                <tr>
                    <td>${book.id}</td>
                    <td>${book.title}</td>
                    <td>${book.authors}</td>
                    <td>${book.genres}</td>
                    <td>${book.position}</td>
                </tr>
            `).join('');
}