import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { BuilderPage } from './pages/BuilderPage';
import { FormPage } from './pages/FormPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/builder" replace />} />
      <Route path="/builder" element={<BuilderPage />} />
      <Route path="/form/:id" element={<FormPage />} />
    </Routes>
  );
}

export default App;
