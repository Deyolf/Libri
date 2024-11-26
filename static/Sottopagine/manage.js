document.addEventListener('DOMContentLoaded', () => {
    fetchAuthors();
    fetchGenres();
    fetchPositions();
    fetchBooks();

    document.getElementById('authorForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('authorFirstName').value;
        const lastName = document.getElementById('authorLastName').value;

        if (firstName != '' && lastName != '')
            await fetch('/authors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ first_name: firstName, last_name: lastName })
            });
        fetchAuthors();
        document.getElementById('authorForm').reset();
    });

    document.getElementById('genreForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('genreName').value;

        if (name != '')
            await fetch('/genres', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

        fetchGenres();
        document.getElementById('genreForm').reset();
    });

    document.getElementById('positionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('positionName').value;

        if (name != '')
            await fetch('/positions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

        fetchPositions();
        document.getElementById('positionForm').reset();
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
    const authorList = document.getElementById('authorList');
    const bookAuthorsSelect = document.getElementById('bookAuthors');

    authorList.innerHTML = '';
    bookAuthorsSelect.innerHTML = '';

    authors.forEach(author => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = `${author.first_name} ${author.last_name}`;
        authorList.appendChild(listItem);

        const option = document.createElement('option');
        option.value = author.id;
        option.textContent = `${author.first_name} ${author.last_name}`;
        bookAuthorsSelect.appendChild(option);
    });
}

async function fetchGenres() {
    const response = await fetch('/genres');
    const genres = await response.json();
    const genreList = document.getElementById('genreList');
    const bookGenresSelect = document.getElementById('bookGenres');

    genreList.innerHTML = '';
    bookGenresSelect.innerHTML = '';

    genres.forEach(genre => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = genre.name;
        genreList.appendChild(listItem);

        const option = document.createElement('option');
        option.value = genre.id;
        option.textContent = genre.name;
        bookGenresSelect.appendChild(option);
    });
}

async function fetchPositions() {
    const response = await fetch('/positions');
    const positions = await response.json();
    const positionList = document.getElementById('positionList');
    const bookPositionSelect = document.getElementById('bookPosition');

    positionList.innerHTML = '';
    bookPositionSelect.innerHTML = '';

    positions.forEach(position => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = position.name;
        positionList.appendChild(listItem);

        const option = document.createElement('option');
        option.value = position.id;
        option.textContent = position.name;
        bookPositionSelect.appendChild(option);
    });
}

async function fetchBooks() {
    const response = await fetch('/books');
    const books = await response.json();
    const bookList = document.getElementById('bookList');

    bookList.innerHTML = '';

    books.forEach(book => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.innerHTML = `
            <strong>${book.title}</strong><br>
            Authors: ${book.authors.map(author => `${author.first_name} ${author.last_name}`).join(', ')}<br>
            Genres: ${book.genres.map(genre => genre.name).join(', ')}<br>
            Position: ${book.position.name}
        `;
        bookList.appendChild(listItem);
    });
}
