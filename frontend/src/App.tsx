import './App.css';

function App() {
  return (
    <>
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="bg-white p-8 rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Tailwind Test Card</h2>
          <p className="text-gray-600">This is a simple card to test Tailwind CSS styling and hover effects.</p>
        </div>
      </div>
    </>
  );
}

export default App;
