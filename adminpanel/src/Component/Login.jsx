import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import loginLeft from "../assets/loginleft.jpg";
//import loginleft from '.././pub'

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const BASE_URL = process.env.REACT_APP_API_BASE_URL  // 🔥 FIXED BACKEND URL

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email === "" || pass === "") {
      alert("Please enter email and password");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/sign_up/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: "12345",
        },
        body: JSON.stringify({ email, password: pass }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Login Successful!");

        // Save user to localStorage if needed
        localStorage.setItem("user", JSON.stringify(result.user));

        navigate("/admin/dashboard"); // Redirect to dashboard
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("API ERROR: " + err.message);
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
                <span className="login100-form-title">BAGESHWAR DHAM LOGIN</span>

                <div className="wrap-input100 validate-input">
                  <input
                    className="input100"
                    type="text"
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
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                  />
                  <span className="symbol-input100">
                    <i className="fa fa-lock"></i>
                  </span>
                </div>
                <div className="text-end p-t-12"> <NavLink className="txt2" to="/admin/resetpassword"> Forget password </NavLink> </div>

                <div className="container-login100-form-btn">
                  <button className="login100-form-btn" type="submit">
                    Login
                  </button>
                </div>

                <div className="text-center p-t-136">
                  <NavLink className="txt2" to="/admin/signup">
                    Create your Account
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

export default Login;
