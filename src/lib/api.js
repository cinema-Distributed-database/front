// Mock data for movies
const mockMovies = [
  {
    id: "movie1",
    title: "Lật Mặt 7: Vòng Tay Nặng",
    originalTitle: "Face Off 7",
    poster: "/placeholder.svg?height=450&width=300&text=Lật Mặt 7",
    backdrop: "/placeholder.svg?height=600&width=1000&text=Lật Mặt 7 Backdrop",
    trailer: "https://www.youtube.com/watch?v=example1",
    description: "Phần mới nhất của series phim hành động Việt Nam ăn khách.",
    director: "Lý Hải",
    cast: ["Ốc Thanh Vân", "Huỳnh Đông", "Mạc Văn Khoa"],
    genre: "Hành động, Hài",
    duration: 132,
    releaseDate: "2024-04-26",
    ageRestriction: "13+",
    rating: 8.5,
  },
  {
    id: "movie2",
    title: "A Quiet Place: Day One",
    originalTitle: "A Quiet Place: Day One",
    poster: "/placeholder.svg?height=450&width=300&text=A Quiet Place",
    backdrop: "/placeholder.svg?height=600&width=1000&text=A Quiet Place Backdrop",
    trailer: "https://www.youtube.com/watch?v=example2",
    description: "Phần tiền truyện của loạt phim kinh dị nổi tiếng A Quiet Place.",
    director: "Michael Sarnoski",
    cast: ["Lupita Nyong'o", "Joseph Quinn", "Alex Wolff"],
    genre: "Kinh dị, Khoa học viễn tưởng",
    duration: 115,
    releaseDate: "2024-05-10",
    ageRestriction: "16+",
    rating: 7.8,
  },
  {
    id: "movie3",
    title: "Shin - Cậu Bé Bút Chì: Đại Chiến Siêu Năng Lực",
    originalTitle: "Crayon Shin-chan: Crash! Scribble Kingdom and Almost Four Heroes",
    poster: "/placeholder.svg?height=450&width=300&text=Shin",
    backdrop: "/placeholder.svg?height=600&width=1000&text=Shin Backdrop",
    trailer: "https://www.youtube.com/watch?v=example3",
    description: "Cuộc phiêu lưu mới của cậu bé bút chì Shin và những người bạn.",
    director: "Masakazu Hashimoto",
    cast: ["Akiko Yajima", "Miki Narahashi", "Keiji Fujiwara"],
    genre: "Hoạt hình, Hài",
    duration: 100,
    releaseDate: "2024-05-03",
    ageRestriction: "P",
    rating: 7.5,
  },
  {
    id: "movie4",
    title: "The Fall Guy",
    originalTitle: "The Fall Guy",
    poster: "/placeholder.svg?height=450&width=300&text=The Fall Guy",
    backdrop: "/placeholder.svg?height=600&width=1000&text=The Fall Guy Backdrop",
    trailer: "https://www.youtube.com/watch?v=example4",
    description: "Một diễn viên đóng thế phải trở thành một anh hùng thực sự khi phim trường xảy ra sự cố.",
    director: "David Leitch",
    cast: ["Ryan Gosling", "Emily Blunt", "Aaron Taylor-Johnson"],
    genre: "Hành động, Hài",
    duration: 126,
    releaseDate: "2024-05-03",
    ageRestriction: "13+",
    rating: 7.2,
  },
  {
    id: "movie5",
    title: "Kingdom of the Planet of the Apes",
    originalTitle: "Kingdom of the Planet of the Apes",
    poster: "/placeholder.svg?height=450&width=300&text=Planet of the Apes",
    backdrop: "/placeholder.svg?height=600&width=1000&text=Planet of the Apes Backdrop",
    trailer: "https://www.youtube.com/watch?v=example5",
    description:
      "Phần tiếp theo của loạt phim Hành Tinh Khỉ, diễn ra nhiều năm sau các sự kiện của War for the Planet of the Apes.",
    director: "Wes Ball",
    cast: ["Owen Teague", "Freya Allan", "Kevin Durand"],
    genre: "Khoa học viễn tưởng, Hành động",
    duration: 145,
    releaseDate: "2024-05-10",
    ageRestriction: "13+",
    rating: 8.0,
  },
  {
    id: "movie6",
    title: "Godzilla x Kong: Đế Chế Mới",
    originalTitle: "Godzilla x Kong: The New Empire",
    poster: "/placeholder.svg?height=450&width=300&text=Godzilla x Kong",
    backdrop: "/placeholder.svg?height=600&width=1000&text=Godzilla x Kong Backdrop",
    trailer: "https://www.youtube.com/watch?v=example6",
    description: "Hai quái vật huyền thoại Godzilla và Kong phải hợp tác để đối đầu với một mối đe dọa mới.",
    director: "Adam Wingard",
    cast: ["Rebecca Hall", "Brian Tyree Henry", "Dan Stevens"],
    genre: "Hành động, Khoa học viễn tưởng",
    duration: 115,
    releaseDate: "2024-03-29",
    ageRestriction: "13+",
    rating: 6.9,
  },
  {
    id: "movie7",
    title: "Furiosa: A Mad Max Saga",
    originalTitle: "Furiosa: A Mad Max Saga",
    poster: "/placeholder.svg?height=450&width=300&text=Furiosa",
    backdrop: "/placeholder.svg?height=600&width=1000&text=Furiosa Backdrop",
    trailer: "https://www.youtube.com/watch?v=example7",
    description: "Câu chuyện về nguồn gốc của nhân vật Furiosa từ bộ phim Mad Max: Fury Road.",
    director: "George Miller",
    cast: ["Anya Taylor-Joy", "Chris Hemsworth", "Tom Burke"],
    genre: "Hành động, Phiêu lưu",
    duration: 150,
    releaseDate: "2024-05-24",
    ageRestriction: "16+",
    rating: 8.7,
  },
  {
    id: "movie8",
    title: "Inside Out 2",
    originalTitle: "Inside Out 2",
    poster: "/placeholder.svg?height=450&width=300&text=Inside Out 2",
    backdrop: "/placeholder.svg?height=600&width=1000&text=Inside Out 2 Backdrop",
    trailer: "https://www.youtube.com/watch?v=example8",
    description: "Phần tiếp theo của bộ phim hoạt hình Inside Out của Pixar, khám phá thêm về cảm xúc của con người.",
    director: "Kelsey Mann",
    cast: ["Amy Poehler", "Phyllis Smith", "Lewis Black"],
    genre: "Hoạt hình, Hài, Gia đình",
    duration: 110,
    releaseDate: "2024-06-14",
    ageRestriction: "P",
    rating: 9.0,
  },
]

// Mock data for theaters
const mockTheaters = [
  {
    id: "theater1",
    name: "Cinestar Quang Trung",
    address: "45 Quang Trung, P.10, Q.Gò Vấp, TP.HCM",
    city: "Hồ Chí Minh",
    image: "/placeholder.svg?height=300&width=500&text=Cinestar Quang Trung",
    rooms: [
      { id: "room1", name: "Phòng 1", capacity: 120, type: "2D" },
      { id: "room2", name: "Phòng 2", capacity: 120, type: "2D" },
      { id: "room3", name: "Phòng 3", capacity: 100, type: "3D" },
      { id: "room4", name: "Phòng 4", capacity: 80, type: "2D" },
    ],
  },
  {
    id: "theater2",
    name: "Cinestar Hai Bà Trưng",
    address: "135 Hai Bà Trưng, P.Bến Nghé, Q.1, TP.HCM",
    city: "Hồ Chí Minh",
    image: "/placeholder.svg?height=300&width=500&text=Cinestar Hai Bà Trưng",
    rooms: [
      { id: "room5", name: "Phòng 1", capacity: 150, type: "2D" },
      { id: "room6", name: "Phòng 2", capacity: 150, type: "2D" },
      { id: "room7", name: "Phòng 3", capacity: 120, type: "3D" },
      { id: "room8", name: "Phòng 4", capacity: 100, type: "4DX" },
    ],
  },
  {
    id: "theater3",
    name: "Cinestar Satra Q6",
    address: "190-192 3/2, P.12, Q.10, TP.HCM",
    city: "Hồ Chí Minh",
    image: "/placeholder.svg?height=300&width=500&text=Cinestar Satra Q6",
    rooms: [
      { id: "room9", name: "Phòng 1", capacity: 130, type: "2D" },
      { id: "room10", name: "Phòng 2", capacity: 130, type: "2D" },
      { id: "room11", name: "Phòng 3", capacity: 110, type: "3D" },
      { id: "room12", name: "Phòng 4", capacity: 90, type: "2D" },
    ],
  },
]

// Mock data for showtimes
const generateShowtimes = () => {
  const showtimes = []
  const startTimes = ["10:00", "12:30", "15:00", "17:30", "20:00", "22:30"]
  const today = new Date()

  mockMovies.forEach((movie) => {
    mockTheaters.forEach((theater) => {
      theater.rooms.forEach((room) => {
        // Generate showtimes for the next 7 days
        for (let i = 0; i < 7; i++) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)
          const dateString = date.toISOString().split("T")[0]

          startTimes.forEach((startTime, index) => {
            // Not all movies show at all times
            if (Math.random() > 0.3) {
              const [hours, minutes] = startTime.split(":").map(Number)
              const startDate = new Date(date)
              startDate.setHours(hours, minutes)

              const endDate = new Date(startDate)
              endDate.setMinutes(endDate.getMinutes() + movie.duration)
              const endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`

              showtimes.push({
                id: `showtime-${movie.id}-${theater.id}-${room.id}-${dateString}-${index}`,
                movieId: movie.id,
                theaterId: theater.id,
                roomId: room.id,
                startTime: startTime,
                endTime: endTime,
                date: dateString,
                price: room.type === "2D" ? 90000 : room.type === "3D" ? 120000 : 150000,
                availableSeats: Math.floor(Math.random() * room.capacity),
                totalSeats: room.capacity,
              })
            }
          })
        }
      })
    })
  })

  return showtimes
}

const mockShowtimes = generateShowtimes()

// API functions
export async function fetchMovies() {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockMovies)
    }, 500)
  })
}

export async function fetchMovie(id) {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const movie = mockMovies.find((m) => m.id === id) || null
      resolve(movie)
    }, 500)
  })
}

export async function fetchTheaters() {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTheaters)
    }, 500)
  })
}

export async function fetchTheater(id) {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const theater = mockTheaters.find((t) => t.id === id) || null
      resolve(theater)
    }, 500)
  })
}

export async function fetchShowtimes(filters = {}) {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredShowtimes = [...mockShowtimes]

      if (filters.movieId) {
        filteredShowtimes = filteredShowtimes.filter((s) => s.movieId === filters.movieId)
      }

      if (filters.theaterId) {
        filteredShowtimes = filteredShowtimes.filter((s) => s.theaterId === filters.theaterId)
      }

      if (filters.date) {
        filteredShowtimes = filteredShowtimes.filter((s) => s.date === filters.date)
      }

      resolve(filteredShowtimes)
    }, 500)
  })
}

export async function fetchSeats(showTimeId) {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const showtime = mockShowtimes.find((s) => s.id === showTimeId)
      if (!showtime) {
        resolve([])
        return
      }

      const theater = mockTheaters.find((t) => t.id === showtime.theaterId)
      if (!theater) {
        resolve([])
        return
      }

      const room = theater.rooms.find((r) => r.id === showtime.roomId)
      if (!room) {
        resolve([])
        return
      }

      const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]
      const seatsPerRow = Math.ceil(room.capacity / rows.length)

      const seats = []
      let seatCount = 0

      for (const row of rows) {
        for (let i = 1; i <= seatsPerRow; i++) {
          if (seatCount >= room.capacity) break

          const isVip = row >= "D" && row <= "G" && i >= 3 && i <= seatsPerRow - 2
          const isCouple = row === "K" && i % 2 === 1
          const isDisabled = row === "A" && (i === 1 || i === seatsPerRow)

          const seatType = isVip ? "vip" : isCouple ? "couple" : isDisabled ? "disabled" : "standard"
          const seatPrice = isVip ? showtime.price * 1.2 : isCouple ? showtime.price * 1.5 : showtime.price

          // Randomly mark some seats as reserved
          const randomStatus = Math.random()
          const status = randomStatus < 0.3 ? "reserved" : "available"

          seats.push({
            id: `${row}${i}`,
            row,
            number: i,
            type: seatType,
            status: status,
            price: Math.round(seatPrice),
          })

          seatCount++
        }
      }

      resolve(seats)
    }, 500)
  })
}

export async function createBooking(data) {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const showtime = mockShowtimes.find((s) => s.id === data.showTimeId)
      if (!showtime) {
        throw new Error("Showtime not found")
      }

      const booking = {
        id: `booking-${Date.now()}`,
        userId: data.userId || "guest-user",
        showTimeId: data.showTimeId,
        seats: data.seats,
        totalPrice: 0, // Will be calculated
        bookingTime: new Date().toISOString(),
        status: "pending",
      }

      resolve(booking)
    }, 500)
  })
}

// Sửa hàm processPayment để sử dụng ghế đã chọn thực tế
export async function processPayment(bookingId, paymentMethod, selectedSeats) {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // For VNPAY, we would normally redirect to their payment gateway
      // Here we're just simulating a successful payment
      console.log(`Processing payment via ${paymentMethod} for booking ${bookingId}`)

      const booking = {
        id: bookingId,
        userId: "guest-user",
        showTimeId: "showtime-1",
        seats: selectedSeats || ["A1", "A2"], // Sử dụng ghế đã chọn thực tế
        totalPrice: selectedSeats ? selectedSeats.length * 90000 : 180000, // Tính giá dựa trên số ghế
        bookingTime: new Date().toISOString(),
        status: "confirmed",
        paymentMethod,
        paymentStatus: "completed",
      }

      resolve(booking)
    }, 1000)
  })
}

// Chức năng tìm rạp chiếu gần đây
export async function fetchNearbyTheaters(latitude, longitude, distance = 10.0) {
  // Trong môi trường thực tế, đây sẽ là API call đến backend
  // Backend sẽ sử dụng MongoDB geospatial queries để tìm rạp gần đó
  
  // Giả lập API call đến backend
  return new Promise((resolve) => {
    setTimeout(() => {
      // Trong thực tế, request sẽ như sau:
      // const response = await fetch(`/api/theaters/nearby?lat=${latitude}&lng=${longitude}&distance=${distance}`);
      // const data = await response.json();
      // return data;
      
      // Mock response từ backend (đã được sắp xếp theo khoảng cách)
      const mockNearbyTheaters = [
        {
          id: "theater1",
          name: "Cinestar Quang Trung",
          address: "45 Quang Trung, P.10, Q.Gò Vấp, TP.HCM",
          city: "Hồ Chí Minh",
          image: "/placeholder.svg?height=300&width=500&text=Cinestar Quang Trung",
          distance: 2.5, // Backend đã tính toán khoảng cách
          location: { lat: 10.772, lng: 106.698 },
          rooms: [
            { id: "room1", name: "Phòng 1", capacity: 120, type: "2D" },
            { id: "room2", name: "Phòng 2", capacity: 120, type: "2D" },
            { id: "room3", name: "Phòng 3", capacity: 100, type: "3D" },
            { id: "room4", name: "Phòng 4", capacity: 80, type: "2D" },
          ],
        },
        {
          id: "theater2",
          name: "Cinestar Hai Bà Trưng",
          address: "135 Hai Bà Trưng, P.Bến Nghé, Q.1, TP.HCM",
          city: "Hồ Chí Minh",
          image: "/placeholder.svg?height=300&width=500&text=Cinestar Hai Bà Trưng",
          distance: 4.8, // Backend đã tính toán khoảng cách
          location: { lat: 10.773, lng: 106.701 },
          rooms: [
            { id: "room5", name: "Phòng 1", capacity: 150, type: "2D" },
            { id: "room6", name: "Phòng 2", capacity: 150, type: "2D" },
            { id: "room7", name: "Phòng 3", capacity: 120, type: "3D" },
            { id: "room8", name: "Phòng 4", capacity: 100, type: "4DX" },
          ],
        },
        {
          id: "theater3",
          name: "Cinestar Satra Q6",
          address: "190-192 3/2, P.12, Q.10, TP.HCM",
          city: "Hồ Chí Minh",
          image: "/placeholder.svg?height=300&width=500&text=Cinestar Satra Q6",
          distance: 8.2, // Backend đã tính toán khoảng cách
          location: { lat: 10.743, lng: 106.628 },
          rooms: [
            { id: "room9", name: "Phòng 1", capacity: 130, type: "2D" },
            { id: "room10", name: "Phòng 2", capacity: 130, type: "2D" },
            { id: "room11", name: "Phòng 3", capacity: 110, type: "3D" },
            { id: "room12", name: "Phòng 4", capacity: 90, type: "2D" },
          ],
        }
      ];
      
      // Lọc rạp trong phạm vi distance và đã được sắp xếp bởi backend
      const nearbyTheaters = mockNearbyTheaters.filter(theater => theater.distance <= distance);
      
      resolve(nearbyTheaters);
    }, 500);
  });
}