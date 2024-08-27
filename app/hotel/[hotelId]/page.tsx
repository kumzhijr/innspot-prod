import { getHotelById } from "@/actions/getHotelById";
import AddHotelForm from "@/components/hotel/AddHotelForm";
import { auth } from "@clerk/nextjs/server";

interface HotelPageProps{
    params: {
        hotelId: string
    }
}

const Hotel = async({params}: HotelPageProps) => {
    const hotel = await getHotelById (params.hotelId)
    const{userId} = auth()

    if(!userId) return <div>Please Sign Inn or Create an account to continue.</div>

    if(hotel && hotel.userId !== userId) return <div>Access Denied</div>

    return ( 
    <div>
        <AddHotelForm hotel={hotel}/>
    </div> 
    );
}
 
export default Hotel;