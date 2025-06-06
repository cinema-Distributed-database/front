"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Calendar, Clock, Film, PlayCircle, ChevronDown, ChevronUp, Globe } from 'lucide-react'
import { Button } from "../components/ui/button"
import { fetchMovie, fetchShowtimes, fetchTheaters } from "../lib/api"

// Component nhỏ để quản lý việc mở/đóng danh sách rạp
function TheaterShowtimes({ theater, showtimes, onBookTicket }) {
  const [isOpen, setIsOpen] = useState(true);

  const formatTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-[#1a163a] border border-gray-700 rounded-lg mb-4">
      <button
        className="w-full flex justify-between items-center p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 className="text-lg font-semibold text-yellow-400">{theater.name}</h3>
          <p className="text-xs text-gray-400 mt-1">{theater.address}</p>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm font-semibold mb-3">2D Phụ Đề</p>
          <div className="flex flex-wrap gap-3">
            {showtimes.map((showtime) => (
              <Button
                key={showtime.id}
                variant="outline"
                className="border-gray-500 hover:bg-yellow-500 hover:text-black bg-transparent text-white"
                onClick={() => onBookTicket(showtime.id)}
              >
                {formatTime(showtime.showDateTime)}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Hàm trợ giúp để chuyển đổi ageRating
const getAgeRatingDescription = (ageRating) => {
  const rating = (ageRating || '').toUpperCase();

  if (rating.includes('C18') || rating.includes('T18')) {
    return 'Phim dành cho khán giả từ đủ 18 tuổi trở lên (18+).';
  }
  if (rating.includes('C16') || rating.includes('T16')) {
    return 'Phim dành cho khán giả từ đủ 16 tuổi trở lên (16+).';
  }
  if (rating.includes('C13') || rating.includes('T13')) {
    return 'Phim dành cho khán giả từ đủ 13 tuổi trở lên (13+).';
  }
  if (rating === 'K') {
    return 'Phim phổ biến đến người xem dưới 13 tuổi với điều kiện xem cùng cha, mẹ hoặc người giám hộ.';
  }
  
  return 'Phim dành cho khán giả mọi lứa tuổi.';
};

export default function MovieDetail() {
  const params = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState("")
  const [theaters, setTheaters] = useState([])
  const [allShowtimes, setAllShowtimes] = useState([])
  const [filteredShowtimes, setFilteredShowtimes] = useState([])
  const [dates, setDates] = useState([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const movieId = params.id;
        const [movieData, showtimesData, theatersData] = await Promise.all([
          fetchMovie(movieId),
          fetchShowtimes({ movieId }),
          fetchTheaters()
        ]);

        if (!movieData) {
          navigate('/not-found');
          return;
        }

        setMovie(movieData);
        setTheaters(theatersData || []);
        setAllShowtimes(showtimesData || []);

        const today = new Date();
        const nextDates = Array.from({ length: 4 }, (_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          return date.toISOString().split("T")[0];
        });
        
        setDates(nextDates);
        if (nextDates.length > 0) {
          setSelectedDate(nextDates[0]);
        }
      } catch (error) {
        console.error("Error loading movie data:", error);
        navigate('/not-found');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, navigate]);

  useEffect(() => {
    if (allShowtimes.length > 0) {
      const filtered = allShowtimes.filter((s) => {
        const showtimeDate = new Date(s.showDateTime).toISOString().split('T')[0];
        return showtimeDate === selectedDate;
      });
      setFilteredShowtimes(filtered);
    }
  }, [allShowtimes, selectedDate]);


  const handleBookTicket = (showTimeId) => {
    navigate(`/booking?showtime=${showTimeId}`);
  };

  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const formatWeekday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Hôm nay";
    if (date.toDateString() === tomorrow.toDateString()) return "Ngày mai";
    
    const weekday = date.toLocaleDateString("vi-VN", { weekday: "long" });
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  }

  const groupShowtimesByTheater = () => {
    const grouped = {};
    filteredShowtimes.forEach(showtime => {
      const theater = theaters.find(t => t.id === showtime.cinemaId);
      if (theater) {
        if (!grouped[theater.id]) {
          grouped[theater.id] = {
            theater: theater,
            showtimes: []
          };
        }
        grouped[theater.id].showtimes.push(showtime);
      }
    });
    return Object.values(grouped).sort((a, b) => a.theater.name.localeCompare(b.theater.name));
  };
  
  const groupedShowtimes = groupShowtimesByTheater();

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold">Phim không tồn tại.</h1>
        <Button onClick={() => navigate("/")} className="mt-4">Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a3a] text-white min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 relative">
            <div className="absolute top-1 left-1 gap-2 z-10">
              <span className="bg-red-600 text-white font-bold px-3 py-1 rounded text-3xl">{movie.ageRating}</span>
            </div>
            <img 
              src={movie.poster || "/placeholder.svg"} 
              alt={movie.title} 
              className="w-full h-auto rounded-lg shadow-xl" 
              style={{ aspectRatio: '2/3' }}
            />
          </div>

          <div className="w-full md:w-2/3 lg:w-3/4">
            <h1 className="text-3xl font-bold uppercase mb-4">
              {movie.title} {movie.originalTitle && `(${movie.originalTitle})`}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 text-gray-300">
              <div className="flex items-center gap-2">
                <Film size={18} />
                <span>{Array.isArray(movie.genres) ? movie.genres.join(", ") : "Đang cập nhật"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>{movie.duration} phút</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Phụ đề: {movie.subtitles || "Tiếng Việt"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={14} />
                <span>{movie.country}</span>
              </div>
            </div>

            <p className="text-xl mb-6">
              <span className="text-black bg-yellow-400 px-2 py-1">{getAgeRatingDescription(movie.ageRating)}</span>
            </p>


            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-yellow-400">MÔ TẢ</h3>
                <p><strong>Đạo diễn:</strong> {Array.isArray(movie.directors) ? movie.directors.join(", ") : "Đang cập nhật"}</p>
                <p><strong>Khởi chiếu:</strong> {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-yellow-400">NỘI DUNG PHIM</h3>
                <p className="text-gray-300 leading-relaxed">{movie.description}</p>
              </div>
            </div>
            
            {movie.trailer && (
              <a href={movie.trailer} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="mt-6 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
                  <PlayCircle size={20} className="mr-2" />
                  Xem Trailer
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center mb-6 uppercase">Lịch Chiếu</h2>

          <div className="flex justify-center gap-2 md:gap-4 mb-8">
            {dates.map(date => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg w-20 h-20 transition-colors duration-200 ${
                  selectedDate === date
                    ? 'bg-yellow-500 text-black'
                    : 'bg-[#2a2658] hover:bg-[#3e388b]'
                }`}
              >
                <span className="font-bold text-lg">{formatDateLabel(date)}</span>
                <span className="text-xs">{formatWeekday(date)}</span>
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            {loading ? (
              <p className="text-center">Đang tải lịch chiếu...</p>
            ) : groupedShowtimes.length > 0 ? (
              groupedShowtimes.map(({ theater, showtimes }) => (
                <TheaterShowtimes 
                  key={theater.id}
                  theater={theater}
                  showtimes={showtimes}
                  onBookTicket={handleBookTicket}
                />
              ))
            ) : (
              <div className="text-center py-8 bg-[#1a163a] rounded-lg">
                <p className="text-gray-400">Không có suất chiếu nào cho ngày đã chọn.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}