export default function TitleBar({ title, subtitle }) {
  return (
    <header className="bg-white">
      <div className="mx-auto h-16 pt-4 gap-8 px-4 sm:px-6 lg:px-8">
        <h3 className="text-center text-lg font-bold italic">
          {title}
        </h3>

        {subtitle && (
          <p className="text-center text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  )
}