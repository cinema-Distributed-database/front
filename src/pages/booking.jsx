"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Clock, MapPin } from 'lucide-react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import VNPayPayment from "./vnpay-payment"
import { fetchMovie, fetchShowtimes, fetchTheater, fetchSeats, createBooking, processPayment } from "../lib/api"

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const showTimeId = searchParams.get("showtime")
  const [loading, setLoading] = useState(true)
  const [movie, setMovie] = useState(null)
  const [showtime, setShowtime] = useState(null)
  const [theater, setTheater] = useState(null)
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [step, setStep] = useState("seats")
  const [paymentMethod, setPaymentMethod] = useState("vnpay")
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        if (!showTimeId) {
          navigate("/")
          return
        }

        const showtimesData = await fetchShowtimes()
        const showtime = showtimesData.find((s) => s.id === showTimeId) || null
        setShowtime(showtime)

        if (showtime) {
          const [movieData, theaterData, seatsData] = await Promise.all([
            fetchMovie(showtime.movieId),
            fetchTheater(showtime.theaterId),
            fetchSeats(showtime.id),
          ])

          setMovie(movieData)
          setTheater(theaterData)
          setSeats(seatsData)
        }
      } catch (error) {
        console.error("Error loading booking data:", error)
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
      return total + (seat?.price || 0)
    }, 0)
  }

  const handleContinueToPayment = async () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất một ghế")
      return
    }

    setStep("payment")
  }

  const handlePaymentSuccess = (seats) => {
    // Chuyển hướng đến trang xác nhận thanh toán với thông tin ghế
    navigate(`/payment-success?bookingId=BK${Date.now()}&seats=${seats.join(",")}`)
  }

  const handlePaymentCancel = () => {
    setStep("seats")
  }

  const renderSeats = () => {
    if (seats.length === 0) return null

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
          <div className="w-3/4 h-2 bg-yellow-500 mx-auto mb-8"></div>
          <p className="text-sm text-gray-400">MÀN HÌNH</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          {Object.entries(seatsByRow).map(([row, rowSeats]) => (
            <div key={row} className="flex items-center gap-2">
              <div className="w-6 text-center font-bold">{row}</div>
              <div className="flex gap-2">
                {rowSeats.map((seat) => {
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
      </div>
    )
  }

  const renderPaymentMethods = () => {
    return (
      <VNPayPayment 
        bookingId={`BK${Date.now()}`} 
        amount={getTotalPrice()} 
        seats={selectedSeats}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    )
  }

  const renderConfirmation = () => {
    if (!booking || !movie || !showtime || !theater) return null

    return (
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold mb-2">Đặt vé thành công!</h2>
        <p className="text-gray-400 mb-6">
          Mã đặt vé của bạn: <span className="font-bold text-white">{booking.id}</span>
        </p>

        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Thông tin vé</CardTitle>
            <CardDescription>Vui lòng đến rạp trước giờ chiếu 15-30 phút</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-bold">{movie.title}</h3>
              <p className="text-sm text-gray-400">
                {movie.ageRestriction} • {movie.duration} phút
              </p>
            </div>

            <Separator />

            <div className="flex items-start gap-2">
              <MapPin size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{theater.name}</p>
                <p className="text-sm text-gray-400">{theater.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock size={18} />
              <div>
                <p>
                  {new Date(showtime.date).toLocaleDateString("vi-VN")} • {showtime.startTime}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="font-bold mb-2">Ghế</p>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((seatId) => (
                  <div key={seatId} className="bg-yellow-500 text-black px-2 py-1 rounded text-sm font-bold">
                    {seatId}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between">
              <p className="font-bold">Tổng tiền</p>
              <p className="font-bold">{getTotalPrice().toLocaleString("vi-VN")} VNĐ</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate("/")}>
              Về trang chủ
            </Button>
          </CardFooter>
        </Card>
      </div>
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
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            <h1 className="text-2xl font-bold mb-6">
              {step === "seats" && "Chọn ghế"}
              {step === "payment" && "Thanh toán"}
              {step === "confirmation" && "Xác nhận đặt vé"}
            </h1>

            {step === "seats" && renderSeats()}
            {step === "payment" && renderPaymentMethods()}
            {step === "confirmation" && renderConfirmation()}
          </div>

          <div className="w-full md:w-1/3">
            <Card className="bg-gray-900 border-gray-800">
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
                      {movie.ageRestriction} • {movie.duration} phút
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rạp:</span>
                    <span>{theater.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ngày:</span>
                    <span>{new Date(showtime.date).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Suất chiếu:</span>
                    <span>{showtime.startTime}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ghế đã chọn:</span>
                    <span>{selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn ghế"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Số lượng:</span>
                    <span>{selectedSeats.length} ghế</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng tiền:</span>
                  <span>{getTotalPrice().toLocaleString("vi-VN")} VNĐ</span>
                </div>
              </CardContent>
              <CardFooter>
                {step === "seats" && (
                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                    onClick={handleContinueToPayment}
                    disabled={selectedSeats.length === 0}
                  >
                    Tiếp tục
                  </Button>
                )}

                {step === "payment" && (
                  <div className="w-full space-y-2">
                    <Button variant="outline" className="w-full" onClick={() => setStep("seats")}>
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