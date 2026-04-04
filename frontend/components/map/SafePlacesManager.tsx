"use client";

import { useEffect } from "react";
import { SafePlace } from "@/lib/types";

interface SafePlacesProps {
    lat: number;
    lng: number;
    show: boolean;
    onLoad: (places: SafePlace[]) => void;
}

export default function SafePlacesManager({ lat, lng, show, onLoad }: SafePlacesProps) {
    useEffect(() => {
        if (!show || lat == null || lng == null) {
            onLoad([]);
            return;
        }

        const fetchPlaces = async () => {
             // Mock data for demonstration if API fails or to supplement
             const mockPlaces: SafePlace[] = [
                 { name: "Central Police Station", type: "police_station", lat: lat + 0.005, lng: lng + 0.005, address: "123 Main St", contact: "100", icon: "shield" },
                 { name: "City General Hospital", type: "hospital", lat: lat - 0.005, lng: lng - 0.005, address: "456 Health Blvd", contact: "102", icon: "plus" },
                 { name: "24/7 Pharmacy", type: "pharmacy", lat: lat + 0.002, lng: lng - 0.008, address: "789 Cure Rd", contact: "555-0123", icon: "pill" }
             ];

             try {
                 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/safe_places?lat=${lat}&lng=${lng}&radius=2000`);
                 const data = await res.json();
                 if (Array.isArray(data) && data.length > 0) {
                     onLoad([...data, ...mockPlaces]); // Combine real + mock for demo
                 } else {
                     onLoad(mockPlaces);
                 }
             } catch (e) {
                 console.warn("Failed to load safe places, utilizing mock data", e);
                 onLoad(mockPlaces);
             }
        };

        fetchPlaces();
    }, [lat, lng, show, onLoad]);

    return null; // Logic-only component for data fetching
}
