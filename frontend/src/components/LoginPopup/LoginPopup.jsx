import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import axios from "axios"

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext)

  const [currState, setCurrState] = useState("Login")
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  })

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prev => ({ ...prev, [name]: value }))
  }

  const onLogin = async (event) => {
    event.preventDefault()
    try {
      let endpoint = currState === "Login" ? "/api/users/login" : "/api/users/register"
      const response = await axios.post(`${url}${endpoint}`, data);

      if (response.data.success) {
        // Nếu login, token có sẵn
        if (currState === "Login") {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        }
        // Nếu register, token chưa có, bạn có thể login tiếp sau khi tạo xong user
        alert(currState === "Login" ? "Login successful" : "Account created! Please login.")
        setShowLogin(false)
      } else {
        alert(response.data.message || "Something went wrong")
      }
    } catch (err) {
      console.error(err)
      alert("Server error. Please try again.")
    }
  }

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="close" />
        </div>

        <div className="login-popup-inputs">
          {currState !== "Login" &&
            <input
              name='name'
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              placeholder='Your name'
              required
            />
          }
          <input
            name='email'
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder='Your email'
            required
          />
          <input
            name='password'
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder='Password'
            required
          />
        </div>

        <button type='submit'>{currState === "Sign Up" ? "Create Account" : "Login"}</button>

        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>

        {currState === "Login"
          ? <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
          : <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
        }
      </form>
    </div>
  )
}

export default LoginPopup
