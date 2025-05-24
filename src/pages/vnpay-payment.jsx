"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card"

export default function VNPayPayment({ bookingId, amount, seats, onSuccess, onCancel }) {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(180) // 3 minutes countdown
  const [paymentStatus, setPaymentStatus] = useState("pending") // pending, success, failed

  useEffect(() => {
    // Simulate payment process
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setPaymentStatus("failed")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleCompletePayment = () => {
    setPaymentStatus("success")
    setTimeout(() => {
      // Truyền thông tin ghế vào URL khi chuyển hướng
      onSuccess && onSuccess(seats)
    }, 1500)
  }

  const handleCancelPayment = () => {
    if (window.confirm("Bạn có chắc muốn hủy thanh toán?")) {
      onCancel && onCancel()
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (paymentStatus === "success") {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
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
        <h2 className="text-2xl font-bold mb-4">Thanh toán thành công!</h2>
        <p className="text-gray-400 mb-6">Cảm ơn bạn đã sử dụng dịch vụ của Cinestar</p>
        <Button onClick={() => navigate("/")}>Quay lại trang chủ</Button>
      </div>
    )
  }

  if (paymentStatus === "failed") {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-6">
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
        <h2 className="text-2xl font-bold mb-4">Thanh toán thất bại</h2>
        <p className="text-gray-400 mb-6">Thời gian thanh toán đã hết. Vui lòng thử lại.</p>
        <div className="flex gap-4">
          <Button onClick={() => navigate("/")}>Quay lại trang chủ</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900 border-gray-800">
      <CardHeader className="text-center">
        <img src="/placeholder.svg?height=60&width=120&text=VNPAY" alt="VNPAY" className="h-15 mx-auto mb-4" />
        <CardTitle>Thanh toán qua VNPAY</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Mã đơn hàng:</span>
            <span className="font-medium">{bookingId}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Số tiền:</span>
            <span className="font-bold text-yellow-500">{amount.toLocaleString("vi-VN")} VNĐ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Thời gian còn lại:</span>
            <span className={`font-medium ${countdown < 60 ? "text-red-500" : "text-white"}`}>
              {formatTime(countdown)}
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400 mb-4">Quét mã QR bằng ứng dụng ngân hàng hoặc ví VNPAY</p>
          <div className="bg-white p-4 rounded-lg inline-block">
            <img src="/placeholder.svg?height=200&width=200&text=QR+Code" alt="QR Code" className="w-48 h-48 mx-auto" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Hướng dẫn thanh toán:</h3>
          <ol className="list-decimal list-inside text-sm space-y-1 text-gray-300">
            <li>Mở ứng dụng ngân hàng hoặc ví VNPAY</li>
            <li>Quét mã QR</li>
            <li>Xác nhận thông tin và thanh toán</li>
            <li>Hoàn tất giao dịch</li>
          </ol>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleCompletePayment}>
          Tôi đã thanh toán
        </Button>
        <Button variant="outline" className="w-full" onClick={handleCancelPayment}>
          Hủy thanh toán
        </Button>
      </CardFooter>
    </Card>
  )
}