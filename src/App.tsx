import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import LoginSelection from './pages/LoginSelection';
import InvestorOnboarding from './pages/InvestorOnboarding';
import SignUp from './pages/SignUp';
import Login from './pages/Login';

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login-selection" element={<LoginSelection />} />
            <Route path="/questionnaire" element={<InvestorOnboarding />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
    );
}

export default App;
