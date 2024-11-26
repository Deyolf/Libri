document.addEventListener('DOMContentLoaded', () => {
    const booksTableBody = document.getElementById('booksTableBody');
    const searchTitleInput = document.getElementById('searchTitle');
    const searchAuthorInput = document.getElementById('searchAuthor');
    const filterGenreSelect = document.getElementById('filterGenre');
    const filterPositionSelect = document.getElementById('filterPosition');

    async function fetchBooks() {
        const response = await fetch('/books');
        const books = await response.json();
        displayBooks(books);
    }

    function displayBooks(books) {
        booksTableBody.innerHTML = '';
        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.authors.map(author => `${author.first_name} ${author.last_name}`).join(', ')}</td>
                <td>${book.genres.map(genre => genre.name).join(', ')}</td>
                <td>${book.position.name}</td>
            `;
            booksTableBody.appendChild(row);
        });
    }

    async function fetchGenres() {
        const response = await fetch('/genres');
        const genres = await response.json();
        filterGenreSelect.innerHTML = '<option value="">Filter by Genre</option>';
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            filterGenreSelect.appendChild(option);
        });
    }

    async function fetchPositions() {
        const response = await fetch('/positions');
        const positions = await response.json();
        filterPositionSelect.innerHTML = '<option value="">Filter by Position</option>';
        positions.forEach(position => {
            const option = document.createElement('option');
            option.value = position.id;
            option.textContent = position.name;
            filterPositionSelect.appendChild(option);
        });
    }

    async function filterBooks() {
        const title = searchTitleInput.value.toLowerCase();
        const author = searchAuthorInput.value.toLowerCase();
        const genre = filterGenreSelect.value;
        const position = filterPositionSelect.value;

        const response = await fetch('/books');
        const books = await response.json();

        const filteredBooks = books.filter(book => {
            const matchesTitle = book.title.toLowerCase().includes(title);
            const matchesAuthor = book.authors.some(authorObj =>
                `${authorObj.first_name} ${authorObj.last_name}`.toLowerCase().includes(author)
            );
            const matchesGenre = genre ? book.genres.some(genreObj => genreObj.id == genre) : true;
            const matchesPosition = position ? book.position.id == position : true;

            return matchesTitle && matchesAuthor && matchesGenre && matchesPosition;
        });

        displayBooks(filteredBooks);
    }

    searchTitleInput.addEventListener('input', filterBooks);
    searchAuthorInput.addEventListener('input', filterBooks);

    filterGenreSelect.addEventListener('change', filterBooks);
    filterPositionSelect.addEventListener('change', filterBooks);

    fetchBooks();
    fetchGenres();
    fetchPositions();
});
