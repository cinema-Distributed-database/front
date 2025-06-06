"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, Ticket } from 'lucide-react'
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import MovieCard from "../components/movie-card"
import { fetchMovies, fetchTheaters, fetchShowtimes, fetchNowShowingMovies, fetchComingSoonMovies } from "../lib/api"
// import { handleApiError } from "../lib/api" //  handleApiError đã được tích hợp trong các hàm fetch

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [nowShowingMovies, setNowShowingMovies] = useState([])
  const [comingSoonMovies, setComingSoonMovies] = useState([])
  const [allMoviesForFilter, setAllMoviesForFilter] = useState([])
  const [theaters, setTheaters] = useState([])
  const [showtimesForFilter, setShowtimesForFilter] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTheater, setSelectedTheater] = useState("")
  const [selectedMovie, setSelectedMovie] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const navigate = useNavigate();

  const banners = [
    {
      id: 1,
      image: "https://res.cloudinary.com/dgygvrrjs/image/upload/v1749139242/Screenshot_2025-06-05_222948_b28dbm.png",
      alt: "Banner ưu đãi hấp dẫn",
      link: "/promotions/1",
    },
    {
      id: 2,
      image: "https://res.cloudinary.com/dgygvrrjs/image/upload/v1749139763/Screenshot_2025-06-05_222822_gj7tdt.png",
      alt: "Banner phim mới mỗi tuần",
      link: "/movies",
    },
    {
      id: 3,
      image: "https://res.cloudinary.com/dgygvrrjs/image/upload/v1749139341/Screenshot_2025-06-05_222429_xbq5tb.png",
      alt: "Banner combo bắp nước",
      link: "/concessions",
    },
  ];

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [nowShowingRes, comingSoonRes, theatersRes, allMoviesRes] = await Promise.all([
          fetchNowShowingMovies({ page: 0, size: 8 }),
          fetchComingSoonMovies({ page: 0, size: 8 }),
          fetchTheaters({ page: 0, size: 100 }), // Lấy nhiều rạp cho bộ lọc
          fetchMovies({ page: 0, size: 100 })    // Lấy nhiều phim cho bộ lọc
        ]);
        console.log("Now Showing Movies:", nowShowingRes);
        
        setNowShowingMovies(nowShowingRes || []);
        setComingSoonMovies(comingSoonRes || []);
        setTheaters(theatersRes || []);
        setAllMoviesForFilter(allMoviesRes || []);
        
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
        
      } catch (apiError) {
        console.error('Error loading initial data:', apiError);
        setError(apiError.message || 'Không thể tải dữ liệu trang chủ. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000); // Thời gian chuyển slide: 5 giây

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadShowtimesForFilter = async () => {
      if (selectedMovie && selectedTheater && selectedDate) {
        try {
          setError(null);
          const showtimesData = await fetchShowtimes({
            movieId: selectedMovie,
            cinemaId: selectedTheater,
            date: selectedDate
          });
          setShowtimesForFilter(showtimesData || []);
        } catch (apiError) {
          console.error('Error loading showtimes for filter:', apiError);
          // setError(apiError.message || 'Không thể tải suất chiếu cho bộ lọc.'); // Có thể không cần báo lỗi ở đây để tránh làm phiền
          setShowtimesForFilter([]);
        }
      } else {
        setShowtimesForFilter([]);
        setSelectedTime("");
      }
    }

    loadShowtimesForFilter();
  }, [selectedMovie, selectedTheater, selectedDate]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }

  const handleBookTicket = () => {
    if (selectedMovie && selectedTheater && selectedDate && selectedTime) {
      const showtime = showtimesForFilter.find(st => {
        const stTime = new Date(st.showDateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        return stTime === selectedTime;
      });
      
      if (showtime) {
        navigate(`/booking?showtime=${showtime.id}`);
      } else {
        alert("Không tìm thấy suất chiếu phù hợp. Vui lòng kiểm tra lại.");
      }
    } else {
      alert("Vui lòng chọn đầy đủ thông tin: Phim, Rạp, Ngày và Suất chiếu.");
    }
  }

  const getAvailableTimes = () => {
    if (!selectedMovie || !selectedTheater || !selectedDate || showtimesForFilter.length === 0) return [];
    
    return showtimesForFilter
      .map(st => {
        const time = new Date(st.showDateTime).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return {
          value: time,
          label: time,
          showtimeId: st.id
        };
      })
      .filter((item, index, self) =>
        index === self.findIndex((t) => (t.value === item.value))
      )
      .sort((a,b) => a.label.localeCompare(b.label));
  }

  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const label = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : 
        date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      dates.push({
        value: dateString,
        label: `${label} (${date.toLocaleDateString('vi-VN', { weekday: 'short' })})`
      });
    }
    return dates;
  }

  if (loading) {
    return (
      <div className="bg-[#0a1426] text-white min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 text-yellow-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-semibold">Đang tải dữ liệu, vui lòng chờ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-20 px-4 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
        <h2 className="text-3xl font-bold text-red-500 mb-6">Rất tiếc, đã có lỗi xảy ra!</h2>
        <p className="text-gray-300 mb-8 text-lg">{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#100C2A] text-white"> 
      <div className="relative overflow-hidden h-[35vh] sm:h-[40vh] md:h-[45vh] max-h-[480px] w-full">
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="w-full h-[60vh] flex-shrink-0 relative">
              <Link to={banner.link}>
                <img 
                  src={banner.image} 
                  alt={banner.alt} 
                  className="w-full h-full object-cover" 
                />
              </Link>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 p-2 sm:p-3 rounded-full transition-colors duration-300 z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} sm={28} />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 p-2 sm:p-3 rounded-full transition-colors duration-300 z-10"
          aria-label="Next slide"
        >
          <ChevronRight size={24} sm={28} />
        </button>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-yellow-500 scale-125" : "bg-white/60 hover:bg-white/90"}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Quick Booking Section - Giữ lại vì hữu ích, có thể ẩn nếu không muốn */}
       <div className="container mx-auto my-10 px-4">
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <Ticket className="text-yellow-400" size={28} />
            <h2 className="text-xl md:text-2xl font-semibold text-yellow-400">Đặt Vé Nhanh</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            {/* Selectors for Movie, Theater, Date, Time */}
            <div className="flex-grow">
              <label htmlFor="movieFilter" className="block text-xs font-medium mb-1 text-gray-300">Phim</label>
              <Select value={selectedMovie} onValueChange={setSelectedMovie}>
                <SelectTrigger id="movieFilter" className="w-full bg-gray-700 border-gray-600 text-sm">
                  <SelectValue placeholder="Chọn phim" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {allMoviesForFilter.map((movie) => (
                    <SelectItem key={movie.id} value={movie.id} className="hover:bg-gray-600 text-sm">{movie.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="flex-grow">
              <label htmlFor="theaterFilter" className="block text-xs font-medium mb-1 text-gray-300">Rạp</label>
              <Select value={selectedTheater} onValueChange={setSelectedTheater}>
                <SelectTrigger id="theaterFilter" className="w-full bg-gray-700 border-gray-600 text-sm">
                  <SelectValue placeholder="Chọn rạp" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {theaters.map((theater) => (
                    <SelectItem key={theater.id} value={theater.id} className="hover:bg-gray-600 text-sm">{theater.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-grow">
              <label htmlFor="dateFilter" className="block text-xs font-medium mb-1 text-gray-300">Ngày</label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger id="dateFilter" className="w-full bg-gray-700 border-gray-600 text-sm">
                  <SelectValue placeholder="Chọn ngày" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {getDateOptions().map((date) => (
                    <SelectItem key={date.value} value={date.value} className="hover:bg-gray-600 text-sm">{date.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-grow">
              <label htmlFor="timeFilter" className="block text-xs font-medium mb-1 text-gray-300">Suất chiếu</label>
              <Select value={selectedTime} onValueChange={setSelectedTime} disabled={getAvailableTimes().length === 0}>
                <SelectTrigger id="timeFilter" className="w-full bg-gray-700 border-gray-600 text-sm">
                  <SelectValue placeholder={getAvailableTimes().length === 0 ? "Hết suất" : "Chọn suất"} />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {getAvailableTimes().map((time) => (
                    <SelectItem key={time.value} value={time.value} className="hover:bg-gray-600 text-sm">{time.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold disabled:bg-gray-500 disabled:cursor-not-allowed py-2.5 text-sm"
              onClick={handleBookTicket}
              disabled={!selectedTheater || !selectedMovie || !selectedDate || !selectedTime}
            >
              Mua Vé
            </Button>
          </div>
        </div>
      </div>

      {/* Now Showing Section - Giống image_b7370c.png */}
      <div className="container mx-auto my-12 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Phim Đang Chiếu</h2>
          <Link to="/movies?status=now-showing">
            <Button variant="outline" className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black text-xs px-3 py-1 h-auto">
              Xem Tất Cả
            </Button>
          </Link>
        </div>
        {nowShowingMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {nowShowingMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">Hiện không có phim nào đang chiếu.</p>
        )}
      </div>

      {/* Coming Soon Section - Giống image_b7370c.png */}
      <div className="container mx-auto my-12 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Phim Sắp Chiếu</h2>
          <Link to="/movies?status=coming-soon">
            <Button variant="outline" className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-black text-xs px-3 py-1 h-auto">
              Xem Tất Cả
            </Button>
          </Link>
        </div>
        {comingSoonMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {comingSoonMovies.map((movie) => (
              <MovieCard key={`coming-${movie.id}`} movie={{ ...movie, isComingSoon: true }} />
            ))}
          </div>
        ) : (
           <p className="text-center text-gray-400 py-8">Chưa có thông tin phim sắp chiếu.</p>
        )}
      </div>
    </div>
  )
}