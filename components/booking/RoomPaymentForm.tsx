'use client'

import useBookRoom from "@/hooks/useBookRoom";
import { AddressElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { Separator } from "../ui/separator";
import moment from 'moment';
import { Button } from "../ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { error } from "console";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Terminal } from "lucide-react";
import { Booking } from "@prisma/client";
import { DateRange } from "react-day-picker";
import { endOfDay, isWithinInterval, startOfDay } from "date-fns";

interface RoomPaymentFormProps {
    clientSecret: string,
    handleSetPaymentSuccess: (value: boolean) => void
}

type DateRangesType = {
    startDate: Date,
    endDate: Date
}

function hasOverlap(startDate: Date, endDate: Date, dateRanges: DateRangesType[]) {
    const targetInterval = { start: startOfDay(new Date(startDate)), end: endOfDay(new Date(endDate)) }

    for (const range of dateRanges) {
        const rangeStart = startOfDay(new Date(range.startDate))
        const rangeEnd = endOfDay(new Date(range.endDate))

        if (
            isWithinInterval(targetInterval.start, { start: rangeStart, end: rangeEnd }) || isWithinInterval(targetInterval.end, { start: rangeStart, end: rangeEnd }) || (targetInterval.start < rangeStart && targetInterval.end > rangeEnd)
        ) {
            return true
        }
    }

    return false

}

const RoomPaymentForm = ({ clientSecret, handleSetPaymentSuccess }: RoomPaymentFormProps) => {

    const { bookingRoomData, resetBookRoom } = useBookRoom()
    const stripe = useStripe()
    const elements = useElements()
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        if (!stripe) {
            return;
        }
        if (!clientSecret) {
            return;
        }
        handleSetPaymentSuccess(false)
        setIsLoading(false)

    }, [stripe])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true)

        if (!stripe || !elements || !bookingRoomData) {
            return;
        }

        try {
            // Check for date overlaps
            const bookings = await axios.get(`/api/booking/${bookingRoomData.room.id}`)

            const roomBookingDates = bookings.data.map((booking: Booking) => {
                return {
                    startDate: booking.startDate,
                    endDate: booking.endDate
                }
            })

            const overlapFound = hasOverlap(bookingRoomData.startDate, bookingRoomData.endDate, roomBookingDates)

            if (overlapFound) {
                setIsLoading(false)
                return toast({
                    variant: "destructive",
                    description: "Those Dates have already been resreved by another Guest. Please go back and select different Dates or another Room"
                })
            }

            //  Confirm Payment
            stripe.confirmPayment({ elements, redirect: 'if_required' }).then((result) => {
                if (!result.error) {
                    axios.patch(`/api/booking/${result.paymentIntent.id}`).then((res) => {
                        toast({
                            variant: "success",
                            description: "Your Room Has Been Reserved!"
                        })
                        router.refresh();
                        resetBookRoom();
                        handleSetPaymentSuccess(true)
                        setIsLoading(false)
                    }).catch(error => {
                        console.log(error)
                        toast({
                            variant: "destructive",
                            description: "Something went wrong while Processing your Payment."
                        })
                        setIsLoading(false)
                    })
                } else {
                    setIsLoading(false)
                }
            })

        } catch (error) {
            console.log(error)
            setIsLoading(false)
        }
    }

    if (!bookingRoomData?.startDate || !bookingRoomData?.endDate) return <div> ERROR: Missing Reservatiin Dates</div>

    const startDate = moment(bookingRoomData?.startDate).format('MMMM Do YYYY')
    const endDate = moment(bookingRoomData?.endDate).format('MMMM Do YYYY')

    return (<form onSubmit={handleSubmit} id="payment-form" className="flex flex-col gap-4">
        <h2 className="font-semibold mb-2 text-lg">Billing Address</h2>
        <AddressElement options={{
            mode: 'billing',
            // allowedCountries: []
        }} />
        <h2 className="font-semibold mt-4 mb-2 text-lg">Payment Information</h2>
        <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
        <div className="flex flex-col gap-1">
            <Separator className="mt-4" />
            <div className="flex-auto flex-col gap-1">
                <h2 className="font-semibold mb-1 text-lg">Booking Summary</h2>
                <div>Check-In on {startDate} between 12pm-3pm</div>
                <div>Check-Out on {endDate} between 12pm-3pm</div>
                {bookingRoomData?.breakFastIncluded && <div>
                    Breakfast will be served at 8am
                </div>}
            </div>
            <Separator />
            <div className="font-bold text-lg">
                {bookingRoomData?.breakFastIncluded && <div className="mb-2">
                    Breakfast: ${bookingRoomData.room.breakFastPrice}
                </div>}
                Total Price: ${bookingRoomData?.totalPrice}
            </div>
        </div>
        {isLoading && <div className="mt-4">
            <Alert className="bg-blue-900 text-white mb-4">
                <Terminal className="h-4 w-4 stroke-white" />
                <AlertTitle>Your Payment is processing</AlertTitle>
                <AlertDescription>
                    <div>Please stay on this page.</div>
                </AlertDescription>
            </Alert>
        </div>
        }
        <Button disabled={isLoading}> {isLoading ? 'Processing Payment' : 'Pay Now'} </Button>
    </form>);
}

export default RoomPaymentForm;