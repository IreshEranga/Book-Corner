import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import AdminPanel from './pages/Dashboard/AdminPanel';
import CustomerDashBoard from './pages/Dashboard/CustomerDashBoard';
import OrderPage from './pages/Components/Customer/OrderPage';

// --- PROTECTED ROUTE COMPONENT ---
// This guarantees React checks for the token exactly when the page loads,
// preventing the bug where you get kicked back to the login screen.
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Auth />} />

        {/* --- PROTECTED ROUTES --- */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <CustomerDashBoard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/order" 
          element={
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          } 
        />

        {/* Catch-All Route (Must be at the very bottom!) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;