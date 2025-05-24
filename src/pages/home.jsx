"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import MovieCard from "../components/movie-card"
import { fetchMovies } from "../lib/api"

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [movies, setMovies] = useState([])
  const [selectedTheater, setSelectedTheater] = useState("")
  const [selectedMovie, setSelectedMovie] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")

  const banners = [
    {
      id: 1,
      image: "/placeholder.svg?height=400&width=1200",
      title: "Rạp xịn - Ghế chill",
      link: "/promotions/1",
    },
    {
      id: 2,
      image: "/placeholder.svg?height=400&width=1200",
      title: "Khuyến mãi đặc biệt",
      link: "/promotions/2",
    },
    {
      id: 3,
      image: "/placeholder.svg?height=400&width=1200",
      title: "Phim mới tháng 5",
      link: "/promotions/3",
    },
  ]

  useEffect(() => {
    const loadMovies = async () => {
      const data = await fetchMovies()
      setMovies(data)
    }

    loadMovies()

    // Auto slide for banner
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const handleBookTicket = () => {
    if (selectedTheater && selectedMovie && selectedDate && selectedTime) {
      window.location.href = `/booking?theater=${selectedTheater}&movie=${selectedMovie}&date=${selectedDate}&time=${selectedTime}`
    } else {
      alert("Vui lòng chọn đầy đủ thông tin để đặt vé")
    }
  }

  return (
    <div className="bg-[#0a1426] text-white">
      {/* Banner Carousel */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="w-full flex-shrink-0">
              <Link to={banner.link}>
                <div className="relative">
                  <img src={banner.image || "/placeholder.svg"} alt={banner.title} className="w-full object-cover" />
                  <div className="absolute bottom-8 right-8">
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">ĐẶT VÉ NGAY</Button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Quick Booking */}
      <div className="container mx-auto my-8 px-4">
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="text-xl font-bold text-yellow-500 whitespace-nowrap">ĐẶT VÉ NHANH</div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow">
              <Select value={selectedTheater} onValueChange={setSelectedTheater}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="1. Chọn Rạp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cinestar-quang-trung">Cinestar Quang Trung</SelectItem>
                  <SelectItem value="cinestar-hai-ba-trung">Cinestar Hai Bà Trưng</SelectItem>
                  <SelectItem value="cinestar-satra-q6">Cinestar Satra Q6</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedMovie} onValueChange={setSelectedMovie}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="2. Chọn Phim" />
                </SelectTrigger>
                <SelectContent>
                  {movies.map((movie) => (
                    <SelectItem key={movie.id} value={movie.id}>
                      {movie.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="3. Chọn Ngày" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-05-16">Hôm nay (16/05)</SelectItem>
                  <SelectItem value="2024-05-17">Ngày mai (17/05)</SelectItem>
                  <SelectItem value="2024-05-18">18/05/2024</SelectItem>
                  <SelectItem value="2024-05-19">19/05/2024</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="4. Chọn Suất" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10:00">10:00</SelectItem>
                  <SelectItem value="12:30">12:30</SelectItem>
                  <SelectItem value="15:00">15:00</SelectItem>
                  <SelectItem value="17:30">17:30</SelectItem>
                  <SelectItem value="20:00">20:00</SelectItem>
                  <SelectItem value="22:30">22:30</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold whitespace-nowrap"
              onClick={handleBookTicket}
            >
              ĐẶT NGAY
            </Button>
          </div>
        </div>
      </div>

      {/* Now Showing */}
      <div className="container mx-auto my-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">PHIM ĐANG CHIẾU</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>

      {/* Coming Soon */}
      <div className="container mx-auto my-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">PHIM SẮP CHIẾU</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.slice(0, 4).map((movie) => (
            <MovieCard key={`coming-${movie.id}`} movie={{ ...movie, isComingSoon: true }} />
          ))}
        </div>
      </div>

      {/* Promotions */}
      <div className="container mx-auto my-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">KHUYẾN MÃI</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((promo) => (
            <div key={promo} className="bg-gray-900 rounded-lg overflow-hidden">
              <img
                src={`/placeholder.svg?height=200&width=400&text=Khuyến mãi ${promo}`}
                alt={`Khuyến mãi ${promo}`}
                className="w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">Khuyến mãi đặc biệt {promo}</h3>
                <p className="text-sm text-gray-400 mb-4">Mô tả ngắn về chương trình khuyến mãi đặc biệt.</p>
                <Link to={`/promotions/${promo}`}>
                  <Button variant="outline">Xem chi tiết</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}