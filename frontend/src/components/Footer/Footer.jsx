import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
                {/* Thay logo bằng slogan / tên công ty */}
                <h1 className="footer-company-name">AECO - Creative online food ordering website</h1>
                <p>
                    Chúng tôi mang đến trải nghiệm cà phê tuyệt vời nhất, 
                    từ hạt cà phê chất lượng đến dịch vụ giao hàng nhanh chóng và tiện lợi. 
                    Hãy để mỗi tách cà phê của bạn trở thành một khoảnh khắc đáng nhớ!
                </p>
                <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="Facebook" />
                    <img src={assets.twitter_icon} alt="Twitter" />
                    <img src={assets.linkedin_icon} alt="LinkedIn" />
                </div>
            </div>

            <div className="footer-content-center">
                <h2>COMPANY</h2>
                <ul>
                    <li>Home</li>
                    <li>About Us</li>
                    <li>Delivery</li>
                    <li>Privacy Policy</li>
                </ul>
            </div>

            <div className="footer-content-right">
                <h2>GET IN TOUCH</h2>
                <ul>
                    <li>+84 376 808 557</li>
                    <li>vanth.dev@gmail.com</li>
                </ul>
            </div>
        </div>

        <hr />

        <p className="footer-copyright">
            Copyright 2024 © vanth.dev@gmail.com - All Rights Reserved
        </p>
    </div>
  )
}

export default Footer
