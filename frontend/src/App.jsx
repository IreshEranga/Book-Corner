import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Auth from './pages/Auth';

/*customer routes*/
import CustomerDashBoard from './pages/Dashboard/CustomerDashBoard';
// import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/login" element={<Auth />} />
        {/* <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} /> */}
        <Route path="*" element={<Navigate to="/login" />} />

          {/* Customer Routes */}
        <Route path="/dashboard" element={token ? <CustomerDashBoard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;