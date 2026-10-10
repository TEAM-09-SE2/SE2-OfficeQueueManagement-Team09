import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import KioskPage from "./components/kiosk/KioskPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/kiosk" replace />} />
        <Route path="/kiosk" element={<KioskPage />} />
        {/* later: /display, /counter, /admin */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
