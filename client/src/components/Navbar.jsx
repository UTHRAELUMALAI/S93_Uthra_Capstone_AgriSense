import { useEffect } from "react";

function Navbar() {
  useEffect(() => {
    const renderGoogleButton = () => {
      if (!window.google) {
        return;
      }

      const button = document.getElementById("google-login-button");

      if (!button) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });

      button.innerHTML = "";

      window.google.accounts.id.renderButton(button, {
        theme: "outline",
        size: "large",
      });
    };

    if (window.google) {
      renderGoogleButton();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          renderGoogleButton();
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, []);

  async function handleGoogleLogin(response) {
    try {
      const result = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        alert(data.message);
        return;
      }

      localStorage.setItem("token", data.token);

      alert("Google login successful!");
    } catch (error) {
      console.error(error);
      alert("Google login failed");
    }
  }

  return (
    <nav>
      <h2>AgriSense</h2>

      <div>
        <a href="#">Home</a>
        <a href="#">Market</a>
        <a href="#">About</a>

        <div id="google-login-button"></div>
      </div>
    </nav>
  );
}

export default Navbar;