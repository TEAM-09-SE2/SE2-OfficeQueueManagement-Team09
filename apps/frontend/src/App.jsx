import { BrowserRouter, Route, Routes } from "react-router-dom";
import DisplayPage from "./components/display/DisplayPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/display" element={<DisplayPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
