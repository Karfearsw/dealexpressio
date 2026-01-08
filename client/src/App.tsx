import { Route, Switch, Redirect } from 'wouter';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AppShell from './components/layout/AppShell';
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
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
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
              <Switch>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/leads" component={Leads} />
                <Route path="/properties" component={Properties} />
                <Route path="/properties/:id" component={PropertyDetail} />
                <Route path="/communication" component={Communication} />
                <Route path="/analytics" component={Analytics} />
                <Route path="/contracts" component={Contracts} />
                <Route path="/devtools" component={DevTools} />
                <Route path="/settings" component={Settings} />
                <Route path="/buyers" component={BuyersList} />
                <Route path="/calculator" component={DealCalculator} />

                {/* Fallback for unknown protected routes */}
                <Route component={NotFound} />
              </Switch>
            </AppShell>
          </ProtectedRoute>
        )}
      </Route>

      {/* Global 404 */}
      <Route component={NotFound} />
    </Switch>
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
