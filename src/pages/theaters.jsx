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
          
          // Gọi API backend với tọa độ
          const nearbyTheaters = await fetchNearbyTheaters(parseFloat(lat), parseFloat(lng));
          setTheaters(nearbyTheaters);
        } else {
          // Nếu không có tọa độ, lấy tất cả rạp
          const allTheaters = await fetchTheaters();
          setTheaters(allTheaters);
        }
      } catch (error) {
        console.error("Error loading theaters:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTheaters();
  }, [lat, lng]);

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
        {theaters.map((theater) => (
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
              
              {userLocation && theater.distance !== undefined && (
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