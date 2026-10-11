import { BrowserRouter, Route, Routes } from "react-router-dom";
import CounterPage from "./components/counter/CounterPage";
import CounterSelectPage from "./components/counter/CounterSelectPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/counter" element={<CounterSelectPage />} />
        <Route path="/counter/:id" element={<CounterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
