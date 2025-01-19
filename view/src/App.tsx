import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OrderManagement from "./components/OrderManagement";
import './App.css'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<OrderManagement />} />
      </Routes>
    </Router>
  );
}

export default App
