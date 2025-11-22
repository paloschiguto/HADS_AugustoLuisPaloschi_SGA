export default function Modal({ isOpen, title, children, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[100vh] flex flex-col my-8">


        {/* HEADER */}
        <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button
            className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* BODY COM SCROLL */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-end gap-3">
        </div>
      </div>
    </div>
  )
}
