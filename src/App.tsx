
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";
import Clients from "./pages/Clients";
import Reports from "./pages/Reports";
import Index from "./pages/Index";
import Inspections from "./pages/Inspections";
import TestEmail from "./pages/TestEmail"; // Add import for TestEmail

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="inspections" element={<Inspections />} />
          <Route path="reports" element={<Reports />} />
          <Route path="test-email" element={<TestEmail />} /> {/* Add new route */}
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
