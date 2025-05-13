
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { checkAndImportSeedData } from './utils/seedData.ts'

// Check and import seed data on application startup
checkAndImportSeedData()
  .then(() => {
    console.log('Seed data check completed');
  })
  .catch((error) => {
    console.error('Error checking seed data:', error);
  });

createRoot(document.getElementById("root")!).render(<App />);
