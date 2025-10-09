export default function Header() {
  return (
    <header className="bg-primary text-white flex justify-between items-center px-6 h-16">
      <h1 className="text-xl font-bold">SGA</h1>
      <button className="bg-secondary hover:bg-blue-600 px-4 py-2 rounded transition">
        Sair
      </button>
    </header>
  )
}
