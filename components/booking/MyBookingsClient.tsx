'use client'

import { Booking, Hotel, Room } from "@prisma/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import AmenityItem from "../AmenityItem";
import { AirVent, Bath, Bed, BedDouble, DoorOpen, EarOff, HandPlatter, Home, Loader2, PenLine, Plus, Snowflake, Trash2, Tv2, Users, UtensilsCrossed, Wand2, Wifi } from "lucide-react";
import { Separator } from "../ui/separator";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useToast } from "../ui/use-toast";
import { DateRange } from "react-day-picker";
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useAuth } from "@clerk/nextjs";
import useBookRoom from "@/hooks/useBookRoom";
import useLocation from "@/hooks/useLocation";
import moment from "moment";
import { FaMapPin } from "react-icons/fa";

interface MyBookingsClientProps {
    booking: Booking & { Room: Room | null } & { Hotel: Hotel | null };
}

const MyBookingsClient: React.FC<MyBookingsClientProps> = ({ booking }) => {
    const { setRoomData, paymentIntentId, setClientSecret, setPaymentIntentId } = useBookRoom()
    const [isLoading, setIsLoading] = useState(false)
    const [bookingIsLoading, setBookingIsLoading] = useState(false)
    const { getCountryByCode, getStateByCode } = useLocation()
    const { userId } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    
    const { Hotel, Room } = booking
    
    if (!Hotel || !Room) return <div>Missing Data</div>

    const country = getCountryByCode(Hotel.country)
    const state = getStateByCode(Hotel.country, Hotel.state)

    const startDate = moment(booking.startDate).format('MMMM Do YYYY')
    const endDate = moment(booking.endDate).format('MMMM Do YYYY')
    const dayCount = differenceInCalendarDays(
        booking.endDate,
        booking.startDate
    )


    // FUNCTION TO HANDLE BOOKING A ROOM
    const handleBookRoom = () => {
        // check if user is signed in
        if (!userId) return toast({
            variant: 'destructive',
            description: 'You are not Signed In. Please Sign In'
        })

        if (!Hotel?.userId) return toast({
            variant: 'destructive',
            description: 'Something went wrong. Please refresh and try again.'
        })


        setBookingIsLoading(true);

        const bookingRoomData = {
            room: Room,
            totalPrice: booking.totalPrice,
            breakFastIncluded: booking.breakFastIncluded,
            startDate: booking.startDate,
            endDate: booking.endDate,
        }

        setRoomData(bookingRoomData)

        fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                booking: {
                    hotelOwnerId: Hotel.userId,
                    hotelId: Hotel.id,
                    roomId: Room.id,
                    startDate: bookingRoomData.startDate,
                    endDate: bookingRoomData.endDate,
                    breakFastIncluded: bookingRoomData.breakFastIncluded,
                    totalPrice: bookingRoomData.totalPrice
                },
                payment_intent_id: paymentIntentId
            })
        }).then((res) => {
            setBookingIsLoading(false)
            if (res.status === 401) {
                return router.push('/login')
            }

            return res.json()
        }).then(data => {
            setPaymentIntentId(data.paymentIntent.id)
            setClientSecret(data.paymentIntent.client_secret)
            router.push('/book-room')
        }).catch((error: any) => {
            console.log('Error:', error)
            toast({
                variant: 'destructive',
                description: `ERROR! ${error.message}`
            })
        })
    }

    return (<Card>
        <CardHeader>
            <CardTitle><div className="text-4xl mb-2">{Hotel.title}</div>
            <div className="font-normal text-sm text-primary/70 mb-4">
            <span>{country?.name}, {state?.name}, {Hotel.city}</span>
            </div>
            <Separator/>
            </CardTitle>            
            <CardTitle><div className="text-lg">
            {Room.title}</div></CardTitle>
            <CardDescription>{Room.description.substring(0, 80)}...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <div className="aspect-square overflow-hidden relative h-[200px] rounded-lg">
                <Image fill src={Room.image} alt={Room.title} className="object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-4 content-center text-sm">
                <AmenityItem><Bed className="h-4 w-4" />{Room.bedCount} Bed{'(s)'}</AmenityItem>
                <AmenityItem><Users className="h-4 w-4" />{Room.guestCount} Guest{'(s)'}</AmenityItem>
                <AmenityItem><Bath className="h-4 w-4" />{Room.bathroomCount} Bathroom{'(s)'}</AmenityItem>
                {!!Room.kingBed && <AmenityItem><BedDouble className="h-4 w-4" />{Room.kingBed} King Bed{'(s)'}</AmenityItem>}
                {!!Room.queenBed && <AmenityItem><BedDouble className="h-4 w-4" />{Room.queenBed} Queen Bed{'(s)'}</AmenityItem>}
                {Room.roomService && <AmenityItem><HandPlatter className="h-4 w-4" />{Room.roomService} Room Service</AmenityItem>}
                {Room.TV && <AmenityItem><Tv2 className="h-4 w-4" />{Room.TV} TV</AmenityItem>}
                {Room.balcony && <AmenityItem><DoorOpen className="h-4 w-4" />{Room.balcony} Balcony</AmenityItem>}
                {Room.freeWifi && <AmenityItem><Wifi className="h-4 w-4" />{Room.freeWifi} Internet</AmenityItem>}
                {Room.airCondition && <AmenityItem><Snowflake className="h-4 w-4" />{Room.airCondition} AC</AmenityItem>}
                {Room.soundProofed && <AmenityItem><EarOff className="h-4 w-4" />{Room.soundProofed} Sound Proofed</AmenityItem>}
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 content-center">
                <div><span className="font-bold">${Room.roomPrice}</span><span className="text-xs">/Night</span></div>
                {!!Room.breakFastPrice && <div>BreakFast: <span className="font-bold">${Room.breakFastPrice}</span></div>}
            </div>
            <Separator />
            <div className="flex flex-col gap-4">
                <CardTitle>Booking Details</CardTitle>
                <div className="text-primary/90 flex flex-col gap-4">
                    <div>
                        Room booked by {booking.userName} for {dayCount} days - {moment(booking.bookedAt).fromNow()}
                        </div>
                    <div>Check-In: {startDate} after 2pm</div>
                    <div className="flex flex-col gap-4">Check-Out: {endDate} after 12pm <Separator /></div>
                    {booking.breakFastIncluded && <div className="flex flex-col gap-4"> Breakfast wil be served</div>}
                    {booking.paymentStatus ? <div className="text-white-500">
                        <span className="bg-green-600 text-white px-2 py-1 rounded-lg shadow-md border-2 border-green-700 mr-2">
                            Paid
                        </span>
                        ${booking.totalPrice} - Room Reserved
                    </div> : <div className="text-primary/90">
                        <span className="bg-rose-500 text-primary/90 px-2 py-1 rounded-lg shadow-md border-2 border-rose-700 mr-2">
                            Not Paid
                        </span>
                        ${booking.totalPrice} - Room Not Reserved
                    </div>
                    }
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex items-center justify-evenly">
                    <Button className="w-full" disabled = {bookingIsLoading} onClick={()=> router.push(`/hotel-details/${Hotel.id}`)} >View Hotel</Button>
                    {!booking.paymentStatus && booking.userId === userId && <Button disabled={bookingIsLoading} onClick={() => handleBookRoom()}>{bookingIsLoading ? "Processing":"Pay Now"}</Button>}
        </CardFooter>
    </Card>);
}

export default MyBookingsClient;