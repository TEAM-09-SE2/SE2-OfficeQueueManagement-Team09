import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CounterPage from "./components/counter/CounterPage";
import CounterSelectPage from "./components/counter/CounterSelectPage";
import DisplayPage from "./components/display/DisplayPage";
import KioskPage from "./components/kiosk/KioskPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/kiosk" replace />} />
        <Route path="/kiosk" element={<KioskPage />} />
        <Route path="/counter" element={<CounterSelectPage />} />
        <Route path="/counter/:id" element={<CounterPage />} />
        <Route path="/display" element={<DisplayPage />} />
        {/* later: /admin */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
