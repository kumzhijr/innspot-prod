'use client'

import { FaSwimmer, FaMapPin, FaSpa, FaWineGlassAlt, FaCoffee, FaDumbbell } from "react-icons/fa";
import { Booking } from "@prisma/client";
import { HotelWithRooms } from "./AddHotelForm";
import useLocation from "@/hooks/useLocation";
import Image from "next/image";
import AmenityItem from "../AmenityItem";
import { Bike, CircleParking, Clapperboard, Dumbbell, ShoppingCart, WashingMachine, Wifi } from "lucide-react";
import RoomCard from "../room/RoomCard";
// import { MapPin } from "lucide-react"

const HotelDetailsClient = ({hotel, bookings}: {hotel: HotelWithRooms, bookings?: Booking[]}) => {
    const {getCountryByCode, getStateByCode} = useLocation()
    const country = getCountryByCode(hotel.country)
    const state = getStateByCode(hotel.country, hotel.state)

    return ( <div className="flex flex-col gap-6 pb-2">
        <div className="aspect-square overflow-hidden relative w-full h-[200px] md:h-[400px] rounded-lg">
            <Image fill src={hotel.image} alt={hotel.title} className="object-cover"/>
        </div>
        <div>
            <h3 className="font-semibold text-2xl md:text-4xl">{hotel.title}</h3>
            <div className="font-normal mt-4">
                <AmenityItem><FaMapPin size={18}/> {country?.name},{state?.name},{hotel.city}</AmenityItem>
            </div>
            <h3 className="font-semibold text-xl mt-4 mb-2">Location Details</h3>
            <p className="text-primary/90 mb-2">{hotel.locationdescription}</p>
            <h3 className="font-semibold text-xl mt-4 mb-2">About</h3>
            <p className="text-primary/90 mb-4">{hotel.description}</p>
            <h3 className="font-semibold text-lg mt-4 mb-2">Popular Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 content-start text-sm">
                {hotel.swimmingPool && <div className="flex items-center gap-2 border border-primary/10 rounded p-4"><FaSwimmer size={18} /> Pool</div>}
                {hotel.gym && <div className="flex items-center gap-2 border border-primary/10 rounded p-4"><FaDumbbell size={18}/> Gym</div>}
                {hotel.spa && <div className="flex items-center gap-2 border border-primary/10 rounded p-4"><FaSpa size={18} /> Spa</div>}
                {hotel.bar && <div className="flex items-center gap-2 border border-primary/10 rounded p-4"><FaWineGlassAlt size={18}/> Bar</div>}
                {hotel.laundry && <div className="flex items-center gap-2 border border-primary/10 rounded p-4"><WashingMachine className="w-4 h-4" /> Laundry</div>}
                {hotel.restaurant && <div className="flex items-center gap-2 border border-primary/10 rounded p-4"><WashingMachine className="w-4 h-4" /> Restaurant</div>}
                {hotel.shopping && <div className="flex items-center gap-2 border border-primary/10 rounded p-4"><ShoppingCart className="w-4 h-4" /> Shopping</div>}
                {hotel.freeParking && <div className="flex items-center gap-2 border border-primary/10 rounded p-4"><CircleParking className="w-4 h-4" /> Free Parking</div>}
                {hotel.bikeRental && <div className="flex items-center gap-2 border border-primary/10 rounded p-4"><Bike className="w-4 h-4" /> Bike Rental</div>}
                {hotel.freeWifi && <div className="flex items-center gap-2 border border-primary/10 rounded p-4"><Wifi className="w-4 h-4" /> Wi-Fi</div>}
                {hotel.movieNights && <div className="flex items-center gap-2 border border-primary/10 rounded p-4"><Clapperboard className="w-4 h-4" /> Movie Nights</div>}
                {hotel.coffeeShop && <div className="flex items-center gap-2 border border-primary/10 rounded p-4"><FaCoffee size={18} /> Coffee Shop</div>}
            </div>
        </div>
        <div>
            {!!hotel.rooms.length && <div>
                <h3 className="text-lg font-semibold my-4">Hotel Rooms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {hotel.rooms.map((room)=> {
                        return <RoomCard hotel={hotel} room={room} key={room.id} bookings={bookings}/>
                    })}
                </div>
            </div>}
        </div>
    </div> );
}
 
export default HotelDetailsClient;