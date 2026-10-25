import { useState } from "react";
import { loginLogo, loginLogoIsOwn } from "../logo";
import { checkLogin } from "../auth";
import "./login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const user = checkLogin(username, password);
    if (user) {
      onLogin(user);
    } else {
      setError("Wrong username or password.");
      setPassword("");
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        {loginLogo && (
          <img
            className={`login-logo ${loginLogoIsOwn ? "" : "on-red"}`}
            src={loginLogo}
            alt="SK Catering logo"
          />
        )}
        <h1>SK CATERING</h1>
        <p className="login-sub">Sign in to start billing</p>

        <label>
          Username
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            autoComplete="username"
            autoFocus
            required
          />
        </label>

        <label>
          Password
          <span className="pw-wrap">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="pw-toggle"
              aria-pressed={show}
              onClick={() => setShow((s) => !s)}
            >
              {show ? "Hide" : "Show"}
            </button>
          </span>
        </label>

        {error && <p className="login-error" role="alert">{error}</p>}

        <button type="submit" className="login-btn">Sign in</button>
      </form>
    </div>
  );
}

export default Login;
