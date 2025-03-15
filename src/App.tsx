import { AppProvider } from './context/AppContext';
import Dashboard from './components/Dashboard';
import ThreeColumnLayout from './components/Layout/ThreeColumnLayout';
import './brutalist.css';
import './App.css';

function App() {
  return (
    <AppProvider>
      <ThreeColumnLayout>
        <Dashboard />
      </ThreeColumnLayout>
    </AppProvider>
  );
}

export default App;
