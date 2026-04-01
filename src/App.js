
import './App.css';
import {BrowserRouter as Router, Route ,Routes } from "react-router-dom";
import {Auth} from "./pages/auth/index"
import {ExpenseTracker} from "./pages/expense-tracker/index"
import {QuickAdd} from "./pages/quick-add/index"
import {History} from "./pages/history/index"
import {Planner} from "./pages/planner/index"

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" exact element={<Auth />}/>
          <Route path='/expense-tracker' element={<ExpenseTracker />}/>
          <Route path='/quick-add' element={<QuickAdd />}/>
          <Route path='/history' element={<History />}/>
          <Route path='/planner' element={<Planner />}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;