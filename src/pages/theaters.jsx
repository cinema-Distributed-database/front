"use client"

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MapPin, Clock, Film, Navigation } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { fetchTheaters, fetchNearbyTheaters } from "../lib/api";

export default function TheatersPage() {
  const [searchParams] = useSearchParams();
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  // Lấy tham số từ URL
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  useEffect(() => {
    const loadTheaters = async () => {
      setLoading(true);
      try {
        if (lat && lng) {
          // Nếu có tọa độ, gọi API để lấy rạp gần đó
          setUserLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
          
          const nearbyTheaters = await fetchNearbyTheaters(
            parseFloat(lat), 
            parseFloat(lng), 
            10 // radius 10km
          );
          
          // Tính toán khoảng cách cho mỗi rạp
          const theatersWithDistance = nearbyTheaters.map(theater => {
            if (theater.location && theater.location.coordinates) {
              const [theLng, theLat] = theater.location.coordinates;
              const distance = calculateDistance(
                parseFloat(lat), parseFloat(lng),
                theLat, theLng
              );
              return { ...theater, distance };
            }
            return theater;
          });
          
          setTheaters(theatersWithDistance);
        } else {
          // Nếu không có tọa độ, lấy tất cả rạp
          const allTheaters = await fetchTheaters();
          setTheaters(allTheaters || []);
        }
      } catch (error) {
        console.error("Error loading theaters:", error);
        setTheaters([]);
      } finally {
        setLoading(false);
      }
    };

    loadTheaters();
  }, [lat, lng]);

  // Hàm tính khoảng cách giữa 2 điểm (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
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

      {theaters.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Không tìm thấy rạp chiếu phim nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {theaters.map((theater) => (
            <Card key={theater.id} className="bg-gray-900 border-gray-800 overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src={theater.image || "/placeholder.svg?height=300&width=500&text=" + encodeURIComponent(theater.name)} 
                  alt={theater.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{theater.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 mb-4">
                  <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">{theater.address}</p>
                </div>
                
                {/* Contact Info */}
                {theater.contact && (
                  <div className="mb-4">
                    {theater.contact.phone && (
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Điện thoại:</span> {theater.contact.phone}
                      </p>
                    )}
                    {theater.contact.email && (
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Email:</span> {theater.contact.email}
                      </p>
                    )}
                  </div>
                )}

                {/* Amenities */}
                {theater.amenities && theater.amenities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-300 mb-2">Tiện ích:</p>
                    <div className="flex flex-wrap gap-1">
                      {theater.amenities.slice(0, 3).map((amenity, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {theater.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                          +{theater.amenities.length - 3} khác
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Room Count */}
                {theater.roomCount && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400">
                      <Film size={16} className="inline mr-1" />
                      {theater.roomCount} phòng chiếu
                    </p>
                  </div>
                )}
                
                {/* Distance if available */}
                {userLocation && theater.distance !== undefined && (
                  <div className="flex items-center gap-2 mb-4 bg-purple-900/50 p-2 rounded">
                    <Navigation size={18} className="text-purple-400" />
                    <p className="text-sm">
                      Khoảng cách: <span className="font-bold text-purple-300">{theater.distance.toFixed(1)} km</span>
                    </p>
                  </div>
                )}
                
                <div className="mt-4">
                  <Link to={`/movies?cinema=${theater.id}`}>
                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                      Xem Lịch Chiếu
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}