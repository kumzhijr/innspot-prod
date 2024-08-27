'use Client'

import * as z from 'zod'
import { Hotel, Room } from "@prisma/client"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '../ui/button'
import axios from 'axios'
import { Loader2, Pencil, PencilLine, Plus, XCircle } from 'lucide-react'
import { UploadButton } from '../uploadthing'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
// import { toast } from '../ui/use-toast'

interface AddHotelFormProps {
    hotel?: Hotel & {
        rooms: Room[]
    }
    room?: Room
    handleDialogueOpen: () => void
}

const formSchema = z.object({
    title: z.string().min(3, {
        message: 'Title must be at least 3 character long'
    }),
    description: z.string().min(3, {
        message: 'Description must be at least 3 character long'
    }),
    bedCount: z.coerce.number().min(1, { message: 'Bed count is required.' }),
    guestCount: z.coerce.number().min(1, { message: 'Bed count is required.' }),
    bathroomCount: z.coerce.number().min(1, { message: 'Bed count is required.' }),
    kingBed: z.coerce.number().min(0),
    queenBed: z.coerce.number().min(0),
    image: z.string().min(1, {
        message: 'Image is required'
    }),
    breakFastPrice: z.coerce.number().optional(),
    roomPrice: z.coerce.number().min(1, {
        message: 'Room price is required'
    }),
    roomService: z.boolean().optional(),
    TV: z.boolean().optional(),
    balcony: z.boolean().optional(),
    freeWifi: z.boolean().optional(),
    airCondition: z.boolean().optional(),
    soundProofed: z.boolean().optional(),
})

const AddRoomForm = ({ hotel, room, handleDialogueOpen }: AddHotelFormProps) => {

    const [image, setImage] = useState<string | undefined>(room?.image)
    const [imageIsDeleting, setImageIsDeleting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: room || {
            title: '',
            description: '',
            bedCount: 0,
            guestCount: 0,
            bathroomCount: 0,
            kingBed: 0,
            queenBed: 0,
            image: '',
            breakFastPrice: 0,
            roomPrice: 0,
            roomService: false,
            TV: false,
            balcony: false,
            freeWifi: false,
            airCondition: false,
            soundProofed: false,
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

    // Submit button function
    // this is what happens when you click the submit button
    // CREATE THE HOTEL
    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        if (hotel && room) {
            // update/edit hotel
            axios.patch(`/api/room/${room.id}`, values).then((res) => {
                toast({
                    variant: "success",
                    description: "Room Updated Successfully!🎉"
                })
                router.refresh()
                setIsLoading(false)
                handleDialogueOpen()
            }).catch((err) => {
                console.log(err)
                toast({
                    variant: "destructive",
                    description: "Something went wrong. Please try again later."
                })
                setIsLoading(false)
            })
        } else {
            if(!hotel) return;
            // create room
            axios.post('/api/room', {...values, hotelId: hotel.id}).then((res) => {
                toast({
                    variant: "success",
                    description: "🎉 Room added Successfully!."
                })
                router.refresh()
                setIsLoading(false)
                handleDialogueOpen()
            }).catch((err) => {
                console.log(err)
                toast({
                    variant: "destructive",
                    description: "Something went wrong. Please try again later."
                })
                setIsLoading(false)
            })
        }
    }

    return (<div className="max-h-[75vh] overflow-y-auto px-2">
        <Form {...form}>
            <form className="space-y-8">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Room Name*</FormLabel>
                            <FormDescription>
                                Provide a name for this room type.
                            </FormDescription>
                            <FormControl>
                                <Input placeholder="Double King Suite" {...field} />
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
                            <FormLabel>Room Description*</FormLabel>
                            <FormDescription>
                                Provide a description for this room type.
                            </FormDescription>
                            <FormControl>
                                <Textarea placeholder="With two King sized beds, a balcony and a..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div>
                    <FormLabel>Choose Room Features</FormLabel>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <FormField
                            control={form.control}
                            name="roomService"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel>24 hr Room Service</FormLabel>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="TV"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel>Television</FormLabel>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="balcony"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel>Balcony</FormLabel>
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
                                    <FormLabel>Free Internet</FormLabel>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="airCondition"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel>Air Conditioining</FormLabel>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="soundProofed"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel>Sound-Proofing</FormLabel>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* UPLOAD IMAGE FORM FIELD */}
                <FormField
                    control={form.control}
                    name='image'
                    render={({ field }) => (
                        <FormItem className='flex flex-col space-y-3'>
                            <FormLabel>UPLOAD AN IMAGE*</FormLabel>
                            <FormDescription>Choose an image to nicely showcase this Room.</FormDescription>
                            <FormControl>
                                {/* Display Image after uploading */}
                                {image ? <>
                                    <div className="relative max-w-[400px] min-w-[200px] max-h-[400px] min-h-[200px] mt-4">
                                        <Image fill src={image} alt="Room Image" className="object-contain" />
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
                <div className='flex flex-row gap-6'>
                    <div className='flex-1 flex flex-col gap-6'>
                        <FormField
                            control={form.control}
                            name="roomPrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room Price(USD)</FormLabel>
                                    <FormDescription>
                                        Price per Night(24hrs)
                                    </FormDescription>
                                    <FormControl>
                                        <Input type='number' min={0}  {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bedCount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bed Count*</FormLabel>
                                    <FormDescription>
                                        How many beds are in this Room?
                                    </FormDescription>
                                    <FormControl>
                                        <Input type='number' min={0} max={8} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="guestCount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Guest Count*</FormLabel>
                                    <FormDescription>
                                        How many guests are allowed in this Room?
                                    </FormDescription>
                                    <FormControl>
                                        <Input type='number' min={0} max={8} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bathroomCount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bathoom Count *</FormLabel>
                                    <FormDescription>
                                        How many bathrooms are available in this Room?
                                    </FormDescription>
                                    <FormControl>
                                        <Input type='number' min={0} max={8} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='flex-1 flex flex-col gap-6'>
                        <FormField
                            control={form.control}
                            name="breakFastPrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Breakfast Price(USD)</FormLabel>
                                    <FormDescription>
                                        How much is breakfats?
                                    </FormDescription>
                                    <FormControl>
                                        <Input type='number' min={0}  {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="kingBed"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>King Sized Bed</FormLabel>
                                    <FormDescription>
                                        How many King Sized beds are in this Room?
                                    </FormDescription>
                                    <FormControl>
                                        <Input type='number' min={0} max={8} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="queenBed"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Queen Sized Bed</FormLabel>
                                    <FormDescription>
                                        How many Queen Sized Beds are in this Room?
                                    </FormDescription>
                                    <FormControl>
                                        <Input type='number' min={0} max={8} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <div className='pt-4 pb-2'>
                    {/* Create/Edit ROOM Button */}
                    {room ? <Button onClick={form.handleSubmit(onSubmit)} type="button" className="max-w-[150px]" disabled={isLoading}> {isLoading ? <><Loader2 className="mr-2 h-4 w-4" /> Updating</> : <><PencilLine className="mr-2 h-4 w-4" />Update Room</>}</Button> : <Button onClick={form.handleSubmit(onSubmit)} type="button" className="max-w-[150px]" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4" /> Adding</> : <><Plus className="mr-2 h-4 w-4" /> Add Room</>}
                    </Button>}
                </div>
            </form>
        </Form>
    </div>);
}

export default AddRoomForm;