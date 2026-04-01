import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ComingSoon from './pages/ComingSoon';
import { AuthProvider } from '@/lib/AuthContext';

// ── SITE DISABLED ──────────────────────────────────────────────────────────────
// All routes render the ComingSoon welcome card.
// To re-enable, restore the original AuthenticatedApp and pagesConfig import.
// ──────────────────────────────────────────────────────────────────────────────

const AuthenticatedApp = () => <ComingSoon />;


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App