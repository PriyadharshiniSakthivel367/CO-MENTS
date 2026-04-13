import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import CommentSection from './pages/CommentSection';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<CommentSection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}
