"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, MapPin, Home } from 'lucide-react'
import { Button } from "./ui/button"

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleFindNearbyTheaters = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        navigate(`/theaters?lat=${latitude}&lng=${longitude}`);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        
        let errorMessage = "Đã xảy ra lỗi không xác định khi định vị.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Bạn đã từ chối quyền truy cập vị trí. Vui lòng cấp quyền trong cài đặt trình duyệt để sử dụng tính năng này.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Không thể xác định vị trí của bạn. Vui lòng kiểm tra kết nối mạng và đảm bảo dịch vụ định vị đã được bật.";
            break;
          case error.TIMEOUT:
            errorMessage = "Yêu cầu vị trí đã hết thời gian chờ. Vui lòng thử lại.";
            break;
          default:
            // Cung cấp thông báo gợi ý chung chung hơn
            errorMessage = "Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập vị trí cho trình duyệt và đảm bảo bạn có kết nối mạng ổn định.";
            break;
        }
        // alert(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };
  
  return (
    <header className="w-full">

      <div className="bg-[#0a1426] text-white py-3 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <img src="https://cinestar.com.vn/_next/image/?url=%2Fassets%2Fimages%2Fheader-logo.png&w=1920&q=75" alt="Cinestar" width={160} height={40} className="mr-4" />
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="flex items-center gap-1 text-sm hover:text-purple-400">
                <Home size={16} />
                <span>Trang chủ</span>
              </Link>
              <Link to="/theaters" className="flex items-center gap-1 text-sm hover:text-purple-400">
                <span>Chọn rạp</span>
              </Link>
              <button
                onClick={handleFindNearbyTheaters}
                className="flex items-center gap-1 text-sm hover:text-purple-400 ml-4"
                disabled={isLocating}
              >
                <MapPin size={16} />
                <span>{isLocating ? "Đang định vị..." : "Rạp gần đây"}</span>
              </button>
              <Link to="/showtimes" className="flex items-center gap-1 text-sm hover:text-purple-400">
                <span>Lịch chiếu</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <input
                type="search"
                placeholder="Tìm phim, rạp"
                className="w-64 rounded-full bg-white text-black pr-8 px-4 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                <Search size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-[#0a1426] py-2 px-4 flex justify-center gap-4">
        <Link to="/book-ticket">
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">ĐẶT VÉ NGAY</Button>
        </Link>
        <Link to="/book-food">
          <Button className="bg-purple-700 hover:bg-purple-800 text-white font-bold">ĐẶT ĐỒ NƯỚC</Button>
        </Link>
      </div>
    </header>
  )
}