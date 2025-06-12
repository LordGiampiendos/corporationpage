import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavbarComponent from './components/NavbarComponent';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import WishListPage from './pages/WishListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import PurchasesPage from './pages/PurchasesPage';
import LoginPage from './pages/LoginPage';
import EmailVerification from './pages/EmailVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LogoutPage from './pages/LogoutPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OtpPage from './pages/OtpPage';
import ProtectedRoute from './routes/ProtectedRoute';
import CheckoutPage from './pages/CheckoutPage';
import PurchaseManagement from './pages/PurchaseManagement';
import SuccessPage from './pages/SuccessPage'
import ErrorPage from './pages/ErrorPage'
import "./App.css";

function App() {
  return (
    <>
      <NavbarComponent />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/purchases" element={<ProtectedRoute><PurchasesPage /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><WishListPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/purchases-management" element={<ProtectedRoute><PurchaseManagement /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<ErrorPage />} />
      </Routes>
    </>
  );
}

export default App;