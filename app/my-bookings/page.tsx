import { getBookingsByHotelOwnerId } from "@/actions/getBookingsByHotelOwnerId";
import { getBookingsByUserId } from "@/actions/getBookingsByUserId";
import MyBookingsClient from "@/components/booking/MyBookingsClient";

const MyBookings = async () => {
    const bookingsFromGuests = await getBookingsByHotelOwnerId()
    const bookingsFromUser = await getBookingsByUserId()

    if(!bookingsFromGuests && !bookingsFromUser) return <div> No Bookings Found</div>

    return ( <div className="flex flex-col gap-10">
        {!!bookingsFromUser?.length && <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-6 mt-2">Your Bookings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {bookingsFromUser.map(booking => <MyBookingsClient key={booking.id} booking={booking}/>)}
            </div>
            </div>}
        {!!bookingsFromGuests?.length && <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-6 mt-2">Bookings Guests have made on your Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {bookingsFromGuests.map(booking => <MyBookingsClient key={booking.id} booking={booking}/>)}
            </div>
            </div>}
    </div> );
}
 
export default MyBookings;