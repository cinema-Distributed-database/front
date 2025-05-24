import { Link } from "react-router-dom"
import { Facebook, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0a1426] text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">CINESTAR</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-purple-400">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-purple-400">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-purple-400">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-purple-400">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">THÔNG TIN</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/theaters" className="hover:text-purple-400">
                  Hệ thống rạp
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-purple-400">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link to="/promotions" className="hover:text-purple-400">
                  Khuyến mãi
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-purple-400">
                  Tuyển dụng
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">LIÊN HỆ</h3>
            <ul className="space-y-2">
              <li>Hotline: 028 7300 8881</li>
              <li>Email: cskh@cinestar.com.vn</li>
              <li>Địa chỉ: Tầng 5, TTTM Platinum Plaza, 634 Âu Cơ, P.10, Q.Tân Bình, TP.HCM</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">KẾT NỐI VỚI CHÚNG TÔI</h3>
            <div className="flex gap-4 mb-6">
              <Link to="https://facebook.com" className="hover:text-purple-400">
                <Facebook />
              </Link>
              <Link to="https://instagram.com" className="hover:text-purple-400">
                <Instagram />
              </Link>
              <Link to="https://youtube.com" className="hover:text-purple-400">
                <Youtube />
              </Link>
            </div>

            <h3 className="text-lg font-bold mb-4">TẢI ỨNG DỤNG</h3>
            <div className="flex gap-4">
              <Link to="#">
                <img src="/placeholder.svg?height=40&width=120" alt="App Store" width={120} height={40} />
              </Link>
              <Link to="#">
                <img src="/placeholder.svg?height=40&width=120" alt="Google Play" width={120} height={40} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-sm">
          <p>© 2024 CINESTAR. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
