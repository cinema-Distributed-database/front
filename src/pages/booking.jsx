"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Clock, MapPin } from 'lucide-react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import VNPayPayment from "./vnpay-payment"
import { 
  fetchMovie, 
  fetchTheater, 
  fetchSeats, 
  holdSeats, 
  releaseSeats, 
  createBooking,
  handleApiError 
} from "../lib/api"

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const showTimeId = searchParams.get("showtime")
  
  const [loading, setLoading] = useState(true)
  const [movie, setMovie] = useState(null)
  const [showtime, setShowtime] = useState(null)
  const [theater, setTheater] = useState(null)
  const [room, setRoom] = useState(null)
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [step, setStep] = useState("seats")
  const [booking, setBooking] = useState(null)
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phone: "",
    email: ""
  })

  useEffect(() => {
    const loadData = async () => {
      if (!showTimeId) {
        navigate("/")
        return
      }

      setLoading(true)
      try {
        // Lấy thông tin suất chiếu từ API backend
        const response = await fetch(`http://localhost:8080/api/showtimes/${showTimeId}`)
        const showtimeResponse = await response.json()
        
        if (!showtimeResponse.success) {
          throw new Error("Showtime not found")
        }
        
        const showtimeData = showtimeResponse.data
        setShowtime(showtimeData)

        // Load movie, theater, seats song song
        const [movieData, theaterData, seatsData] = await Promise.all([
          fetchMovie(showtimeData.movieId),
          fetchTheater(showtimeData.cinemaId),
          fetchSeats(showtimeData.id)
        ])

        setMovie(movieData)
        setTheater(theaterData)
        setSeats(seatsData || [])
        
        // Load room info nếu cần
        if (showtimeData.roomId) {
          try {
            const response = await fetch(`http://localhost:8080/api/rooms/${showtimeData.roomId}`)
            const roomResponse = await response.json()
            if (roomResponse.success) {
              setRoom(roomResponse.data)
            }
          } catch (error) {
            console.warn("Could not load room data:", error)
          }
        }

      } catch (error) {
        console.error("Error loading booking data:", error)
        alert("Không thể tải thông tin suất chiếu. Vui lòng thử lại.")
        navigate("/")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [showTimeId, navigate])

  const handleSeatClick = (seatId) => {
    const seat = seats.find((s) => s.id === seatId)
    if (!seat || seat.status === "reserved" || seat.status === "unavailable") return

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId)
      } else {
        return [...prev, seatId]
      }
    })
  }

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId)
      return total + (seat?.price || 90000)
    }, 0)
  }

  const handleContinueToPayment = async () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất một ghế")
      return
    }

    if (!customerInfo.fullName || !customerInfo.phone) {
      alert("Vui lòng nhập đầy đủ thông tin khách hàng")
      return
    }

    try {
      // Giữ ghế trước khi chuyển sang bước thanh toán
      await holdSeats(showTimeId, selectedSeats, customerInfo.phone)
      
      // Tạo booking
      const bookingData = await createBooking({
        showTimeId: showTimeId,
        customerInfo: customerInfo,
        seats: selectedSeats,
        ticketTypes: [
          {
            type: "Người lớn",
            quantity: selectedSeats.length,
            pricePerTicket: 90000
          }
        ],
        concessions: []
      })
      
      setBooking(bookingData)
      setStep("payment")
      
    } catch (error) {
      const errorInfo = handleApiError(error)
      alert(errorInfo.message || "Không thể giữ ghế. Vui lòng thử lại.")
    }
  }

  const handlePaymentSuccess = (seats) => {
    // Chuyển hướng đến trang xác nhận thanh toán với thông tin booking
    navigate(`/payment-success?bookingId=${booking?.confirmationCode}&seats=${seats.join(",")}`)
  }

  const handlePaymentCancel = async () => {
    // Hủy giữ ghế khi cancel payment
    if (selectedSeats.length > 0) {
      try {
        await releaseSeats(showTimeId, selectedSeats)
      } catch (error) {
        console.error("Error releasing seats:", error)
      }
    }
    setStep("seats")
  }

  const renderSeats = () => {
    if (seats.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">Đang tải sơ đồ ghế...</p>
        </div>
      )
    }

    // Group seats by row
    const seatsByRow = {}
    seats.forEach((seat) => {
      if (!seatsByRow[seat.row]) {
        seatsByRow[seat.row] = []
      }
      seatsByRow[seat.row].push(seat)
    })

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
                  let bgColor = "bg-gray-700"
                  let textColor = "text-white"
                  let cursor = "cursor-pointer"

                  if (seat.status === "reserved" || seat.status === "unavailable") {
                    bgColor = "bg-gray-800"
                    textColor = "text-gray-500"
                    cursor = "cursor-not-allowed"
                  } else if (selectedSeats.includes(seat.id)) {
                    bgColor = "bg-yellow-500"
                    textColor = "text-black"
                  } else if (seat.type === "vip") {
                    bgColor = "bg-purple-700"
                  } else if (seat.type === "couple") {
                    bgColor = "bg-pink-700"
                  }

                  return (
                    <button
                      key={seat.id}
                      className={`w-8 h-8 ${bgColor} ${textColor} ${cursor} rounded-md flex items-center justify-center text-xs font-bold`}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seat.status === "reserved" || seat.status === "unavailable"}
                    >
                      {seat.number}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-700 rounded-md"></div>
            <span className="text-sm">Ghế thường</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-700 rounded-md"></div>
            <span className="text-sm">Ghế VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-pink-700 rounded-md"></div>
            <span className="text-sm">Ghế đôi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-800 rounded-md"></div>
            <span className="text-sm">Đã đặt</span>
          </div>
        </div>

        {/* Customer Info Form */}
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Thông tin khách hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Họ và tên *</label>
              <input
                type="text"
                className="w-full p-3 bg-gray-700 text-white rounded-md"
                placeholder="Nhập họ và tên"
                value={customerInfo.fullName}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Số điện thoại *</label>
              <input
                type="tel"
                className="w-full p-3 bg-gray-700 text-white rounded-md"
                placeholder="Nhập số điện thoại"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full p-3 bg-gray-700 text-white rounded-md"
                placeholder="Nhập email (tùy chọn)"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderPaymentMethods = () => {
    if (!booking) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">Đang tải thông tin thanh toán...</p>
        </div>
      )
    }

    return (
      <VNPayPayment 
        bookingId={booking.id} 
        amount={getTotalPrice()} 
        seats={selectedSeats}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    )
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

  if (!movie || !showtime || !theater) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Không tìm thấy thông tin</h1>
        <p className="mb-8">Không tìm thấy thông tin suất chiếu bạn yêu cầu.</p>
        <Button onClick={() => navigate("/")}>Quay lại trang chủ</Button>
      </div>
    )
  }

  return (
    <div className="bg-[#0a1426] text-white min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <h1 className="text-2xl font-bold mb-6">
              {step === "seats" && "Chọn ghế & Thông tin"}
              {step === "payment" && "Thanh toán"}
            </h1>

            {step === "seats" && renderSeats()}
            {step === "payment" && renderPaymentMethods()}
          </div>

          <div className="w-full lg:w-1/3">
            <Card className="bg-gray-900 border-gray-800 sticky top-4">
              <CardHeader>
                <CardTitle>Thông tin đặt vé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <img
                    src={movie.poster || "/placeholder.svg"}
                    alt={movie.title}
                    width={80}
                    height={120}
                    className="rounded-md object-cover"
                  />
                  <div>
                    <h3 className="font-bold">{movie.title}</h3>
                    <p className="text-sm text-gray-400">
                      {movie.ageRating} • {movie.duration} phút
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rạp:</span>
                    <span className="text-sm">{theater.name}</span>
                  </div>
                  {room && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phòng:</span>
                      <span className="text-sm">{room.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ngày:</span>
                    <span className="text-sm">
                      {new Date(showtime.showDateTime).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Suất chiếu:</span>
                    <span className="text-sm">
                      {new Date(showtime.showDateTime).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ghế đã chọn:</span>
                    <span className="text-sm">
                      {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn ghế"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Số lượng:</span>
                    <span className="text-sm">{selectedSeats.length} ghế</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng tiền:</span>
                  <span className="text-yellow-500">{getTotalPrice().toLocaleString("vi-VN")} VNĐ</span>
                </div>
              </CardContent>
              
              <CardFooter>
                {step === "seats" && (
                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                    onClick={handleContinueToPayment}
                    disabled={selectedSeats.length === 0 || !customerInfo.fullName || !customerInfo.phone}
                  >
                    Tiếp tục thanh toán
                  </Button>
                )}

                {step === "payment" && (
                  <div className="w-full space-y-2">
                    <Button variant="outline" className="w-full" onClick={handlePaymentCancel}>
                      Quay lại
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}