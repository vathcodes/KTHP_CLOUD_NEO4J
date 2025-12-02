import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import PaymentSuccess from './pages/PaymentSuccess/PaymentSuccess'
import MyOrders from './pages/MyOrders/MyOrders'
import ContactUs from './pages/ContactUs/ContactUs'
import MenuPage from './pages/Menu/MenuPage'
import AppDownload from './pages/AppDowload/AppDowload'

const App = () => {

  const [showLogin,setShowLogin] = useState(false)

  return (
    <>
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/payment-success' element={<PaymentSuccess/>} />
          <Route path='/myorders' element={<MyOrders/>} />
          <Route path='/contact' element={<ContactUs />} /> 
          <Route path='/app' element={<AppDownload />} /> 
          <Route path='/menu' element={<MenuPage />} /> 
        </Routes>
      </div>
      <Footer />

    </>

  )
}

export default App
