import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Services from "./pages/Services";
import FamilyTree from "./pages/FamilyTree";
import Ambulance from "./pages/services/Ambulance";
import Scholarship from "./pages/services/Scholarship";
import Materialistic from "./pages/services/Materialistic";
import Others from "./pages/services/Others";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const logged = localStorage.getItem("loggedIn");
    setIsLoggedIn(logged === "true");
  }, []);
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/home" /> : <Login />}
        />
        <Route path="/home" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/family-tree" element={<FamilyTree />} />
        <Route path="/services/ambulance" element={<Ambulance />} />
        <Route path="/services/scholarship" element={<Scholarship />} />
        <Route path="/services/materialistic" element={<Materialistic />} />
        <Route path="/services/others" element={<Others />} />
      </Routes>
    </Router>
  );
}

export default App;
