import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import NewSale from "./pages/NewSale";
import SalesList from "./pages/SalesList";
import Login from "./pages/Login";

function ProtectedRoute({ children }) {

  const isLoggedIn =
    localStorage.getItem("isLoggedIn");

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return children;
}

function Layout({ children }) {

  return (

    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 p-8">

        {children}

      </div>

    </div>

  );
}

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Layout>
                <Customers />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/new-sale"
          element={
            <ProtectedRoute>
              <Layout>
                <NewSale />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales-list"
          element={
            <ProtectedRoute>
              <Layout>
                <SalesList />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;