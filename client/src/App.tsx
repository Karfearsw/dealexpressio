import { Route, Switch, Redirect } from 'wouter';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute'; // Removed RequireTier
import AppShell from './components/layout/AppShell';
import ErrorBoundary from './components/ErrorBoundary';
// Pages
import LandingPage from './pages/LandingPage';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import Success from './pages/Success';
import Community from './components/layout/Community';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Deals from './pages/Deals';
import DealDetail from './pages/DealDetail';
import Communication from './pages/Communication';
import Analytics from './pages/Analytics';
import Contracts from './pages/Contracts';
import DevTools from './pages/DevTools';
import Settings from './pages/Settings';
import BuyersList from './pages/BuyersList';
import DealCalculator from './pages/DealCalculator';
import NotFound from './pages/NotFound';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/">
        {user ? <Redirect to="/dashboard" /> : <LandingPage />}
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/success" component={Success} />
      <Route path="/community" component={Community} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/contact" component={Contact} />

      {/* Protected Routes */}
      <Route path="/:rest*">
        {() => (
          <ProtectedRoute>
            <AppShell>
              <ErrorBoundary>
                <Switch>
                  <Route path="/dashboard">
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  </Route>
                  <Route path="/leads">
                    <ProtectedRoute>
                      <Leads />
                    </ProtectedRoute>
                  </Route>
                  {/* Fixed Deals Route */}
                  <Route path="/deals">
                    <ProtectedRoute>
                      <Deals />
                    </ProtectedRoute>
                  </Route>
                  {/* Backward compatibility / Detail view */}
                  <Route path="/properties/:id">
                    <ProtectedRoute>
                      <DealDetail />
                    </ProtectedRoute>
                  </Route>
                  <Route path="/communication">
                    <ProtectedRoute requireCommunicationAccess={true}>
                      <Communication />
                    </ProtectedRoute>
                  </Route>

                  {/* Analytics, Contracts, Buyers List - Now Unlocked for Everyone */}
                  <Route path="/analytics">
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  </Route>
                  <Route path="/contracts">
                    <ProtectedRoute>
                      <Contracts />
                    </ProtectedRoute>
                  </Route>
                  <Route path="/buyers">
                    <ProtectedRoute>
                      <BuyersList />
                    </ProtectedRoute>
                  </Route>

                  <Route path="/devtools" component={DevTools} />
                  <Route path="/settings" component={Settings} />
                  <Route path="/calculator">
                    <ProtectedRoute>
                      <DealCalculator />
                    </ProtectedRoute>
                  </Route>

                  {/* Fallback for unknown protected routes */}
                  <Route component={NotFound} />
                </Switch>
              </ErrorBoundary >
            </AppShell >
          </ProtectedRoute >
        )}
      </Route >

      {/* Global 404 */}
      < Route component={NotFound} />
    </Switch >
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
