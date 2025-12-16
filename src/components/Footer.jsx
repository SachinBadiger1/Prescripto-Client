import React from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";


const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* ------------ Left Section ------------ */}
        <div>
          <img className="mb-5 w-80" src={assets.logo} alt="" />
          
        </div>

        {/* ------------ Center Section ------------ */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <NavLink to="/">
              <li>Home</li>
            </NavLink>
            <NavLink to="/about">
            <li>About us</li>
            </NavLink>
            <NavLink to="/contact">
            <li>Contact us</li>
            </NavLink>
            
          </ul>
        </div>

        {/* ------------ Right Section ------------ */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>0836-2747758</li>
            <li>unityhealth@gmail.com</li>
          </ul>
        </div>
      </div>

      <hr />
        
    </div>
  );
};

export default Footer;
