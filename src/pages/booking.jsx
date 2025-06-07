// src/pages/booking.jsx

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import { fetchMovie, fetchShowtime, fetchTheater, fetchSeats, fetchRoom, handleApiError } from "../lib/api"

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const showTimeId = searchParams.get("showtime")
  
  const [loading, setLoading] = useState(true)
  const [movie, setMovie] = useState(null)
  const [showtime, setShowtime] = useState(null)
  const [theater, setTheater] = useState(null)
  const [room, setRoom] = useState(null);
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])

  useEffect(() => {
    const loadData = async () => {
      if (!showTimeId) {
        navigate("/")
        return
      }

      setLoading(true)
      try {
        const showtimeData = await fetchShowtime(showTimeId);
        if (!showtimeData) throw new Error("Showtime not found");
        
        setShowtime(showtimeData);
        
        const [movieData, theaterData, seatsData, roomData] = await Promise.all([
          fetchMovie(showtimeData.movieId),
          fetchTheater(showtimeData.cinemaId),
          fetchSeats(showtimeData.id),
          fetchRoom(showtimeData.roomId)
        ]);
        
        setMovie(movieData);
        setTheater(theaterData);
        setSeats(seatsData || []);
        setRoom(roomData);

      } catch (error) {
        const err = handleApiError(error);
        console.error("Error loading booking data:", err);
        alert(err.message || "Không thể tải thông tin suất chiếu.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showTimeId, navigate]);

  const handleSeatClick = (seatId) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat || seat.status !== "available") return;

    setSelectedSeats((prev) => 
      prev.includes(seatId) 
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      return total + (seat?.price || 0);
    }, 0);
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất một ghế");
      return;
    }
    // Chuyển hướng đến trang checkout với các thông tin cần thiết
    navigate(`/checkout?showtime=${showTimeId}&seats=${selectedSeats.join(',')}`);
  };

  const renderSeats = () => {
    if (seats.length === 0) {
      return <div className="text-center py-8 text-gray-400">Đang tải sơ đồ ghế...</div>;
    }

    const seatsByRow = seats.reduce((acc, seat) => {
      (acc[seat.row] = acc[seat.row] || []).push(seat);
      return acc;
    }, {});

    return (
      <div className="mt-8">
        <div className="w-full bg-gray-800 p-4 text-center mb-8 rounded-lg">
          <div className="w-3/4 h-2 bg-yellow-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">MÀN HÌNH</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          {Object.entries(seatsByRow)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([row, rowSeats]) => (
            <div key={row} className="flex items-center gap-2">
              <div className="w-6 text-center font-bold">{row}</div>
              <div className="flex gap-2">
                {rowSeats
                  .sort((a, b) => a.number - b.number)
                  .map((seat) => {
                  const isSelected = selectedSeats.includes(seat.id);
                  const isAvailable = seat.status === 'available';
                  
                  let bgColor = "bg-gray-700";
                  if (seat.type === "vip") bgColor = "bg-purple-700";
                  if (seat.type === "couple") bgColor = "bg-pink-700";
                  if (!isAvailable) bgColor = "bg-gray-800";
                  if (isSelected) bgColor = "bg-yellow-500";
                  
                  return (
                    <button
                      key={seat.id}
                      className={`w-8 h-8 ${bgColor} ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'} ${isSelected ? 'text-black' : 'text-white'} rounded-md flex items-center justify-center text-xs font-bold`}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={!isAvailable}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2"><div className="w-6 h-6 bg-gray-700 rounded-md"></div><span>Thường</span></div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 bg-purple-700 rounded-md"></div><span>VIP</span></div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 bg-pink-700 rounded-md"></div><span>Đôi</span></div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 bg-gray-800 rounded-md"></div><span>Đã đặt</span></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center p-10">Đang tải...</div>;
  }

  if (!movie || !showtime || !theater) {
    return <div className="text-center p-10">Không tìm thấy thông tin suất chiếu.</div>;
  }

  return (
    <div className="bg-[#0a1426] text-white min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <h1 className="text-2xl font-bold mb-6">Chọn Ghế</h1>
            {renderSeats()}
          </div>
          <div className="w-full lg:w-1/3">
            <Card className="bg-gray-900 border-gray-800 sticky top-4">
              <CardHeader><CardTitle>Thông tin đặt vé</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <img src={movie.poster} alt={movie.title} width={80} height={120} className="rounded-md object-cover" />
                  <div>
                    <h3 className="font-bold">{movie.title}</h3>
                    <p className="text-sm text-gray-400">{movie.ageRating} • {movie.duration} phút</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p><strong>Rạp:</strong> {theater.name}</p>
                  {room && <p><strong>Phòng:</strong> {room.name}</p>}
                  <p><strong>Ngày:</strong> {new Date(showtime.showDateTime).toLocaleDateString("vi-VN")}</p>
                  <p><strong>Suất:</strong> {new Date(showtime.showDateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p><strong>Ghế đã chọn:</strong> {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn ghế"}</p>
                  <p><strong>Số lượng:</strong> {selectedSeats.length} ghế</p>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tạm tính:</span>
                  <span className="text-yellow-500">{getTotalPrice().toLocaleString("vi-VN")} VNĐ</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold" onClick={handleContinue} disabled={selectedSeats.length === 0}>
                  Tiếp tục
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}