export default function BookListItem({ book }) {
  const title = book?.title ?? "Untitled";
  const authors = book?.author_name?.join(", ") ?? "Unknown author";

  const coverKey = book?.cover_edition_key;
  const coverUrl = coverKey
    ? `https://covers.openlibrary.org/b/olid/${coverKey}-M.jpg`
    : null;

  return (
    <div className="flex items-stretch gap-4">
      {coverUrl ? (
        <img
          alt={title}
          src={coverUrl}
          className="w-20 rounded object-cover"
        />
      ) : (
        <div className="w-20 rounded bg-gray-100 grid place-content-center text-xs text-gray-400">
          No cover
        </div>
      )}

      <div>
        <h3 className="font-medium text-gray-900 sm:text-lg">{title}</h3>
        <p className="mt-0.5 text-gray-700">{authors}</p>
      </div>
    </div>
  );
}