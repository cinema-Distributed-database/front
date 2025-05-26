import axios from 'axios';

// Cấu hình base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor để xử lý response
apiClient.interceptors.response.use(
  (response) => {
    // Trả về data từ response wrapper
    return response.data.data || response.data;
  },
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

// ===== MOVIE API =====
export async function fetchMovies() {
  try {
    const response = await apiClient.get('/movies');
    return response.content || response;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
}

export async function fetchMovie(id) {
  try {
    return await apiClient.get(`/movies/${id}`);
  } catch (error) {
    console.error('Error fetching movie:', error);
    return null;
  }
}

// ===== THEATER API =====
export async function fetchTheaters() {
  try {
    const response = await apiClient.get('/cinemas');
    return response.content || response;
  } catch (error) {
    console.error('Error fetching theaters:', error);
    return [];
  }
}

export async function fetchTheater(id) {
  try {
    return await apiClient.get(`/cinemas/${id}`);
  } catch (error) {
    console.error('Error fetching theater:', error);
    return null;
  }
}

export async function fetchNearbyTheaters(latitude, longitude, distance = 10.0) {
  try {
    return await apiClient.get(`/cinemas/nearby?lat=${latitude}&lng=${longitude}&radius=${distance}`);
  } catch (error) {
    console.error('Error fetching nearby theaters:', error);
    return [];
  }
}

// ===== SHOWTIME API =====
export async function fetchShowtimes(filters = {}) {
  try {
    const { movieId, theaterId, date } = filters;
    const params = new URLSearchParams();
    
    if (movieId) params.append('movieId', movieId);
    if (theaterId) params.append('cinemaId', theaterId);
    if (date) params.append('date', date);
    
    return await apiClient.get(`/showtimes?${params}`);
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    return [];
  }
}

// ===== SEAT API =====
export async function fetchSeats(showTimeId) {
  try {
    const response = await apiClient.get(`/seats/showtime/${showTimeId}`);
    
    // Chuyển đổi format từ backend sang format frontend
    const seats = [];
    if (response.seatStatus) {
      Object.entries(response.seatStatus).forEach(([seatId, seatData]) => {
        const [row, number] = [seatId.charAt(0), seatId.slice(1)];
        seats.push({
          id: seatId,
          row: row,
          number: parseInt(number),
          type: 'standard', // Có thể điều chỉnh dựa trên logic của bạn
          status: seatData.status === 'available' ? 'available' : 
                  seatData.status === 'holding' ? 'reserved' : 
                  seatData.status === 'booked' ? 'reserved' : 'unavailable',
          price: 90000 // Giá mặc định, có thể lấy từ showtime pricing
        });
      });
    }
    
    return seats;
  } catch (error) {
    console.error('Error fetching seats:', error);
    return [];
  }
}

export async function holdSeats(showtimeId, seatIds, customerPhone) {
  try {
    await apiClient.post('/seats/hold', {
      showtimeId,
      seatIds,
      customerPhone
    });
    return true;
  } catch (error) {
    console.error('Error holding seats:', error);
    throw error;
  }
}

export async function releaseSeats(showtimeId, seatIds) {
  try {
    await apiClient.delete('/seats/release', {
      data: {
        showtimeId,
        seatIds
      }
    });
    return true;
  } catch (error) {
    console.error('Error releasing seats:', error);
    return false;
  }
}

// ===== BOOKING API =====
export async function createBooking(data) {
  try {
    const bookingData = {
      showtimeId: data.showTimeId,
      customerInfo: {
        fullName: data.customerInfo?.fullName || "Guest User",
        phone: data.customerInfo?.phone || "0000000000",
        email: data.customerInfo?.email || "guest@example.com"
      },
      seats: data.seats,
      ticketTypes: data.ticketTypes || [
        {
          type: "Người lớn",
          quantity: data.seats.length,
          pricePerTicket: 90000
        }
      ],
      concessions: data.concessions || []
    };

    return await apiClient.post('/bookings', bookingData);
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

export async function processPayment(bookingId, paymentMethod, selectedSeats) {
  try {
    if (paymentMethod === 'vnpay') {
      // Tạo URL thanh toán VNPay
      const paymentResponse = await apiClient.post('/payments/vnpay/create', {
        bookingId,
        returnUrl: `${window.location.origin}/payment-success`
      });
      
      // Chuyển hướng đến VNPay
      if (paymentResponse.success && paymentResponse.paymentUrl) {
        window.location.href = paymentResponse.paymentUrl;
        return;
      }
    }
    
    // Mock response cho các payment method khác
    return {
      id: bookingId,
      userId: "guest-user",
      showTimeId: "showtime-1",
      seats: selectedSeats || ["A1", "A2"],
      totalPrice: selectedSeats ? selectedSeats.length * 90000 : 180000,
      bookingTime: new Date().toISOString(),
      status: "confirmed",
      paymentMethod,
      paymentStatus: "completed",
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

// ===== CONCESSION API =====
export async function fetchConcessions() {
  try {
    return await apiClient.get('/concessions');
  } catch (error) {
    console.error('Error fetching concessions:', error);
    return [];
  }
}

export async function fetchConcessionsByCinema(cinemaId) {
  try {
    return await apiClient.get(`/concessions/by-cinema/${cinemaId}`);
  } catch (error) {
    console.error('Error fetching concessions by cinema:', error);
    return [];
  }
}

// ===== UTILITY FUNCTIONS =====
export const formatDateForAPI = (date) => {
  if (!date) return null;
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date;
};

export const handleApiError = (error) => {
  if (error.response) {
    const errorMessage = error.response.data?.message || 'Đã có lỗi xảy ra';
    console.error('API Error:', errorMessage);
    return {
      error: true,
      message: errorMessage,
      status: error.response.status
    };
  } else if (error.request) {
    console.error('Network Error:', error.request);
    return {
      error: true,
      message: 'Không thể kết nối đến server',
      status: 0
    };
  } else {
    console.error('Error:', error.message);
    return {
      error: true,
      message: error.message,
      status: 0
    };
  }
};