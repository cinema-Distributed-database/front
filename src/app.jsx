import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/header"
import Footer from "./components/footer"
import HomePage from "./pages/home"
import MovieDetail from "./pages/movie-detail"
import BookingPage from "./pages/booking"
import NotFoundPage from "./pages/not-found"
import PaymentSuccess from "./pages/payment-success"
import TheatersPage from "./pages/theaters"

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a1426] text-white flex flex-col">
        <Header />
        <main className="flex-grow px-20 mx-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/theaters" element={<TheatersPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}