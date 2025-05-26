"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Calendar, Clock, Film, Star, User, Users } from 'lucide-react'
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { fetchMovie, fetchShowtimes, fetchTheaters } from "../lib/api"

export default function MovieDetail() {
  const params = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTheater, setSelectedTheater] = useState("")
  const [theaters, setTheaters] = useState([])
  const [showtimes, setShowtimes] = useState([])
  const [filteredShowtimes, setFilteredShowtimes] = useState([])
  const [dates, setDates] = useState([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Load movie data
        const movieData = await fetchMovie(params.id)
        if (!movieData) {
          navigate('/not-found')
          return
        }
        setMovie(movieData)

        // Load theaters
        const theatersData = await fetchTheaters()
        setTheaters(theatersData || [])

        // Generate dates for the next 7 days
        const today = new Date()
        const nextDates = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today)
          date.setDate(today.getDate() + i)
          return date.toISOString().split("T")[0]
        })
        setDates(nextDates)
        setSelectedDate(nextDates[0])

        // Load showtimes for this movie
        const showtimesData = await fetchShowtimes({ movieId: movieData.id })
        setShowtimes(showtimesData || [])

      } catch (error) {
        console.error("Error loading movie data:", error)
        navigate('/not-found')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, navigate])

  useEffect(() => {
    if (showtimes.length > 0) {
      let filtered = [...showtimes]

      if (selectedDate) {
        filtered = filtered.filter((s) => {
          const showtimeDate = new Date(s.showDateTime).toISOString().split('T')[0]
          return showtimeDate === selectedDate
        })
      }

      if (selectedTheater) {
        filtered = filtered.filter((s) => s.cinemaId === selectedTheater)
      }

      setFilteredShowtimes(filtered)
    }
  }, [showtimes, selectedDate, selectedTheater])

  const handleBookTicket = (showTimeId) => {
    navigate(`/booking?showtime=${showTimeId}`)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Ngày mai"
    } else {
      return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
    }
  }

  const formatTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Group showtimes by theater
  const groupShowtimesByTheater = () => {
    const grouped = {}
    
    filteredShowtimes.forEach(showtime => {
      const theater = theaters.find(t => t.id === showtime.cinemaId)
      if (theater) {
        if (!grouped[theater.id]) {
          grouped[theater.id] = {
            theater: theater,
            showtimes: []
          }
        }
        grouped[theater.id].showtimes.push(showtime)
      }
    })
    
    return Object.values(grouped)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-700 rounded mb-8"></div>
          <div className="h-96 w-full max-w-4xl bg-gray-800 rounded"></div>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Phim không tồn tại</h1>
        <p className="mb-8">Không tìm thấy thông tin phim bạn yêu cầu.</p>
        <Button onClick={() => navigate("/")}>Quay lại trang chủ</Button>
      </div>
    )
  }

  return (
    <div className="bg-[#0a1426] text-white min-h-screen">
      {/* Movie Backdrop */}
      <div className="relative w-full h-[50vh]">
        <img 
          src={movie.poster || "/placeholder.svg"} 
          alt={movie.title} 
          className="w-full h-full object-cover opacity-30" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1426] to-transparent"></div>
      </div>

      {/* Movie Details */}
      <div className="container mx-auto px-4 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Movie Poster */}
          <div className="flex-shrink-0">
            <div className="relative w-64 h-96 rounded-lg overflow-hidden shadow-xl">
              <img src={movie.poster || "/placeholder.svg"} alt={movie.title} className="w-full h-full object-cover" />
              {movie.ageRating && (
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  {movie.ageRating}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-center">
              <Button 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                onClick={() => {
                  // Scroll to showtimes section
                  document.getElementById('showtimes-section')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Mua vé ngay
              </Button>
            </div>
          </div>

          {/* Movie Info */}
          <div className="flex-grow">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <h2 className="text-xl text-gray-400 mb-4">{movie.originalTitle}</h2>
            )}

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Clock size={20} />
                <span>{movie.duration} phút</span>
              </div>

              <div className="flex items-center gap-1">
                <Calendar size={20} />
                <span>Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}</span>
              </div>

              <div className="flex items-center gap-1">
                <Film size={20} />
                <span>{Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Nội dung</h3>
              <p className="text-gray-300">{movie.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Đạo diễn</h3>
                <div className="flex items-center gap-2">
                  <User size={20} />
                  <span>{Array.isArray(movie.directors) ? movie.directors.join(", ") : movie.directors}</span>
                </div>
              </div>

              {movie.cast && (
                <div>
                  <h3 className="text-xl font-bold mb-2">Diễn viên</h3>
                  <div className="flex items-center gap-2">
                    <Users size={20} />
                    <span>{Array.isArray(movie.cast) ? movie.cast.join(", ") : "Đang cập nhật"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trailer and Showtimes */}
        <div className="mt-12" id="showtimes-section">
          <Tabs defaultValue="showtimes">
            <TabsList className="w-full max-w-md mx-auto">
              <TabsTrigger value="showtimes" className="flex-1">
                Lịch chiếu
              </TabsTrigger>
              <TabsTrigger value="trailer" className="flex-1">
                Trailer
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">
                Đánh giá
              </TabsTrigger>
            </TabsList>

            <TabsContent value="showtimes" className="mt-6">
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Chọn ngày</label>
                    <Select value={selectedDate} onValueChange={setSelectedDate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn ngày" />
                      </SelectTrigger>
                      <SelectContent>
                        {dates.map((date) => (
                          <SelectItem key={date} value={date}>
                            {formatDate(date)} ({new Date(date).toLocaleDateString("vi-VN", { weekday: "short" })})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Chọn rạp</label>
                    <Select value={selectedTheater} onValueChange={setSelectedTheater}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả rạp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tất cả rạp</SelectItem>
                        {theaters.map((theater) => (
                          <SelectItem key={theater.id} value={theater.id}>
                            {theater.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {groupShowtimesByTheater().length > 0 ? (
                  <div className="space-y-6">
                    {groupShowtimesByTheater().map(({ theater, showtimes: theaterShowtimes }) => (
                      <div key={theater.id} className="border border-gray-800 rounded-lg p-4">
                        <h3 className="text-xl font-bold mb-4">{theater.name}</h3>
                        <p className="text-gray-400 text-sm mb-4">{theater.address}</p>

                        <div className="flex flex-wrap gap-3">
                          {theaterShowtimes.map((showtime) => (
                            <Button
                              key={showtime.id}
                              variant="outline"
                              className="border border-gray-600 hover:bg-yellow-500 hover:text-black bg-transparent text-white"
                              onClick={() => handleBookTicket(showtime.id)}
                            >
                              {formatTime(showtime.showDateTime)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Không có suất chiếu nào cho phim này vào ngày đã chọn.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="trailer" className="mt-6">
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="aspect-video">
                  {movie.trailer ? (
                    <iframe
                      src={movie.trailer.replace("watch?v=", "embed/")}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                      title={`Trailer ${movie.title}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
                      <p className="text-gray-400">Trailer chưa được cập nhật</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="text-center py-8">
                  <p className="text-gray-400">Chưa có đánh giá nào cho phim này.</p>
                  <Button className="mt-4">Viết đánh giá</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}