import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import Header from './components/Header'
import CartDrawer from './components/CartDrawer'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Returns from './pages/Returns'
import Marketplace from './pages/Marketplace'
import Wallet from './pages/Wallet'
import Orders from './pages/Orders'
import Wishlist from './pages/Wishlist'
import ReturnRiskChecker from './components/ReturnRiskChecker'
import ChatBot from './components/ChatBot'
import QuickList from './pages/QuickList'

export default function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen bg-amz-bg">
          <Header />
          <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/risk-check" element={<ReturnRiskChecker />} />
                <Route path="/list" element={<QuickList />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <CartDrawer />
          <ChatBot />
        </div>
      </WishlistProvider>
    </CartProvider>
  )
}
