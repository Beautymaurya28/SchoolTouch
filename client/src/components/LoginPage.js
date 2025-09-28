// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import FirstAdminSignup from "./FirstAdminSignup";
// import "./LoginPage.css";
// import schoolImage from "../assets/school-building.jpg";
// import { FaTrophy, FaDesktop, FaLeaf, FaEye, FaEyeSlash } from "react-icons/fa";

// export default function LoginPage() {
//   const [isFirstAdminCreated, setIsFirstAdminCreated] = useState(true);
//   const [isLoading, setIsLoading] = useState(true);
//   const [role, setRole] = useState("admin");
//   const [identifier, setIdentifier] = useState(""); // email / studentCode
//   const [password, setPassword] = useState("");
//   const [phone, setPhone] = useState(""); // parent login
//   const [otp, setOtp] = useState(""); // parent login
//   const [step, setStep] = useState("login"); // login | otp
//   const [showPassword, setShowPassword] = useState(false);
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const API_BASE = "http://localhost:5000/api";

//   useEffect(() => {
//     const checkFirstAdmin = async () => {
//       try {
//         const res = await axios.get(`${API_BASE}/public/check-admin-status`);
//         setIsFirstAdminCreated(res.data.isFirstAdminCreated);
//         setIsLoading(false);
//       } catch (err) {
//         setIsLoading(false);
//       }
//     };
//     checkFirstAdmin();
//   }, []);

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }
//   if (!isFirstAdminCreated) {
//     return <FirstAdminSignup />;
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // PARENT OTP LOGIN
//     if (role === "parent") {
//       try {
//         if (step === "login") {
//           if (!phone) return setMessage("📱 Enter phone number");
//           await axios.post(`${API_BASE}/auth/login/parent/request-otp`, { phone });
//           setStep("otp");
//           setMessage("📲 OTP sent to your phone");
//           return;
//         }
//         if (step === "otp") {
//           if (!otp) return setMessage("🔢 Enter OTP");
//           const res = await axios.post(`${API_BASE}/auth/login/parent/verify-otp`, { phone, otp });
//           localStorage.setItem("token", res.data.token);
//           localStorage.setItem("role", "parent");
//           localStorage.setItem("profileId", res.data.profileId);
//           setMessage("✅ Login successful!");
//           navigate("/parent/dashboard");
//           return;
//         }
//       } catch (err) {
//         console.error(err);
//         setMessage(err.response?.data?.message || "❌ OTP login failed");
//       }
//       return;
//     }

//     // OTHER ROLES LOGIN
//     try {
//       const payload =
//         role === "student"
//           ? { studentCode: identifier, password, role }
//           : { email: identifier, password, role };
//       const res = await axios.post(`${API_BASE}/auth/login`, payload);
//       const userRole = res.data.role;
//       setMessage(`✅ Login Successful: ${userRole}`);
//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("role", userRole);
//       localStorage.setItem("profileId", res.data.profileId);
//       if (userRole === "admin") navigate("/admin/dashboard");
//       else if (userRole === "teacher") navigate("/teacher/dashboard");
//       else if (userRole === "parent") navigate("/parent/dashboard");
//       else if (userRole === "student") navigate("/student/dashboard");
//       else navigate("/");
//     } catch (err) {
//       console.error(err);
//       setMessage(err.response?.data?.message || "❌ Invalid credentials");
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="left-side">
//         <img src={schoolImage} alt="School" className="bg-image" />
//         <div className="overlay-text">
//           <div className="top-text">
//             <h1>SchoolTouch</h1>
//             <p>Empowering Parents & Students</p>
//           </div>
//           <div className="middle-text">
//             <FaTrophy className="icon" />
//             <h2>100% Results</h2>
//             <p>Consistent academic excellence</p>
//           </div>
//           <div className="bottom-text">
//             <FaDesktop className="icon" />
//             <h2>Digital Classrooms</h2>
//             <p>Modern learning environment</p>
//             <FaLeaf className="icon" />
//             <h2>Top Placements</h2>
//           </div>
//         </div>
//       </div>
//       <div className="right-side">
//         <form className="login-form" onSubmit={handleSubmit}>
//           <h2>Login to Your Account</h2>
//           <label>Select Role</label>
//           <select value={role} onChange={(e) => setRole(e.target.value)}>
//             <option value="admin">Admin</option>
//             <option value="teacher">Teacher</option>
//             <option value="parent">Parent</option>
//             <option value="student">Student</option>
//           </select>
//           {role === "parent" && (
//             <>
//               <label>Phone Number</label>
//               <input
//                 type="tel"
//                 placeholder="Enter phone number with country code"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 required
//               />
//               {step === "otp" && (
//                 <>
//                   <label>Enter OTP</label>
//                   <input
//                     type="text"
//                     placeholder="6-digit OTP"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                     required
//                   />
//                 </>
//               )}
//             </>
//           )}
//           {role !== "parent" && (
//             <>
//               <label>{role === "student" ? "Student Code" : "Email"}</label>
//               <input
//                 type={role === "student" ? "number" : "email"}
//                 placeholder={role === "student" ? "Enter Student Code" : "Enter Email"}
//                 value={identifier}
//                 onChange={(e) => setIdentifier(e.target.value)}
//                 required
//               />
//               <label>Password</label>
//               <div className="password-wrapper">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Enter Password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//                 <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </span>
//               </div>
//             </>
//           )}
//           <button type="submit" className="login-btn">
//             {role === "parent" && step === "otp" ? "Verify OTP" : "Login to SchoolTouch"}
//           </button>
//           <div className="languages">english | hindi | maghai</div>
//           {message && <p className="message">{message}</p>}
//         </form>
//       </div>
//     </div>
//   );
// }











import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FirstAdminSignup from "./FirstAdminSignup";
import "./LoginPage.css";
import schoolImage from "../assets/school-building.jpg";
import { FaTrophy, FaDesktop, FaLeaf, FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const [isFirstAdminCreated, setIsFirstAdminCreated] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState("admin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    const checkFirstAdmin = async () => {
      try {
        const res = await axios.get(`${API_BASE}/public/check-admin-status`);
        setIsFirstAdminCreated(res.data.isFirstAdminCreated);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };
    checkFirstAdmin();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isFirstAdminCreated) {
    return <FirstAdminSignup />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // PARENT OTP LOGIN
    if (role === "parent") {
      try {
        if (step === "login") {
          if (!phone) return setMessage("📱 Enter phone number");
          await axios.post(`${API_BASE}/auth/login/parent/request-otp`, { phone });
          setStep("otp");
          setMessage("📲 OTP sent to your phone");
          return;
        }
        if (step === "otp") {
          if (!otp) return setMessage("🔢 Enter OTP");
          const res = await axios.post(`${API_BASE}/auth/login/parent/verify-otp`, { phone, otp });
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("role", "parent");
          localStorage.setItem("profileId", res.data.profileId);
          setMessage("✅ Login successful!");
          navigate("/parent/dashboard");
          return;
        }
      } catch (err) {
        console.error(err);
        setMessage(err.response?.data?.message || "❌ OTP login failed");
      }
      return;
    }

    // OTHER ROLES LOGIN
    try {
      const payload =
        role === "student"
          ? { studentCode: identifier, password, role }
          : { email: identifier, password, role };
      const res = await axios.post(`${API_BASE}/auth/login`, payload);
      const userRole = res.data.role;
      setMessage(`✅ Login Successful: ${userRole}`);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", userRole);
      localStorage.setItem("profileId", res.data.profileId);
      if (userRole === "admin") navigate("/admin/dashboard");
      else if (userRole === "teacher") navigate("/teacher/dashboard");
      else if (userRole === "parent") navigate("/parent/dashboard");
      else if (userRole === "student") navigate("/student/dashboard");
      else navigate("/");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="left-side">
        <img src={schoolImage} alt="School" className="bg-image" />
        <div className="overlay-text">
          <div className="top-text">
            <h1>SchoolTouch</h1>
            <p>Empowering Parents & Students</p>
          </div>
          <div className="middle-text">
            <FaTrophy className="icon" />
            <h2>100% Results</h2>
            <p>Consistent academic excellence</p>
          </div>
          <div className="bottom-text">
            <FaDesktop className="icon" />
            <h2>Digital Classrooms</h2>
            <p>Modern learning environment</p>
            <FaLeaf className="icon" />
            <h2>Top Placements</h2>
          </div>
        </div>
      </div>
      <div className="right-side">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Login to Your Account</h2>
          <label>Select Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
            <option value="student">Student</option>
          </select>
          {role === "parent" && (
            <>
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="Enter phone number with country code"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              {step === "otp" && (
                <>
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </>
              )}
            </>
          )}
          {role !== "parent" && (
            <>
              <label>{role === "student" ? "Student Code" : "Email"}</label>
              <input
                type={role === "student" ? "number" : "email"}
                placeholder={role === "student" ? "Enter Student Code" : "Enter Email"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </>
          )}
          <button type="submit" className="login-btn">
            {role === "parent" && step === "otp" ? "Verify OTP" : "Login to SchoolTouch"}
          </button>
          <div className="languages">english | hindi | maghai</div>
          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  );
}