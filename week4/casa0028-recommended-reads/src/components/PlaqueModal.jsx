import { useEffect, useState } from "react";
import BookListItem from "./BookListItem";

export default function PlaqueModal({ selectedPlaque, setIsModalOpen }) {
 
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      const author = selectedPlaque?.properties?.lead_subject_name;
      if (!author) {
        setBooks([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?author=${encodeURIComponent(
            author
          )}&limit=5`
        );
        const data = await res.json();
        setBooks(data?.docs ?? []);
      } catch (err) {
        console.error("Error fetching books:", err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [selectedPlaque?.properties?.lead_subject_name]);

  return (
    <div className="fixed inset-0 z-50 grid place-content-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {selectedPlaque?.properties?.lead_subject_name ?? "Unknown"}
          </h2>

          <button className="text-sm underline" 
          onClick={() => setIsModalOpen(false)}>
            Close
          </button>
        </div>

        <div className="mt-4">
          <p className="text-pretty text-gray-700">
            {selectedPlaque?.properties?.inscription ?? ""}
          </p>
        </div>

        <div className="mt-4">
          {loading ? (
            <p>Loading recommended reading...</p>
          ) : books.length === 0 ? (
            <p>No books found.</p>
          ) : (
            books.map((book) => (
              <BookListItem
                key={book.cover_edition_key || book.key || book.title}
                book={book}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}