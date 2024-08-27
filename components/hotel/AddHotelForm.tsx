"use client"

import * as z from "zod";
import { Hotel, Room } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useState } from "react";
import { UploadButton } from "../uploadthing";
import { useToast } from "../ui/use-toast";
import Image from "next/image";
import { Button } from "../ui/button";
import { Eye, Loader2, Pencil, PencilLine, Plus, SeparatorHorizontal, SeparatorVertical, Trash, XCircle, XCircleIcon } from "lucide-react";
import axios from "axios";
import useLocation from "@/hooks/useLocation";
import { ICity, ICountry, IState } from "country-state-city";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import AddRoomForm from "../room/AddRoomForm";
import RoomCard from "../room/RoomCard";
import { Separator } from "../ui/separator";



interface AddHotelFormProps {
    hotel: HotelWithRooms | null;
}

export type HotelWithRooms = Hotel & {
    rooms: Room[];
};

const formSchema = z.object({
    title: z.string().min(3, {
        message: "Title must be at least three characters long",
    }),
    description: z.string().min(10, {
        message: "Description must be at least ten characters long",
    }),
    image: z.string().min(1, {
        message: "Image is Required",
    }),
    country: z.string().min(1, {
        message: "Coutry is Required",
    }),
    state: z.string().min(1, {
        message: "State is Required",
    }),
    // state: z.string().optional(),
    city: z.string().min(2, {
        message: "State is Required",
    }),
    locationdescription: z.string().min(10, {
        message: "Description must be at least ten characters long",
    }),
    gym: z.boolean().optional(),
    spa: z.boolean().optional(),
    bar: z.boolean().optional(),
    laundry: z.boolean().optional(),
    restaurant: z.boolean().optional(),
    shopping: z.boolean().optional(),
    freeParking: z.boolean().optional(),
    bikeRental: z.boolean().optional(),
    freeWifi: z.boolean().optional(),
    movieNights: z.boolean().optional(),
    swimmingPool: z.boolean().optional(),
    coffeeShop: z.boolean().optional(),
});

const AddHotelForm = ({ hotel }: AddHotelFormProps) => {
    const [image, setImage] = useState<string | undefined>(hotel?.image)
    const [imageIsDeleting, setImageIsDeleting] = useState(false)
    const [states, setStates] = useState<IState[]>([])
    const [cities, setCities] = useState<ICity[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isHotelDeleting, setIsHotelDeleting] = useState(false)
    const [open, setOpen] = useState(false)

    const { toast } = useToast()
    const router = useRouter()
    const { getAllCountries, getCountryStates, getStateCities } = useLocation()
    const countries = getAllCountries()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: hotel || {
            title: '',
            description: '',
            image: '',
            country: '',
            state: '',
            city: '',
            locationdescription: '',
            gym: false,
            spa: false,
            bar: false,
            laundry: false,
            restaurant: false,
            shopping: false,
            freeParking: false,
            bikeRental: false,
            freeWifi: false,
            movieNights: false,
            swimmingPool: false,
            coffeeShop: false,
        },
    })

    useEffect(() => {
        if (typeof image === "string") {
            form.setValue("image", image, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            })
        }
    }, [image])

    useEffect(() => {
        const selectedCountry = form.watch('country')
        const countryStates = getCountryStates(selectedCountry)
        if (countryStates) {
            setStates(countryStates)
        }
    }, [form.watch('country')])

    useEffect(() => {
        const selectedCountry = form.watch('country')
        const selectedState = form.watch('state')
        const stateCities = getStateCities(selectedCountry, selectedState)
        if (stateCities) {
            setCities(stateCities)
        }
    }, [form.watch('country'), form.watch('state')])

    // Submit button function
    // this is what happens when you click the submit button
    // CREATE THE HOTEL
    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        if (hotel) {
            // update/edit hotel
            axios.patch(`/api/hotel/${hotel.id}`, values).then((res) => {
                toast({
                    variant: "success",
                    description: "Hotel Updated Successfully!🎉"
                })
                router.push(`/hotel/${res.data.id}`)
                setIsLoading(false)
            }).catch((err) => {
                console.log(err)
                toast({
                    variant: "destructive",
                    description: "Something went wrong. Please try again later."
                })
                setIsLoading(false)
            })
        } else {
            // create hotel
            axios.post('/api/hotel', values).then((res) => {
                toast({
                    variant: "success",
                    description: "🎉Success! Hotel added."
                })
                router.push(`/hotel/${res.data.id}`)
                setIsLoading(false)
            }).catch((err) => {
                console.log(err)
                toast({
                    variant: "destructive",
                    description: "Something went wrong. Please roload & try again."
                })
                setIsLoading(false)
            })
        }
    }

    // function to handle hotel delete
    const handleDeleteHotel = async (hotel: HotelWithRooms) => {
        // first delete image from upload thing
        // then delete from my db in prisma
        setIsHotelDeleting(true)
        const getImageKey = (src: string) => src.substring(src.lastIndexOf('/') + 1)

        try {
            const imageKey = getImageKey(hotel.image)
            await axios.post('/api/uploadthing/delete', { imageKey })
            await axios.delete(`/api/hotel/${hotel.id}`)

            setIsHotelDeleting(false)
            toast({
                variant: "success",
                description: "Your Hotel has been Deleted"
            })
            router.push('/hotel/new')
        } catch (error: any) {
            console.log(error)
            setIsHotelDeleting(false)
            toast({
                variant: "destructive",
                description: `This task could not be Completed ${error.message}`
            })
        }
    }

    // function to Delete image after uploading
    const handleImageDelete = (image: string) => {
        setImageIsDeleting(true)
        const imageKey = image.substring(image.lastIndexOf('/') + 1)

        axios.post('/api/uploadthing/delete', { imageKey }).then((res) => {
            if (res.data.success) {
                setImage('');
                toast({
                    variant: "success",
                    description: "Image deleted"
                })
            }
        }).catch((error) => {
            console.error('Error deleting image:', error);
        }
        ).finally(() => {
            setImageIsDeleting(false)
        })
    }

    const handleDialogueOpen = () => {
        setOpen(prev => !prev)
    }

    return (<div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <h3 className="text-lg font-semibold">
                    {hotel ? 'EDIT YOUR HOTEL' : 'CREATE YOUR HOTEL'}
                </h3>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 flex flex-col gap-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hotel Name*</FormLabel>
                                    <FormDescription>
                                        Provide your hotel name.
                                    </FormDescription>
                                    <FormControl>
                                        <Input placeholder="Example; Grand Pela Hotel" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hotel Description*</FormLabel>
                                    <FormDescription>
                                        Provide a description of your Hotel.
                                    </FormDescription>
                                    <FormControl>
                                        <Textarea placeholder="Grand Pela hotel is located at the heart of the city making it a strategic..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div>
                            <FormLabel>Choose Perks/Features</FormLabel>
                            <FormDescription>What amenities does your hotel offer?</FormDescription>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <FormField
                                    control={form.control}
                                    name="gym"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel>Gym</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="spa"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel>Spa</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bar"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel>Bar</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="laundry"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel>Laundry</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="restaurant"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel>Restaurant</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="shopping"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel>Shopping</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="freeParking"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel>Free Parking</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bikeRental"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel>Bike Rental</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="freeWifi"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel>Free Wifi</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="movieNights"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel>Movie Nights</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="swimmingPool"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel>Swimming Pool</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="coffeeShop"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel>Coffee Shop</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <FormField
                            control={form.control}
                            name='image'
                            render={({ field }) => (
                                <FormItem className='flex flex-col space-y-3'>
                                    <FormLabel>UPLOAD AN IMAGE*</FormLabel>
                                    <FormDescription>Choose an image to nicely showcase your Hotel.</FormDescription>
                                    <FormControl>
                                        {/* Display Image after uploading */}
                                        {image ? <>
                                            <div className="relative max-w-[400px] min-w-[200px] max-h-[400px] min-h-[200px] mt-4">
                                                <Image fill src={image} alt="Hotel  Image" className="object-contain" />
                                                <Button onClick={() => handleImageDelete(image)} type="button" size="icon" variant="ghost" className="absolute right-[-12px] top-0">
                                                    {imageIsDeleting ? <Loader2 /> : <XCircle />}
                                                </Button>
                                            </div>
                                        </> : <>
                                            <div className="flex flex-col items-center max-w[400] p-12 border-2 border-dashed border-primary/50 rounded mt-4">
                                                {/* Upload an image */}
                                                <UploadButton
                                                    endpoint="imageUploader"
                                                    onClientUploadComplete={(res) => {
                                                        // Do something with the response
                                                        console.log("Files: ", res);
                                                        setImage(res[0].url),
                                                            toast({
                                                                variant: "success",
                                                                description: "Upload Succesful!",
                                                            })
                                                    }}
                                                    onUploadError={(error: Error) => {
                                                        // Do something with the error.
                                                        toast({
                                                            variant: "destructive",
                                                            description: `ERROR! ${error.message}`,
                                                        })
                                                    }}
                                                />
                                            </div>
                                        </>}
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                    </div>
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Selectors for countries and states and cities */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name='country'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Country*</FormLabel>
                                        <FormDescription>Where is this property located?</FormDescription>
                                        <Select
                                            disabled={isLoading}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger className="bg-background">
                                                <SelectValue defaultValue={field.value} placeholder="Select a Country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries.map((country) => {
                                                    return <SelectItem key={country.isoCode} value={country.isoCode}>{country.name}</SelectItem>
                                                })}
                                            </SelectContent>
                                        </Select>

                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='state'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select State</FormLabel>
                                        <FormDescription>Which state is this property located?</FormDescription>
                                        <Select
                                            disabled={isLoading || states.length < 1}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger className="bg-background">
                                                <SelectValue defaultValue={field.value} placeholder="Select a State" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {states.map((state) => {
                                                    return <SelectItem key={state.isoCode} value={state.isoCode}>{state.name}</SelectItem>
                                                })}
                                            </SelectContent>
                                        </Select>

                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name='city'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select City</FormLabel>
                                    <FormDescription>In which town/city is this property located?</FormDescription>
                                    <Select
                                        disabled={isLoading || cities.length < 1}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <SelectTrigger className="bg-background">
                                            <SelectValue defaultValue={field.value} placeholder="Select a Town/City" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((city) => {
                                                return <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                                            })}
                                        </SelectContent>
                                    </Select>

                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="locationdescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location Description*</FormLabel>
                                    <FormDescription>
                                        Provide a detailed description of your Hotel.
                                    </FormDescription>
                                    <FormControl>
                                        <Textarea placeholder="Located at the very end of the..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {hotel && !hotel.rooms.length && <Alert className="bg-blue-900 text-white">
                            <Terminal className="h-4 w-4 stroke-white" />
                            <AlertTitle>One last thing!</AlertTitle>
                            <AlertDescription>
                                Your Hotel has been created
                                <div>Time to add some Rooms to complete your Hotel!</div>
                            </AlertDescription>
                        </Alert>}
                        <div className="flex justify-between gap-2 flex-wrap">
                            {/* Delete Hotel Button */}
                            {hotel && <Button onClick={() => handleDeleteHotel(hotel)} variant='outline' type='button' className="max-w-[150px]" disabled={isHotelDeleting || isLoading}>
                                {isHotelDeleting ? <><Loader2 className="max-w-[150px]" />Deleting</> : <><Trash className="max-w-[150px] mr-2 h-4 w-4" />Delete</>}
                            </Button>}

                            {/* View Button */}
                            {hotel && <Button onClick={() => router.push(`/hotel-details/${hotel.id}`)} variant='outline' type='button'><Eye className="mr-2 h-4 w-4" />View</Button>}

                            {/* BUTTION TO OPEN A DIALOG TO ADD ROOMS*/}
                            {hotel && <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger>
                                    <Button type="button" variant="outline" className="max-w-[150px]">
                                        <Plus className="mr-2 h-4 w-4"/>
                                        Add Room(s)
                                    </Button></DialogTrigger>
                                <DialogContent className="max-w-[900px] w-[90%]">
                                    <DialogHeader className="px-2">
                                        <DialogTitle>Add a Room</DialogTitle>
                                        {/* <DialogDescription>
                                            Add details about a room in your Hotel.
                                        </DialogDescription> */}
                                    </DialogHeader>
                                    <AddRoomForm hotel={hotel} handleDialogueOpen={handleDialogueOpen}/>
                                </DialogContent>
                            </Dialog>}

                            {/* Create/Edit hotel Button */}
                            {hotel ? <Button className="max-w-[150px]" disabled={isLoading}> {isLoading ? <><Loader2 className="mr-2 h-4 w-4" /> Updating</> : <><PencilLine className="mr-2 h-4 w-4" />Update</>}</Button> : <Button className="max-w-[150px]" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-2 h-4 w-4" /> Creating</> : <><Pencil className="mr-2 h-4 w-4" /> Create Hotel</>}
                            </Button>}
                        </div>
                        {/* ROOM CARDS */}
                        {hotel && !!hotel.rooms.length && <div>
                            <Separator/>
                            <h3 className="text-lg font-semibold my-4">Your Rooms</h3>
                            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                                {hotel.rooms.map(room => {
                                    return <RoomCard key={room.id} hotel={hotel} room={room}/>
                                })}
                            </div>
                            </div>}
                    </div>
                </div>
            </form>
        </Form>
    </div>);
};

export default AddHotelForm;
