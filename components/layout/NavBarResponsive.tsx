'use client'

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModeToggle } from "../theme-toggle";
import { NavMenu } from "./NavMenu";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { BookOpenCheck, Hotel, Menu, Plus, X } from "lucide-react";
import { Button } from "../ui/button";
import SearchWithFilters from "../SearchWithFilters";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
// import { span } from "../ui/dropdown-menu";

const NavBarResponsive = () => {

  const router = useRouter()

  return (
    <div className="container mx-auto flex items-center border-b-2  px-6 py-2 h-24">
      {/* LOGO */}
      <div className='flex items-center gap-1 cursor-pointer' onClick={() => router.push('/')}>
        <Image src='/logo.svg' alt='logo' width='30' height='30' />
        <div className='font-bold text-xl'>InnSpot</div>
      </div>

      {/* MIDDLE SEARCHBAR */}
      <div className="grow">
        {/* searchbar goes here */}
        <SearchWithFilters />

      </div>
      <div className="flex grow items-center justify-end sm:hidden">
        {/* <Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
          <span className="sr-only">Open Menu</span>
          <Menu />
        </Button> */}
        <Drawer>
          <DrawerTrigger className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-700">
            <Menu />
          </DrawerTrigger>
          <DrawerContent className="grid gap-y-8">
            {/* <DrawerHeader>
              <DrawerTitle>Are you absolutely sure?</DrawerTitle>
              <DrawerDescription>This action cannot be undone.</DrawerDescription>
            </DrawerHeader> */}
            <div className="p-5">
              <div className='flex flex-col items-center gap-2'>
                <div>
                  <span className="cursor-pointer flex gap-2 items-center py-2" onClick={() => router.push('/hotel/new')}>
                    <Plus size={15} /> <span>Add Hotel</span>
                  </span>
                  <span className="cursor-pointer flex gap-2 items-center py-2" onClick={() => router.push('/my-hotels')}>
                    <Hotel size={15} />  <span>My Hotels</span>
                  </span>
                  <span className="cursor-pointer flex gap-2 items-center py-2" onClick={() => router.push('/my-bookings')}>
                    <BookOpenCheck size={15} />  <span>My Bookings</span>
                  </span>
                </div>

              </div>
            </div>
            <DrawerFooter className="flex flex-auto justify-center items-center">
              <div><ModeToggle /></div>
              <div>
                <SignedOut>
                  <SignInButton>
                    <button className="bg-none border-2 border-slate-300 hover:bg-slate-200 text-slate-500 font-bold py-2 px-4 rounded">Sign Inn</button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Sign Up</button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
              <DrawerClose>
                <div className="inline-flex items-center justify-center rounded-full bg-secondary p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-700"><X /></div>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

      </div>

      {/* USER BUTTONS AND SHIT // RIGHT SIDE*/}
      <div className='sm:block items-center gap-2 hidden'>

        <div className="flex gap-2">
          <ModeToggle />

          <SignedOut>
            <SignInButton>
              <Button variant="outline" className="border-1 border-slate-300">Sign Inn</Button>
            </SignInButton>
            <SignUpButton>
              <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <NavMenu />
            <UserButton />
          </SignedIn>
        </div>

        {/* <Button variant="outline" className="border-1 border-slate-300">Sign Inn</Button> */}


      </div>
    </div>
  );
}

export default NavBarResponsive;