// src/pages/payment-success.jsx

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { handleApiError } from "../lib/api";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ticketInfo, setTicketInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy các tham số từ URL
  const bookingId = searchParams.get("bookingId"); // Mã booking của chúng ta
  const vnp_ResponseCode = searchParams.get("vnp_ResponseCode"); // Mã trả về từ VNPay, '00' là thành công
  const vnp_TransactionStatus = searchParams.get("vnp_TransactionStatus"); // '00' là thành công
  const vnp_TxnRef = searchParams.get("vnp_TxnRef"); // Mã giao dịch của chúng ta (thường là bookingId)
  const vnp_TransactionNo = searchParams.get("vnp_TransactionNo"); // Mã giao dịch của VNPay

  const isPaymentSuccessful = vnp_ResponseCode === '00' && vnp_TransactionStatus === '00';

  useEffect(() => {
    // Chỉ fetch thông tin nếu có bookingId và thanh toán thành công
    if (bookingId && isPaymentSuccessful) {
      const fetchTicketInfo = async () => {
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:8080/api/bookings/by-code/${bookingId}`);
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || `HTTP error! status: ${response.status}`);
          }
          const result = await response.json();
          
          if (result.success && result.data) {
            setTicketInfo(result.data);
          } else {
            throw new Error(result.message || "Không thể lấy thông tin đặt vé");
          }
        } catch (apiError) {
          const err = handleApiError(apiError);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchTicketInfo();
    } else {
      // Xử lý trường hợp không có bookingId hoặc thanh toán thất bại
      if (!isPaymentSuccessful) {
        setError("Giao dịch thanh toán không thành công hoặc đã bị hủy.");
      } else {
        setError("Thiếu thông tin đặt vé để hiển thị.");
      }
      setLoading(false);
    }
  }, [bookingId, isPaymentSuccessful]);

  if (loading) {
    return <div className="text-center p-10">Đang xử lý kết quả thanh toán...</div>;
  }

  if (error || !isPaymentSuccessful) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Thanh toán không thành công</h1>
          <p className="text-gray-400 mb-6">{error || "Giao dịch đã bị hủy hoặc gặp sự cố."}</p>
          <Button onClick={() => navigate("/")}>Về trang chủ</Button>
        </div>
      </div>
    );
  }

  if (!ticketInfo) {
    return <div className="text-center p-10">Không tìm thấy thông tin vé.</div>;
  }
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Thanh toán thành công!</h1>
          <p className="text-gray-400 mt-2">Cảm ơn bạn đã đặt vé tại Cinestar</p>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center border-b border-gray-800 pb-4"><CardTitle>Thông tin vé</CardTitle></CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="flex justify-between"><span>Mã đặt vé:</span><span className="font-bold">{ticketInfo.confirmationCode}</span></p>
            <Separator />
            <div>
              <h3 className="font-bold text-lg mb-1">{ticketInfo.movieTitle}</h3>
              <p className="text-sm text-gray-400">{ticketInfo.cinemaName}</p>
              <p className="text-sm text-gray-400">Ngày: {new Date(ticketInfo.showDateTime).toLocaleDateString("vi-VN")}, Giờ: {new Date(ticketInfo.showDateTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit'})}</p>
            </div>
            <Separator />
            <p className="flex justify-between"><span>Ghế:</span> <span>{ticketInfo.seats.join(", ")}</span></p>
            {ticketInfo.concessions.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-gray-400 mb-1">Bắp nước:</p>
                  {ticketInfo.concessions.map(c => <p key={c.itemId} className="flex justify-between text-sm ml-2"><span>{c.name} (x{c.quantity})</span><span>{(c.price * c.quantity).toLocaleString('vi-VN')} VNĐ</span></p>)}
                </div>
              </>
            )}
            <Separator />
            <p className="flex justify-between"><span>Mã giao dịch VNPay:</span> <span className="text-sm">{vnp_TransactionNo}</span></p>
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng tiền:</span>
              <span className="text-yellow-500">{ticketInfo.totalPrice.toLocaleString("vi-VN")} VNĐ</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button variant="outline" className="w-full" onClick={() => navigate("/")}>Về trang chủ</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}