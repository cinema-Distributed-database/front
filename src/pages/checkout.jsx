// src/pages/checkout.jsx

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import {
  fetchShowtime,
  fetchMovie,
  fetchTheater,
  fetchRoom,
  fetchConcessionsByCinema, 
  holdSeats,
  releaseSeats,
  createBooking,
  createVNPayPaymentUrl,
  handleApiError
} from "../lib/api";
import { PlusCircle, MinusCircle } from "lucide-react";

// Component CountdownTimer giữ nguyên
const CountdownTimer = ({ onTimeout, initialSeconds = 300 }) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    useEffect(() => {
        if (seconds <= 0) {
            onTimeout();
            return;
        }
        const timer = setInterval(() => setSeconds(s => s - 1), 1000);
        return () => clearInterval(timer);
    }, [seconds, onTimeout]);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return (
        <div className="text-center p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-lg">Ghế của bạn đang được giữ. Vui lòng hoàn tất thanh toán trong:</p>
            <p className="text-4xl font-bold text-yellow-400 my-2">
                {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
            </p>
        </div>
    );
};


export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const showTimeId = searchParams.get("showtime");
  // LẤY CHUỖI PARAM THAY VÌ MẢNG
  const seatsParam = searchParams.get("seats");
  // TẠO MẢNG SEATIDS TỪ CHUỖI NÀY, NÓ SẼ ĐƯỢC DÙNG TRONG JSX
  const seatIds = seatsParam?.split(',') || [];

  const [step, setStep] = useState('info'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [movie, setMovie] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [theater, setTheater] = useState(null);
  const [room, setRoom] = useState(null);
  const [concessions, setConcessions] = useState([]);
  
  const [customerInfo, setCustomerInfo] = useState({ fullName: "", phone: "", email: "" });
  const [selectedConcessions, setSelectedConcessions] = useState({});

  const handleConcessionChange = (itemId, change) => {
    setSelectedConcessions(prev => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + change);
      const newSelected = { ...prev };
      if (newQty > 0) newSelected[itemId] = newQty;
      else delete newSelected[itemId];
      return newSelected;
    });
  };

  const calculateTotalPrice = useCallback(() => {
    const ticketPrice = showtime?.price || 90000;
    const ticketsTotal = (seatIds.length * ticketPrice);
    const concessionsTotal = Object.entries(selectedConcessions).reduce((total, [itemId, quantity]) => {
      const item = concessions.find(c => c.id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
    return ticketsTotal + concessionsTotal;
  }, [seatIds, showtime, concessions, selectedConcessions]);
  
  // SỬA LỖI VÒNG LẶP VÔ HẠN
  useEffect(() => {
    // Chúng ta sẽ kiểm tra `seatsParam` (chuỗi) thay vì `seatIds` (mảng)
    if (!showTimeId || !seatsParam) {
      navigate("/");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const showtimeData = await fetchShowtime(showTimeId);
        if (!showtimeData || !showtimeData.cinemaId) {
            throw new Error("Dữ liệu Showtime không hợp lệ hoặc thiếu cinemaId.");
        }
        setShowtime(showtimeData);
        
        const [movieData, theaterData, roomData, concessionsData] = await Promise.all([
          fetchMovie(showtimeData.movieId),
          fetchTheater(showtimeData.cinemaId),
          fetchRoom(showtimeData.roomId),
          fetchConcessionsByCinema(showtimeData.cinemaId) 
        ]);
        
        setMovie(movieData);
        setTheater(theaterData);
        setRoom(roomData);
        setConcessions(concessionsData || []);
      } catch (error) {
        const err = handleApiError(error, "Không thể tải thông tin thanh toán.");
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // THAY ĐỔI QUAN TRỌNG: DÙNG `seatsParam` LÀ PHỤ THUỘC THAY VÌ `seatIds`
  }, [showTimeId, seatsParam, navigate]);
  
  const handleHoldTimeout = useCallback(async () => {
      alert("Đã hết thời gian giữ ghế. Vui lòng thực hiện lại việc đặt vé.");
      if (movie?.id) {
        await releaseSeats(showTimeId, seatIds);
        navigate(`/movies/${movie.id}`);
      } else {
        navigate('/');
      }
  }, [showTimeId, seatIds, movie, navigate]);

  const handleProceedToPayment = async () => {
    if (!customerInfo.fullName || !customerInfo.phone) {
        alert("Vui lòng nhập đầy đủ Họ tên và Số điện thoại.");
        return;
    }

    setLoading(true);
    try {
        await holdSeats(showTimeId, seatIds, customerInfo.phone);
        
        const formattedConcessions = Object.entries(selectedConcessions).map(([itemId, quantity]) => ({ itemId, quantity }));
        const ticketPrice = showtime?.price || 90000;
        const bookingPayload = {
            showtimeId: showTimeId,
            customerInfo: customerInfo,
            seats: seatIds,
            ticketTypes: [{ type: "Người lớn", quantity: seatIds.length, pricePerTicket: ticketPrice }],
            concessions: formattedConcessions
        };

        const bookingResponse = await createBooking(bookingPayload);
        if (!bookingResponse || !bookingResponse.id) {
            throw new Error("Không thể tạo booking trên hệ thống.");
        }

        const paymentResponse = await createVNPayPaymentUrl(bookingResponse.id);
        
        if (paymentResponse && paymentResponse.paymentUrl) {
            setStep('payment'); 
            window.location.href = paymentResponse.paymentUrl;
        } else {
            throw new Error("Không thể tạo link thanh toán VNPay.");
        }
    } catch (error) {
        const err = handleApiError(error);
        alert(`Đã xảy ra lỗi: ${err.message}`);
        setLoading(false);
        await releaseSeats(showTimeId, seatIds);
    }
  };


  if (loading && step === 'info') return <div className="text-center p-10">Đang tải thông tin thanh toán...</div>;
  
  if (error) return <div className="text-center p-10 text-red-400 bg-red-900/50 rounded-lg">
      <h2 className="font-bold text-xl mb-2">Đã có lỗi xảy ra</h2>
      <p>{error}</p>
      <Button onClick={() => navigate('/')} className="mt-4">Quay về trang chủ</Button>
    </div>;
  
  if (!movie || !showtime || !theater) return null;

  // JSX giữ nguyên, không cần thay đổi
  return (
    <div className="bg-[#0a1426] text-white min-h-screen py-8">
      <div className="container mx-auto px-4">
        {step === 'payment' && <CountdownTimer onTimeout={handleHoldTimeout} />}
        
        <div className="flex flex-col lg:flex-row gap-8 mt-4">
            <div className="w-full lg:w-2/3">
                <div className="bg-gray-800 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-bold mb-4">Thông tin khách hàng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Họ và tên *" value={customerInfo.fullName} onChange={(e) => setCustomerInfo(p => ({...p, fullName: e.target.value}))} className="w-full p-3 bg-gray-700 text-white rounded-md" />
                        <input type="tel" placeholder="Số điện thoại *" value={customerInfo.phone} onChange={(e) => setCustomerInfo(p => ({...p, phone: e.target.value}))} className="w-full p-3 bg-gray-700 text-white rounded-md" />
                        <input type="email" placeholder="Email (để nhận vé)" value={customerInfo.email} onChange={(e) => setCustomerInfo(p => ({...p, email: e.target.value}))} className="w-full p-3 bg-gray-700 text-white rounded-md md:col-span-2" />
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-bold mb-4">Chọn bắp nước</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {concessions.map(item => (
                            <div key={item.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img src={item.image || "/images/placeholder.png"} alt={item.name} className="w-16 h-16 rounded-md object-cover bg-gray-700" />
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-yellow-400">{item.price.toLocaleString('vi-VN')} VNĐ</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button size="icon" variant="ghost" onClick={() => handleConcessionChange(item.id, -1)} className="w-8 h-8 rounded-full"><MinusCircle size={20} /></Button>
                                    <span className="w-8 text-center font-bold text-lg">{selectedConcessions[item.id] || 0}</span>
                                    <Button size="icon" variant="ghost" onClick={() => handleConcessionChange(item.id, 1)} className="w-8 h-8 rounded-full"><PlusCircle size={20} /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/3">
                <Card className="bg-gray-900 border-gray-800 sticky top-4">
                    <CardHeader><CardTitle>Tóm tắt đơn hàng</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                          <img src={movie.poster} alt={movie.title} width={80} height={120} className="rounded-md object-cover" />
                          <div>
                            <h3 className="font-bold">{movie.title}</h3>
                            <p className="text-sm text-gray-400">{theater.name} | {room?.name}</p>
                            <p className="text-sm text-gray-400">{new Date(showtime.showDateTime).toLocaleString('vi-VN')}</p>
                          </div>
                        </div>
                        <Separator/>
                        <div>
                            <p className="flex justify-between"><span>Vé {movie.title} (x{seatIds.length})</span> <span>{((showtime?.price || 0) * seatIds.length).toLocaleString('vi-VN')} VNĐ</span></p>
                            <p className="text-sm text-gray-400">Ghế: {seatIds.join(', ')}</p>
                        </div>
                        {Object.keys(selectedConcessions).length > 0 && ( <> <Separator/> <div> {Object.entries(selectedConcessions).map(([itemId, quantity]) => { const item = concessions.find(c => c.id === itemId); if (!item) return null; return <p key={itemId} className="flex justify-between"><span>{item.name} (x{quantity})</span> <span>{(item.price * quantity).toLocaleString('vi-VN')} VNĐ</span></p> })} </div> </> )}
                        <Separator/>
                        <div className="flex justify-between font-bold text-xl">
                            <span>TỔNG CỘNG</span>
                            <span className="text-yellow-500">{calculateTotalPrice().toLocaleString("vi-VN")} VNĐ</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold" onClick={handleProceedToPayment} disabled={loading}>
                          {loading ? 'Đang xử lý...' : 'Xác nhận và Thanh toán'}
                      </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}