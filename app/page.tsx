import { getHotels } from "@/actions/getHotel";
import HotelList from "@/components/hotel/HotelList";

interface HomeProps{
  searchParams: {
    title: string,
    country: string,
    state: string,
    city: string
  }
}

export default async function Home({searchParams}: HomeProps) {
  const hotels = await getHotels(searchParams)

  if (!hotels) return <div>No Hotels found</div>
  return (
    <div>
      <HotelList hotels = {hotels}/>
    </div>
  );
}
