import "./App.css";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Results from "./pages/Results";
import AdvancedSearch from "./pages/AdvancedSearch";
import TextbookDetails from "./pages/TextbookDetails";
import Browse from "./pages/Browse";

function App() {
  // inspired by https://www.jstor.org/
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow relative">
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search/advanced" element={<AdvancedSearch />} />
              <Route path="/search" element={<Results />} />
              <Route path="/details/:id" element={<TextbookDetails />} />
              <Route path="/browse" element={<Browse />} />
            </Routes>
          </Router>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default App;
