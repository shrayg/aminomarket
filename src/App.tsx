import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AgeVerification } from './components/AgeVerification'
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { Product } from './pages/Product'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Account } from './pages/Account'
import { Contact } from './pages/Contact'
import { About } from './pages/About'
import { COA } from './pages/COA'
import { Affiliates } from './pages/Affiliates'
import { PreSale } from './pages/PreSale'
import { OrderSuccess } from './pages/OrderSuccess'
import { TrackOrder } from './pages/TrackOrder'
import { ForgotPassword } from './pages/ForgotPassword'
import { Privacy } from './pages/Privacy'
import { Returns } from './pages/Returns'
import { Shipping } from './pages/Shipping'
import { Terms } from './pages/Terms'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<Product />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="account" element={<Account />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
          <Route path="coa" element={<COA />} />
          <Route path="affiliates" element={<Affiliates />} />
          <Route path="pre-sale" element={<PreSale />} />
          <Route path="order/success" element={<OrderSuccess />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="returns" element={<Returns />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="terms" element={<Terms />} />
        </Route>
      </Routes>
      <AgeVerification />
    </>
  )
}

export default App
