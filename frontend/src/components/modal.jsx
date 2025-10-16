export default function Modal({ isOpen, title, children, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-textPrimary dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white font-bold text-lg transition-colors"
          >
            &times;
          </button>
        </div>
        <div className="mb-4">{children}</div>
      </div>
    </div>
  )
}
