import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

export default function MovieCard({ movie }) {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden group">
      <Link to={`/movies/${movie.id}`}>
        <div className="relative">
          <img
            src={movie.poster || "/placeholder.svg"}
            alt={movie.title}
            className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {movie.ageRestriction && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              {movie.ageRestriction}
            </div>
          )}

          {movie.isComingSoon && <Badge className="absolute top-2 right-2 bg-purple-600">Sắp chiếu</Badge>}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="text-lg font-bold mb-1">{movie.title}</h3>
            <p className="text-sm text-gray-300 mb-2">{movie.genre}</p>
            <p className="text-sm text-gray-300 mb-4">
              <span className="font-bold">Thời lượng:</span> {movie.duration} phút
            </p>

            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
              {movie.isComingSoon ? "Xem chi tiết" : "Mua vé ngay"}
            </Button>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <h3 className="text-lg font-bold mb-1 line-clamp-1">{movie.title}</h3>
        <p className="text-sm text-gray-400 mb-3 line-clamp-1">{movie.genre}</p>

        <div className="flex justify-between">
          <Link to={`/movies/${movie.id}`}>
            <Button variant="outline" size="sm">
              Chi tiết
            </Button>
          </Link>

          {!movie.isComingSoon && (
            <Link to={`/booking?movie=${movie.id}`}>
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                Mua vé
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}