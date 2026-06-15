import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const INACTIVITY_LIMIT = 30 * 60 * 1000;

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let timeoutId;

    function logoutByInactivity() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }

    function resetTimer() {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(logoutByInactivity, INACTIVITY_LIMIT);
    }

    const events = ["click", "keydown", "mousemove", "scroll", "touchstart"];
    events.forEach((eventName) => window.addEventListener(eventName, resetTimer));
    resetTimer();

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
    };
  }, [navigate, token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}