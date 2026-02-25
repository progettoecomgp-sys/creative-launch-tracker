import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ToastContainer from './components/Toast';
import { loadDarkMode, saveDarkMode } from './utils/storage';
import { runMigration, ensureConfigExists } from './utils/migration';

// Run migration once on app start
runMigration();
ensureConfigExists();

function App() {
  const [darkMode, setDarkMode] = useState(loadDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    saveDarkMode(darkMode);
  }, [darkMode]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Dashboard darkMode={darkMode} toggleDarkMode={() => setDarkMode(d => !d)} />
      <ToastContainer />
    </div>
  );
}

export default App;
