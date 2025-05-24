"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Separator } from "../components/ui/separator"

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [ticketInfo, setTicketInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  const bookingId = searchParams.get("bookingId")

  useEffect(() => {
    // Simulate fetching ticket information
    setTimeout(() => {
      // Lấy thông tin ghế từ URL
      const seatsParam = searchParams.get("seats")
      const seats = seatsParam ? seatsParam.split(",") : ["E8"] // Mặc định là E8 nếu không có thông tin

      setTicketInfo({
        id: bookingId || "BK" + Date.now(),
        movie: {
          title: "Lật Mặt 7: Vòng Tay Nặng",
          ageRestriction: "13+",
          duration: 132,
        },
        theater: {
          name: "Cinestar Quang Trung",
          address: "45 Quang Trung, P.10, Q.Gò Vấp, TP.HCM",
        },
        showtime: {
          date: "2024-05-16",
          time: "19:30",
        },
        seats: seats, // Sử dụng ghế từ URL
        totalPrice: seats.length * 90000, // Tính giá dựa trên số ghế
        paymentMethod: "VNPAY",
        paymentTime: new Date().toISOString(),
      })
      setLoading(false)
    }, 1000)
  }, [bookingId, searchParams])

  const handleDownloadTicket = () => {
    alert("Tính năng tải vé sẽ được cập nhật trong thời gian tới!")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-700 rounded mb-8"></div>
          <div className="h-96 w-full max-w-md bg-gray-800 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Thanh toán thành công!</h1>
          <p className="text-gray-400 mt-2">Cảm ơn bạn đã đặt vé tại Cinestar</p>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center border-b border-gray-800 pb-4">
            <CardTitle>Thông tin vé</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Mã đặt vé:</span>
              <span className="font-bold">{ticketInfo.id}</span>
            </div>

            <Separator />

            <div>
              <h3 className="font-bold text-lg mb-1">{ticketInfo.movie.title}</h3>
              <p className="text-sm text-gray-400">
                {ticketInfo.movie.ageRestriction} • {ticketInfo.movie.duration} phút
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-bold mb-1">{ticketInfo.theater.name}</h3>
              <p className="text-sm text-gray-400">{ticketInfo.theater.address}</p>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Ngày chiếu:</span>
              <span>{new Date(ticketInfo.showtime.date).toLocaleDateString("vi-VN")}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Giờ chiếu:</span>
              <span>{ticketInfo.showtime.time}</span>
            </div>

            <Separator />

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Ghế:</span>
                <span>{ticketInfo.seats.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Số lượng:</span>
                <span>{ticketInfo.seats.length} ghế</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-gray-400">Phương thức thanh toán:</span>
              <span>{ticketInfo.paymentMethod}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Thời gian thanh toán:</span>
              <span>{new Date(ticketInfo.paymentTime).toLocaleTimeString("vi-VN")}</span>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>Tổng tiền:</span>
              <span className="text-yellow-500">{ticketInfo.totalPrice.toLocaleString("vi-VN")} VNĐ</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button className="w-full" onClick={handleDownloadTicket}>
              Tải vé
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
              Về trang chủ
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Vé điện tử đã được gửi đến email của bạn.</p>
          <p className="mt-1">Vui lòng đến rạp trước giờ chiếu 15-30 phút.</p>
        </div>
      </div>
    </div>
  )
}