import { Route, Routes } from "react-router-dom";
import './App.css'
import Home from './components/Home';

function App() {
  
  return (
    <div className="flex flex-col w-full justify-center items-center px-4 max-w-screen-xl mx-auto">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  )
}

export default App
