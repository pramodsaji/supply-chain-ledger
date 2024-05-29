// Importing necessary libraries and components
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { AdminDashboard } from "./components/AdminDashboard";
import { ViewProducts } from "./components/ViewProducts";
import { EthereumAuthentication } from "./components/EthereumAuthentication";

function App() {
  // Render the EthereumAuthentication component
  return (
    <>
      <EthereumAuthentication />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/admin" element={<AdminDashboard />}></Route>
        <Route path="/view" element={<ViewProducts />}></Route>
      </Routes>
    </>
  );
}

export default App;
