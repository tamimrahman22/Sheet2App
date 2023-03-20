import Dashboard from "./components/Dashboard"
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />}/>
      </Routes>
    </BrowserRouter>
    // <TextForm/>
  );
}

export default App;
