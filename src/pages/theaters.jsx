"use client"

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MapPin, Clock, Film, Navigation } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { fetchTheaters } from "../lib/api";

export default function TheatersPage() {
  const [searchParams] = useSearchParams();
  const [theaters, setTheaters] = useState([]);
  const [nearbyTheaters, setNearbyTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  // Lấy tham số từ URL
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  useEffect(() => {
    const loadTheaters = async () => {
      setLoading(true);
      try {
        // Lấy danh sách tất cả rạp
        const allTheaters = await fetchTheaters();
        setTheaters(allTheaters);

        // Nếu có tọa độ định vị
        if (lat && lng) {
          setUserLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
          
          // Tính khoảng cách và sắp xếp theo khoảng cách gần nhất
          const theatersWithDistance = allTheaters.map(theater => {
            // Thêm trường tọa độ tạm thời cho mỗi rạp (trong thực tế nên lấy từ database)
            // Đây chỉ là giá trị mẫu, cần thay thế bằng dữ liệu thực tế
            const theaterCoords = getTheaterCoordinates(theater.id);
            
            // Tính khoảng cách
            const distance = calculateDistance(
              parseFloat(lat),
              parseFloat(lng),
              theaterCoords.lat,
              theaterCoords.lng
            );
            
            return {
              ...theater,
              distance: distance
            };
          });

          // Sắp xếp theo khoảng cách
          const sorted = [...theatersWithDistance].sort((a, b) => a.distance - b.distance);
          setNearbyTheaters(sorted);
        } else {
          setNearbyTheaters(allTheaters);
        }
      } catch (error) {
        console.error("Error loading theaters:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTheaters();
  }, [lat, lng]);

  // Hàm giả định tọa độ cho mỗi rạp (trong thực tế, lấy từ database)
  const getTheaterCoordinates = (theaterId) => {
    // Dữ liệu mẫu - thay thế bằng dữ liệu thực từ backend
    const coordinates = {
      theater1: { lat: 10.772, lng: 106.698 }, // Quang Trung, Gò Vấp
      theater2: { lat: 10.773, lng: 106.701 }, // Hai Bà Trưng
      theater3: { lat: 10.743, lng: 106.628 }  // Satra Q6
    };
    
    return coordinates[theaterId] || { lat: 10.762, lng: 106.660 }; // Mặc định
  };

  // Hàm tính khoảng cách giữa hai điểm địa lý (công thức Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Bán kính trái đất tính bằng km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Khoảng cách tính bằng km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-700 rounded mb-8"></div>
          <div className="h-96 w-full max-w-4xl bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Hệ Thống Rạp Chiếu Phim</h1>
      
      {userLocation && (
        <div className="bg-gray-800 p-4 rounded-lg mb-8 text-center">
          <p className="text-lg mb-2">
            <MapPin className="inline mr-2" size={20} />
            Đang hiển thị rạp gần vị trí hiện tại của bạn
          </p>
          <p className="text-sm text-gray-400">Vị trí: {lat}, {lng}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(userLocation ? nearbyTheaters : theaters).map((theater) => (
          <Card key={theater.id} className="bg-gray-900 border-gray-800 overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img 
                src={theater.image || "/placeholder.svg?height=300&width=500&text=" + theater.name} 
                alt={theater.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{theater.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2 mb-4">
                <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">{theater.address}</p>
              </div>
              
              {userLocation && theater.distance && (
                <div className="flex items-center gap-2 mb-4 bg-purple-900/50 p-2 rounded">
                  <Navigation size={18} className="text-purple-400" />
                  <p>Khoảng cách: <span className="font-bold">{theater.distance.toFixed(1)} km</span></p>
                </div>
              )}
              
              <div className="mt-4">
                <Link to={`/theaters/${theater.id}`}>
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                    Xem Lịch Chiếu
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}