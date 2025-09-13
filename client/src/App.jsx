import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import DevicePage from "./components/Device";
import ViewerPage from "./components/ViewPage";

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "8px", background: "#f4f4f4" }}>
        <Link to="/device" style={{ marginRight: "12px" }}>Device</Link>
        <Link to="/viewer">Viewer</Link>
      </nav>
      <Routes>
        <Route path="/device" element={<DevicePage />} />
        <Route path="/viewer" element={<ViewerPage />} />
        <Route path="*" element={<p>Pick a page from nav.</p>} />
      </Routes>
    </BrowserRouter>
  );
}
