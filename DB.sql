CREATE DATABASE library;
USE library;

CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    position_id INT
);

CREATE TABLE authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100)
);

CREATE TABLE genres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE book_authors (
    book_id INT,
    author_id INT,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

CREATE TABLE book_genres (
    book_id INT,
    genre_id INT,
    PRIMARY KEY (book_id, genre_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

ALTER TABLE books ADD FOREIGN KEY (position_id) REFERENCES positions(id);
