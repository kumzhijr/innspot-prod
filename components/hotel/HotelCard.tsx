'use client'

import { usePathname, useRouter } from "next/navigation";
import { HotelWithRooms } from "./AddHotelForm";
import { cn } from "@/lib/utils";
import Image from "next/image";
import AmenityItem from "../AmenityItem";
import { Dumbbell, MapPin, Waves } from "lucide-react";
import useLocation from "@/hooks/useLocation";
import { Button } from "../ui/button";
import { FaMapPin } from "react-icons/fa";

const HotelCard = ({ hotel }: { hotel: HotelWithRooms }) => {

    const pathname = usePathname()
    const isMyHotels = pathname.includes('my-hotels')
    const router = useRouter()

    const {getCountryByCode} = useLocation()
    const country = getCountryByCode(hotel.country)

    // return (<div onClick={() => !isMyHotels && router.push(`/hotel-details/${hotel.id}`)} className={cn('col-span-1 cursor-pointer transition hover:scale-105', 'cursor-default')}>
    //     <div className="flex gap-2 bg-background/50 border border-primary/10 rounded-lg">
    //         <div className="flex-1 aspect-square overflow-hidden relative w-[210px] h-[210px] rounded-s-lg">
    //             <Image
    //              fill src={hotel.image}
    //              alt={hotel.title}
    //              className="w-full h-full object-cover"/>
    //         </div>
    //         <div className="flex-1 flex flex-col justify-between h-[210px] gap-1 p-1 py-2 text-sm">
    //             <h3 className="font-semibold text-xl">{hotel.title}</h3>
    //             {/* <div className="text-primary/90">{hotel.description.substring(0, 45)}...</div> */}
    //             <div className="text-primary/90">
    //             <AmenityItem>
    //                 {country?.name}, {hotel.city}
    //                 </AmenityItem>
    //             </div>
    //             <div className="flex items-center justify-between">
    //                 <div className="flex items-center gap-1">
    //                     {hotel?.rooms[0]?.roomPrice && <>
    //                         <div className="font-semibold text-base">${hotel?.rooms[0].roomPrice}</div>
    //                         <div className="text-xs">Per Night</div>
    //                     </>}
    //                 </div>
    //                 {isMyHotels && <Button onClick={()=> router.push(`/hotel${hotel.id}`)} variant="outline">Edit</Button>}
    //             </div>
    //         </div>
    //     </div>
    // </div>);

    return (
        <div 
          onClick={() => !isMyHotels && router.push(`/hotel-details/${hotel.id}`)} 
          className={cn(
            'col-span-1 cursor-pointer transition transform hover:scale-105', 
            'cursor-default'
          )}
        >
          <div className="bg-background/50 border border-primary/10 rounded-lg overflow-hidden">
            <div className="aspect-square relative w-full h-[210px]">
              <Image
                fill
                src={hotel.image}
                alt={hotel.title}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="px-8 py-5 text-sm">
              <h3 className="font-semibold text-2xl">{hotel.title}</h3>
              <div className="text-primary/90 mt-2">
                <AmenityItem>
                  {/* <FaMapPin size={16}/> */}
                  {hotel.city}, {country?.name}
                </AmenityItem>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1">
                  {hotel?.rooms[0]?.roomPrice && (
                    <>
                      <div className="font-semibold text-base">
                        ${hotel?.rooms[0].roomPrice}
                      </div>
                      <div className="text-xs">/Per Night</div>
                    </>
                  )}
                </div>
                {isMyHotels && <Button onClick={()=> router.push(`/hotel/${hotel.id}`)} variant="outline">Edit</Button>}
              </div>
            </div>
          </div>
        </div>
      );
    
    // return (
    //     <div 
    //       onClick={() => !isMyHotels && router.push(`/hotel-details/${hotel.id}`)} 
    //       className={cn(
    //         'col-span-1 cursor-pointer transition transform hover:scale-105', 
    //         'cursor-default'
    //       )}
    //     >
    //       <div className="bg-background/50 border border-primary/10 rounded-lg overflow-hidden">
    //         <div className="aspect-square relative w-full h-[210px]">
    //           <Image
    //             fill
    //             src={hotel.image}
    //             alt={hotel.title}
    //             className="object-cover w-full h-full"
    //           />
    //         </div>
    //         <div className="p-4 text-sm">
    //           <h3 className="font-semibold text-2xl">{hotel.title}</h3>
    //           <div className="text-gray-400 mt-2">
    //             <AmenityItem>
    //                 {country?.name}, {hotel.city}
    //             </AmenityItem>
    //           </div>
    //           <div className="flex items-center justify-between mt-4">
    //             <div className="flex items-center gap-1">
    //               {hotel?.rooms[0]?.roomPrice && (
    //                 <>
    //                   <div className="font-semibold text-base">
    //                     ${hotel?.rooms[0].roomPrice}
    //                   </div>
    //                   <div className="text-xs text-gray-500">Per Night</div>
    //                 </>
    //               )}
    //             </div>
    //             {isMyHotels && (
    //               <Button onClick={() => router.push(`/hotel${hotel.id}`)} variant="outline">
    //                 Edit
    //               </Button>
    //             )}
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   );

    // return (
    //     <div 
    //       onClick={() => !isMyHotels && router.push(`/hotel-details/${hotel.id}`)} 
    //       className={cn(
    //         'col-span-1 cursor-pointer transition transform hover:scale-105', 
    //         'cursor-default'
    //       )}
    //     >
    //       <div 
    //         className="bg-background/50 border border-primary/10 rounded-lg overflow-hidden"
    //         onClick={() => router.push(`/en/los-angeles-area-hotels/the-line-hotel-los-angeles?pid=7091`)}
    //       >
    //         <div className="relative w-full h-[210px]">
    //           <Image
    //             fill
    //             src={hotel.image}
    //             alt={hotel.title}
    //             className="object-cover w-full h-full"
    //           />
    //         </div>
    //         <div className="p-2 text-sm">
    //           <span className="font-semibold text-xl block">{hotel.title}</span>
    //           <span className="text-primary/90 block mt-1">{country?.name}, {hotel.city}</span>
    //         </div>
    //       </div>
    //     </div>
    //   );
      
      
      
      
      
      
}

export default HotelCard;