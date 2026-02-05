export default function PlaqueModal({ title, description, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-content-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {title}
          </h2>

          <button
            className="text-sm underline"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-4">
          <p className="text-pretty text-gray-700">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}