import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import loginLeft from "../assets/loginleft.jpg";

const SignUp = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("All fields required!");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/sign_up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: "12345",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Signup Successful!");
        setName("");
        setEmail("");
        setPassword("");
      } else {
        alert(data.message || "Signup Failed");
      }

    } catch (error) {
      alert("API ERROR: " + error.message);
    }
  };

  return (
    <>
      <style>
        {`
          div#sidebar,
          div#header {
            display: none !important;
          }
          div#content {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        `}
      </style>

      <div className="login-section">
        <div className="limiter">
          <div className="container-login100">
            <div className="wrap-login100">

              <div className="login100-pic js-tilt">
                 <img src={loginLeft} alt="Bageshwar Dham" />
              </div>

              <form className="login100-form validate-form" onSubmit={handleSubmit}>
                <span className="login100-form-title">BAGESHWAR DHAM SIGNUP</span>

                <div className="wrap-input100 validate-input">
                  <input
                    className="input100"
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <span className="symbol-input100">
                    <i className="fa fa-user"></i>
                  </span>
                </div>

                <div className="wrap-input100 validate-input">
                  <input
                    className="input100"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span className="symbol-input100">
                    <i className="fa fa-envelope"></i>
                  </span>
                </div>

                <div className="wrap-input100 validate-input">
                  <input
                    className="input100"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="symbol-input100">
                    <i className="fa fa-lock"></i>
                  </span>
                </div>

                <div className="container-login100-form-btn">
                  <button className="login100-form-btn" type="submit">
                    Sign Up
                  </button>
                </div>

                <div className="text-center p-t-136">
                  <NavLink className="txt2" to="/admin">
                    Already have an account? Login
                  </NavLink>
                </div>

              </form>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
