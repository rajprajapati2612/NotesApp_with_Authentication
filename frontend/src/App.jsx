import React from 'react'
import Signup from './pages/Signup'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home.jsx'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOTP from './pages/VerifyOTP.jsx'
import ChangePassword from './pages/ChangePassword'
import Verify from './pages/Verify'


const App = () => {
  return (
    <div>
      <Routes>
        <Route  path="/signup"  element = {<Signup/>}/>
        <Route  path="/login" element = {<Login/>}/>
        <Route  path='/home' element={<Home/>}/>
        <Route  path='/verify' element={<VerifyEmail/>}/>
        <Route  path='/verify/:token' element={<Verify/>}/>
        <Route  path='/forgot-password' element={<ForgotPassword/>}/>
        <Route  path='/verify-otp/:email' element={<VerifyOTP/>}/>
        <Route path='/change-password/:email'  element={<ChangePassword/>}></Route>
        
      </Routes>
     
    </div>
  )
}

export default App
