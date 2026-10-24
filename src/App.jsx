import { Component, useEffect, useState } from "react";
import NavBar from "./component/nav-bar";
import Customers from "./pages/customers";
import Railway from "./pages/railway";
import History from "./pages/history";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import ConfirmDialog from "./component/confirm-dialog";
import { loadUser, saveUser, clearUser } from "./auth";
import useOrders from "./useOrders";
import "./App.css";

// Shows the real error on screen instead of a blank white page.
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "2rem", color: "#b01e13" }}>
          <h2>Something went wrong on this page</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {String(this.state.error)}
            {"\n\n"}
            {String(this.state.error.stack || "").split("\n").slice(0, 6).join("\n")}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [page, setPage] = useState("Customers");
  const { orders, setOrders, status: syncStatus } = useOrders();
  const [toast, setToast] = useState("");
  const [user, setUser] = useState(loadUser); // null = show the login page
  const [askLogout, setAskLogout] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const addOrder = (data) => {
    const number = orders.length ? Math.max(...orders.map((o) => o.number)) + 1 : 1001;
    const order = { ...data, id: Date.now(), number, createdAt: new Date().toISOString() };
    setOrders((prev) => [order, ...prev]);
    setToast(`Order #${number} saved to History`);
    return order;
  };

  const login = (u) => {
    saveUser(u);
    setUser(u);
    setPage("Customers");
  };

  const logout = () => {
    clearUser();
    setAskLogout(false);
    setUser(null);
  };

  if (!user) return <Login onLogin={login} />;

  let content;
  if (page === "Railway") content = <Railway onSaveOrder={addOrder} />;
  else if (page === "History")
    content = <History orders={orders} setOrders={setOrders} />;
  else if (page === "Dashboard")
    content = <Dashboard orders={orders} onNavigate={setPage} />;
  else content = <Customers onSaveOrder={addOrder} />;

  return (
    <div className="app">
      <NavBar active={page} onNavigate={setPage} user={user} sync={syncStatus} onLogout={() => setAskLogout(true)} />
      <ErrorBoundary key={page}>{content}</ErrorBoundary>
      {toast && <div className="toast" role="status">{toast}</div>}
      {askLogout && (
        <ConfirmDialog
          title="Log out?"
          message="You will need to sign in again to take orders."
          confirmLabel="Log out"
          danger={false}
          onCancel={() => setAskLogout(false)}
          onConfirm={logout}
        />
      )}
    </div>
  );
}

export default App;
