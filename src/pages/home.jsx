"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import MovieCard from "../components/movie-card"
import { fetchMovies, fetchTheaters, fetchShowtimes } from "../lib/api"

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [movies, setMovies] = useState([])
  const [theaters, setTheaters] = useState([])
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(true)
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
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load movies và theaters song song
        const [moviesData, theatersData] = await Promise.all([
          fetchMovies(),
          fetchTheaters()
        ])
        
        setMovies(moviesData || [])
        setTheaters(theatersData || [])
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0]
        setSelectedDate(today)
        
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Auto slide for banner
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Load showtimes when filters change
  useEffect(() => {
    const loadShowtimes = async () => {
      if (selectedTheater && selectedMovie && selectedDate) {
        try {
          const showtimesData = await fetchShowtimes({
            movieId: selectedMovie,
            theaterId: selectedTheater,
            date: selectedDate
          })
          setShowtimes(showtimesData || [])
        } catch (error) {
          console.error('Error loading showtimes:', error)
          setShowtimes([])
        }
      }
    }

    loadShowtimes()
  }, [selectedTheater, selectedMovie, selectedDate])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const handleBookTicket = () => {
    if (selectedTheater && selectedMovie && selectedDate && selectedTime) {
      // Tìm showtime ID dựa trên selections
      const showtime = showtimes.find(st => 
        st.movieId === selectedMovie && 
        st.cinemaId === selectedTheater && 
        st.showDateTime.includes(selectedDate) &&
        st.showDateTime.includes(selectedTime)
      )
      
      if (showtime) {
        window.location.href = `/booking?showtime=${showtime.id}`
      } else {
        alert("Không tìm thấy suất chiếu phù hợp")
      }
    } else {
      alert("Vui lòng chọn đầy đủ thông tin để đặt vé")
    }
  }

  // Generate time slots based on selected filters
  const getAvailableTimes = () => {
    if (!selectedTheater || !selectedMovie || !selectedDate) return []
    
    return showtimes
      .filter(st => 
        st.movieId === selectedMovie && 
        st.cinemaId === selectedTheater && 
        st.showDateTime.includes(selectedDate)
      )
      .map(st => {
        const time = new Date(st.showDateTime).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        })
        return {
          value: time,
          label: time,
          showtimeId: st.id
        }
      })
  }

  // Generate date options (next 7 days)
  const getDateOptions = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateString = date.toISOString().split('T')[0]
      const label = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : 
        date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
      
      dates.push({
        value: dateString,
        label: `${label} (${date.toLocaleDateString('vi-VN', { weekday: 'short' })})`
      })
    }
    
    return dates
  }

  if (loading) {
    return (
      <div className="bg-[#0a1426] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
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
                  {theaters.map((theater) => (
                    <SelectItem key={theater.id} value={theater.id}>
                      {theater.name}
                    </SelectItem>
                  ))}
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
                  {getDateOptions().map((date) => (
                    <SelectItem key={date.value} value={date.value}>
                      {date.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="4. Chọn Suất" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableTimes().map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold whitespace-nowrap"
              onClick={handleBookTicket}
              disabled={!selectedTheater || !selectedMovie || !selectedDate || !selectedTime}
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
          {movies
            .filter(movie => movie.status === 'now-showing')
            .map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
        </div>
      </div>

      {/* Coming Soon */}
      <div className="container mx-auto my-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">PHIM SẮP CHIẾU</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies
            .filter(movie => movie.status === 'coming-soon')
            .slice(0, 4)
            .map((movie) => (
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