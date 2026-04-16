import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import loginLeft from "../assets/loginleft.jpg";

const ResetPassword = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [email, setEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !newPass || !confirmPass) {
      alert("All fields are required!");
      return;
    }

    if (newPass !== confirmPass) {
      alert("New & Confirm password must match!");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/sign_up/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: "12345",
        },
        body: JSON.stringify({
          email: email,
          newpassword: newPass,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Password Reset Successfully!");
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
          div#sidebar, div#header {
            display: none !important;
          }
          div#content {
            width: 100% !important;
            padding: 0;
            margin: 0;
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
                <span className="login100-form-title">RESET PASSWORD</span>

                {/* Email */}
                <div className="wrap-input100 validate-input">
                  <input
                    className="input100"
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span className="symbol-input100">
                    <i className="fa fa-envelope"></i>
                  </span>
                </div>

                {/* New Password */}
                <div className="wrap-input100 validate-input">
                  <input
                    className="input100"
                    type="password"
                    placeholder="New Password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                  <span className="symbol-input100">
                    <i className="fa fa-lock"></i>
                  </span>
                </div>

                {/* Confirm Password */}
                <div className="wrap-input100 validate-input">
                  <input
                    className="input100"
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                  />
                  <span className="symbol-input100">
                    <i className="fa fa-lock"></i>
                  </span>
                </div>

                <div className="container-login100-form-btn">
                  <button className="login100-form-btn" type="submit">
                    Reset Password
                  </button>
                </div>

                <div className="text-center p-t-136">
                  <NavLink className="txt2" to="/admin">
                    Back to Login
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

export default ResetPassword;
