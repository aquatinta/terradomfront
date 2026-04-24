import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PartnerModalProvider } from "./contexts/PartnerModalContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProtectedRoute, CustomerRoute, PartnerRoute, AdminRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import PartnerDashboard from "./pages/PartnerDashboard";
import AdminPanel from "./pages/AdminPanel";
import ProfilePage from "./pages/ProfilePage";
import MarketplacePage from "./pages/MarketplacePage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import SupplierDashboard from "./pages/SupplierDashboard";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      {/* Customer cabinet (B2C) */}
      <Route path="/dashboard">
        <CustomerRoute>
          <CustomerDashboard />
        </CustomerRoute>
      </Route>
      <Route path="/dashboard/:rest*">
        <CustomerRoute>
          <CustomerDashboard />
        </CustomerRoute>
      </Route>

      {/* Partner / Supplier cabinet (B2B) */}
      <Route path="/partner">
        <PartnerRoute>
          <PartnerDashboard />
        </PartnerRoute>
      </Route>
      <Route path="/partner/:rest*">
        <PartnerRoute>
          <PartnerDashboard />
        </PartnerRoute>
      </Route>

      {/* Admin panel */}
      <Route path="/admin">
        <AdminRoute>
          <AdminPanel />
        </AdminRoute>
      </Route>
      <Route path="/admin/:rest*">
        <AdminRoute>
          <AdminPanel />
        </AdminRoute>
      </Route>

      {/* Profile — accessible to all authenticated users */}
      <Route path="/profile">
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </Route>

      {/* Marketplace — public catalog */}
      <Route path="/marketplace" component={MarketplacePage} />
      <Route path="/marketplace/:id" component={ProductPage} />

      {/* Cart & Checkout — public (guest cart) */}
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout">
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      </Route>

      {/* Customer orders */}
      <Route path="/orders">
        <ProtectedRoute>
          <OrdersPage />
        </ProtectedRoute>
      </Route>

      {/* Supplier cabinet */}
      <Route path="/supplier">
        <ProtectedRoute>
          <SupplierDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/supplier/:rest*">
        <ProtectedRoute>
          <SupplierDashboard />
        </ProtectedRoute>
      </Route>

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <PartnerModalProvider>
                <Router />
              </PartnerModalProvider>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
