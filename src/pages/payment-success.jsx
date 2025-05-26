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
  const [error, setError] = useState(null)

  const bookingId = searchParams.get("bookingId")
  const paymentId = searchParams.get("paymentId")
  const status = searchParams.get("status")
  const transactionId = searchParams.get("transactionId")
  const code = searchParams.get("code")
  const message = searchParams.get("message")

  useEffect(() => {
    const fetchTicketInfo = async () => {
      if (!bookingId) {
        setError("Không tìm thấy thông tin đặt vé")
        setLoading(false)
        return
      }

      try {
        // Gọi API để lấy thông tin booking chi tiết
        const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}`)
        const result = await response.json()
        
        if (result.success && result.data) {
          const bookingData = result.data
          
          // Format ticket info
          setTicketInfo({
            id: bookingData.confirmationCode || bookingId,
            movie: {
              title: bookingData.movieTitle || "N/A",
              ageRestriction: "13+", // Default value
              duration: 132, // Default value
            },
            theater: {
              name: bookingData.cinemaName || "N/A",
              address: "Địa chỉ rạp chiếu", // Default value
            },
            showtime: {
              date: bookingData.showDateTime ? new Date(bookingData.showDateTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              time: bookingData.showDateTime ? new Date(bookingData.showDateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : "19:30",
            },
            seats: bookingData.seats || [],
            totalPrice: bookingData.totalPrice || 0,
            paymentMethod: "VNPAY",
            paymentTime: new Date().toISOString(),
            customerInfo: bookingData.customerInfo || {},
            ticketTypes: bookingData.ticketTypes || [],
            concessions: bookingData.concessions || []
          })
        } else {
          throw new Error(result.message || "Không thể lấy thông tin đặt vé")
        }
      } catch (error) {
        console.error("Error fetching booking info:", error)
        setError("Không thể lấy thông tin đặt vé: " + error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTicketInfo()
  }, [bookingId])

  const handleDownloadTicket = () => {
    // Tạo nội dung vé để download
    if (!ticketInfo) return
    
    const ticketContent = `
CINESTAR - VÉ XEM PHIM
========================
Mã đặt vé: ${ticketInfo.id}
Phim: ${ticketInfo.movie.title}
Rạp: ${ticketInfo.theater.name}
Ngày chiếu: ${new Date(ticketInfo.showtime.date).toLocaleDateString('vi-VN')}
Giờ chiếu: ${ticketInfo.showtime.time}
Ghế: ${ticketInfo.seats.join(', ')}
Tổng tiền: ${ticketInfo.totalPrice.toLocaleString('vi-VN')} VNĐ
Phương thức thanh toán: ${ticketInfo.paymentMethod}
Thời gian thanh toán: ${new Date(ticketInfo.paymentTime).toLocaleString('vi-VN')}

Vui lòng đến rạp trước giờ chiếu 15-30 phút.
Cảm ơn bạn đã sử dụng dịch vụ Cinestar!
    `;

    const blob = new Blob([ticketContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ve-xem-phim-${ticketInfo.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Có lỗi xảy ra</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => navigate("/")}>Về trang chủ</Button>
        </div>
      </div>
    )
  }

  // Kiểm tra trạng thái thanh toán từ URL params
  const isPaymentSuccessful = status === 'completed' || code === '00'

  if (!isPaymentSuccessful) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Thanh toán thất bại</h1>
          <p className="text-gray-400 mb-6">
            {message ? decodeURIComponent(message) : "Giao dịch không thành công. Vui lòng thử lại."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/")}>Về trang chủ</Button>
            <Button variant="outline" onClick={() => navigate(-1)}>Thử lại</Button>
          </div>
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

        {ticketInfo && (
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

              {transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Mã giao dịch:</span>
                  <span className="text-sm font-mono">{transactionId}</span>
                </div>
              )}

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
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Vé điện tử đã được gửi đến email của bạn.</p>
          <p className="mt-1">Vui lòng đến rạp trước giờ chiếu 15-30 phút.</p>
        </div>
      </div>
    </div>
  )
}