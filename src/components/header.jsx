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

    // Hiển thị thông báo đang tìm kiếm
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Chuyển hướng đến trang theaters với tham số vị trí
        navigate(`/theaters?lat=${latitude}&lng=${longitude}`);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("Người dùng từ chối truy cập vị trí.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Thông tin vị trí không khả dụng.");
            break;
          case error.TIMEOUT:
            alert("Yêu cầu vị trí đã hết thời gian chờ.");
            break;
          default:
            alert("Đã xảy ra lỗi không xác định khi định vị.");
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <header className="w-full">
      <div className="bg-purple-700 text-white py-2 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img
            src="/placeholder.svg?height=32&width=32"
            alt="Cinestar App"
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="text-sm">Tải ứng dụng Cinestar Cinemas: Tra cứu lịch chiếu và đặt vé siêu nhanh</span>
        </div>
        <Button variant="outline" size="sm" className="text-white border-white hover:bg-purple-600">
          Mở
        </Button>
      </div>

      <div className="bg-[#0a1426] text-white py-3 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <img src="/placeholder.svg?height=40&width=160" alt="Cinestar" width={160} height={40} className="mr-4" />
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

            <div className="relative">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <span className="rounded-full overflow-hidden w-5 h-5 flex items-center justify-center bg-red-600 text-[10px]">
                  VN
                </span>
                <span>VN</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-[#0a1426] text-white border-t border-gray-800">
        <div className="container mx-auto flex justify-between">
          <div className="flex">
            <Link to="/" className="px-4 py-2 text-sm hover:text-purple-400 flex items-center gap-1">
              <Home size={14} />
              <span>Trang chủ</span>
            </Link>
            <Link to="/theaters" className="px-4 py-2 text-sm hover:text-purple-400">
              Chọn rạp
            </Link>
            <button
              onClick={handleFindNearbyTheaters}
              className="px-4 py-2 text-sm hover:text-purple-400 flex items-center gap-1 md:hidden"
              disabled={isLocating}
            >
              <MapPin size={14} />
              <span>{isLocating ? "Đang định vị..." : "Rạp gần đây"}</span>
            </button>
            <Link to="/showtimes" className="px-4 py-2 text-sm hover:text-purple-400">
              Lịch chiếu
            </Link>
          </div>
          <div className="flex">
            <Link to="/promotions" className="px-4 py-2 text-sm hover:text-purple-400">
              Khuyến mãi
            </Link>
            <Link to="/events" className="px-4 py-2 text-sm hover:text-purple-400">
              Thuê sự kiện
            </Link>
            <Link to="/benefits" className="px-4 py-2 text-sm hover:text-purple-400">
              Tôi có các giải trí
            </Link>
            <Link to="/about" className="px-4 py-2 text-sm hover:text-purple-400">
              Giới thiệu
            </Link>
          </div>
        </div>
      </nav>

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