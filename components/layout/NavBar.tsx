'use client'
// import { UserButton } from "@clerk/nextjs";
// import { Link, Outlet, useNavigate } from 'react-router-dom'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import Container from '../Container';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/clerk-react';
import SearchInput from '../SearchInput';
import { ModeToggle } from '../theme-toggle';
import { NavMenu } from './NavMenu';
import SearchWithFilters from '../SearchWithFilters';

const NavBar = () => {
  const router = useRouter()
  const { userId } = useAuth()
  return (
    <div className="sticky top-0 border border-b-primary/10 bg-secondary">
      {/* <UserButton afterSignOutUrl="/" /> */}
      <Container>
        <div className="flex justify-between">
          <div className='flex items-center gap-1 cursor-pointer' onClick={() => router.push('/')}>
            <Image src='/logo.svg' alt='logo' width='30' height='30' />
            <div className='font-bold text-xl'>InnSpot</div>
          </div>
          <SearchWithFilters />
          <div className='flex items-center gap-2'>
            <div>
              <ModeToggle />
              <NavMenu />
            </div>
            <SignedOut>
              <SignInButton>
                <button className="bg-none border-2 border-slate-300 hover:bg-slate-200 text-slate-500 font-bold py-2 px-4 rounded">Sign inn</button>
              </SignInButton>
              <SignUpButton>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Sign Up</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default NavBar;