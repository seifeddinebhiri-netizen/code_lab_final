import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import LoginSelection from './pages/LoginSelection';
import InvestorOnboarding from './pages/InvestorOnboarding';
import SignUp from './pages/SignUp';
import Login from './pages/Login';

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Flow Routes */}
            <Route path="/login-selection" element={<LoginSelection />} />
            <Route path="/questionnaire" element={<InvestorOnboarding />} />

            {/* Main Application Entry */}
            <Route path="/dashboard/*" element={<Dashboard />} />

            {/* Fallback for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
