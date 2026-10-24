import "./navbar.css";
import { navbarLogo } from "../logo";

const LINKS = ["Dashboard", "Customers", "Railway", "History"];

function NavBar({ active, onNavigate, user, onLogout }) {
  return (
    <nav className="navbar">
      {navbarLogo && <img src={navbarLogo} alt="AJS Catering logo" className="logo" />}

      <div className="menu">
        {LINKS.map((name) => (
          <button
            key={name}
            className={`menu-item ${active === name ? "active" : ""}`}
            onClick={() => onNavigate(name)}
          >
            {name}
          </button>
        ))}
        {user && <p className="signed-in">Signed in as <strong>{user.name}</strong></p>}
        <button className="menu-item logout" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default NavBar;
