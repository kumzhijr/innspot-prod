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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import AddRoomForm from "./AddRoomForm";
import axios from "axios";
import { useToast } from "../ui/use-toast";
import { DatePickerWithRange } from "../ui/DateRangePicker";
import { DateRange } from "react-day-picker";
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useAuth } from "@clerk/nextjs";
import useBookRoom from "@/hooks/useBookRoom";

interface RoomCardProps {
    hotel?: Hotel & {
        rooms: Room[]
    }
    room: Room;
    bookings?: Booking[];
}


const RoomCard = ({ hotel, room, bookings = [] }: RoomCardProps) => {
    const { setRoomData, paymentIntentId, setClientSecret, setPaymentIntentId } = useBookRoom()
    const [isLoading, setIsLoading] = useState(false)
    const [bookingIsLoading, setBookingIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<DateRange | undefined>()
    const [totalPrice, setTotalPrice] = useState(room.roomPrice)
    const [includeBreakFast, setIncludeBreakFast] = useState(false)
    const [days, setDays] = useState(1)

    const pathname = usePathname()
    const router = useRouter()
    const { toast } = useToast()
    const { userId } = useAuth()
    const isHotelDetailsPage = pathname.includes('hotel-details')
    const isBookRoom = pathname.includes('book-room')


    // IF DATE FROM AND DATE TO EXIST, DO THIS;
    useEffect(() => {
        if (date && date.from && date.to) {
            const dayCount = differenceInCalendarDays(
                date.to,
                date.from
            )

            setDays(dayCount)

            if (dayCount && room.roomPrice) {
                if (includeBreakFast && room.breakFastPrice) {
                    setTotalPrice((dayCount * room.roomPrice) + (dayCount
                        * room.breakFastPrice
                    ))

                } else {
                    setTotalPrice(dayCount * room.roomPrice)
                }
            } else {
                setTotalPrice(room.roomPrice)
            }

        }
    }, [date, room.roomPrice, room.breakFastPrice, includeBreakFast])

    // Disable dates that have been booked by another user
    const disabledDates = useMemo(() => {
        let dates: Date[] = []

        const roomBookings = bookings.filter(booking => booking.roomId === room.id)

        roomBookings.forEach(booking => {
            const range = eachDayOfInterval({
                start: new Date(booking.startDate),
                end: new Date(booking.endDate)
            })

            dates = [...dates, ...range]

        })
        return dates

    }, [bookings])

    const handleDialogueOpen = () => {
        setOpen(prev => !prev)
    }

    const handleRoomDelete = (room: Room) => {
        setIsLoading(true)
        const imageKey = room.image.substring(room.image.lastIndexOf("/") + 1)

        axios.post('/api/uploadthing/delete', { imageKey }).then(() => {
            axios.delete(`/api/room/${room.id}`).then(() => {
                router.refresh()
                toast({
                    variant: "success",
                    description: "Room Deleted Successfully!"
                })
                setIsLoading(false)
            }).catch(() => {
                setIsLoading(false)
                toast({
                    variant: "destructive",
                    description: "Room couldn't be Deleted"
                })
            })
        }).catch(() => {
            setIsLoading(false)
            toast({
                variant: "destructive",
                description: "Something went wrong. Try again later."
            })
        })
    }

    // FUNCTION TO HANDLE BOOKING A ROOM
    const handleBookRoom = () => {
        // check if user is logged in
        if (!userId) return toast({
            variant: 'destructive',
            description: 'You are not Signed In. Please Sign In'
        })

        if (!hotel?.userId) return toast({
            variant: 'destructive',
            description: 'Something went wrong. Please refresh and try again.'
        })

        if (date?.from && date?.to) {
            setBookingIsLoading(true);

            const bookingRoomData = {
                room,
                totalPrice,
                breakFastIncluded: includeBreakFast,
                startDate: date.from,
                endDate: date.to,
            }

            setRoomData(bookingRoomData)

            //
            fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({
                    booking: {
                        hotelOwnerId: hotel.userId,
                        hotelId: hotel.id,
                        roomId: room.id,
                        startDate: date.from,
                        endDate: date.to,
                        breakFastIncluded: includeBreakFast,
                        totalPrice: totalPrice
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
        } else {
            toast({
                variant: 'destructive',
                description: 'Please select a Date'
            })
        }
    }

    return (<Card>
        <CardHeader>
            <CardTitle>{room.title}</CardTitle>
            <CardDescription>{room.description.substring(0, 80)}...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <div className="aspect-square overflow-hidden relative h-[200px] rounded-lg">
                <Image fill src={room.image} alt={room.title} className="object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-4 content-center text-sm">
                <AmenityItem ><Bed className="h-4 w-4" />{room.bedCount} Bed{'(s)'}</AmenityItem>
                <AmenityItem><Users className="h-4 w-4" />{room.guestCount} Guest{'(s)'}</AmenityItem>
                <AmenityItem><Bath className="h-4 w-4" />{room.bathroomCount} Bathroom{'(s)'}</AmenityItem>
                {!!room.kingBed && <AmenityItem><BedDouble className="h-4 w-4" />{room.kingBed} King Bed{'(s)'}</AmenityItem>}
                {!!room.queenBed && <AmenityItem><BedDouble className="h-4 w-4" />{room.queenBed} Queen Bed{'(s)'}</AmenityItem>}
                {room.roomService && <AmenityItem><HandPlatter className="h-4 w-4" />{room.roomService} Room Service</AmenityItem>}
                {room.TV && <AmenityItem><Tv2 className="h-4 w-4" />{room.TV} TV</AmenityItem>}
                {room.balcony && <AmenityItem><DoorOpen className="h-4 w-4" />{room.balcony} Balcony</AmenityItem>}
                {room.freeWifi && <AmenityItem><Wifi className="h-4 w-4" />{room.freeWifi} Internet</AmenityItem>}
                {room.airCondition && <AmenityItem><Snowflake className="h-4 w-4" />{room.airCondition} AC</AmenityItem>}
                {room.soundProofed && <AmenityItem><EarOff className="h-4 w-4" />{room.soundProofed} Sound Proofed</AmenityItem>}
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 content-center">
                <div><span className="font-bold">${room.roomPrice}</span><span className="text-xs">/Night</span></div>
                {!!room.breakFastPrice && <div>BreakFast: <span className="font-bold">${room.breakFastPrice}</span></div>}
            </div>
        </CardContent>

        {/* conditionally render to not show footer at chekout */}
        {!isBookRoom &&
            <CardFooter className="relative flex flex-col gap-4 ">
                <Separator />

                {isHotelDetailsPage ? (
                    <div className="flex flex-col gap-6 py-2  w-full">
                        <div>
                            Select a date to see Prices
                        </div>
                        <DatePickerWithRange
                            date={date}
                            setDate={setDate}
                            disabledDates={disabledDates}
                        />
                        {room.breakFastPrice > 0 && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="breakFast"
                                    onCheckedChange={(value) => setIncludeBreakFast(!!value)}
                                />
                                <label htmlFor="breakFast" className="text-sm">
                                    Include Breakfast
                                </label>
                            </div>
                        )}
                        <div>
                            Total Price:
                            <span className="font-bold"> ${totalPrice} </span>
                            for <span className="font-bold">{days} Night(s)</span>
                        </div>

                        {/* Reservation Button */}
                        <Button
                            onClick={() => handleBookRoom()}
                            disabled={bookingIsLoading}
                            type="button"
                        >
                            {bookingIsLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4" /> Loading...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" /> Reserve
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="flex w-full justify-between gap-4">

                        <Button
                            disabled={isLoading}
                            type="button"
                            onClick={() => handleRoomDelete(room)}
                            className="flex-1 bg-rose-500 text-white hover:bg-rose-600"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4" /> Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </>
                            )}
                        </Button>

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger className="flex-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                >
                                    <PenLine className="mr-2 h-4 w-4" /> Edit
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[900px] w-[90%]">
                                <DialogHeader className="px-2">
                                    <DialogTitle>Edit Room</DialogTitle>
                                </DialogHeader>
                                <AddRoomForm
                                    hotel={hotel}
                                    room={room}
                                    handleDialogueOpen={handleDialogueOpen}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </CardFooter>

        }
    </Card>);
}

export default RoomCard;