import { BookA, BookOpen, LogOut, User } from 'lucide-react';
import React from 'react'
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getData } from '@/context/userContext';

const Navbar = () => {
    const {user, setUser} = getData();
    const accessToken = localStorage.getItem("accessToken");
    console.log(user);
    const logoutHandler = async ()=>{
        try {
            const res = await axios.post(`http://localhost:8000/user/logout`,{},{
                headers:{
                    Authorization:`Bearer ${accessToken}`
                }
            })
            if(res.data.success){
                setUser(null)
                toast.success(res.data.message);
                localStorage.clear();
            }
        } catch (error) {
            console.log(error);
        }
    }
  return (
    <nav className='p-2 border-gray-200 bg-transparent'>
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
            {
                // logo swction
            }
            <div className='flex gap-2 items-center'>
                <BookOpen className='h-6 w-6 text-green-800'></BookOpen>
                <h1 className='font-bold text-xl'><span className='text-green-600'>Notes</span>App</h1>
            </div>
            <div className='flex gap-7 items-center'>

    <ul className='flex gap-7 items-center text-lg font-semibold'>
        <li>Features</li>
        <li>Pricing</li>
        <li>About</li>
        {
            user?<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="outline" />}>
   
      <Avatar>
     <AvatarImage src="https://github.com/shadcn.png" />
     <AvatarFallback>CN</AvatarFallback>
      </Avatar>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuGroup>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuItem><User/>Profile</DropdownMenuItem>
      <DropdownMenuItem><BookA/>Notes</DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
     
      <DropdownMenuItem onClick={logoutHandler}><LogOut/>Logout</DropdownMenuItem>
    </DropdownMenuGroup>
  </DropdownMenuContent>
</DropdownMenu>:<Link to={'/login'}><li>Login</li></Link>
        }
    </ul>
            </div>
        </div>
      
    </nav>
  )
}

export default Navbar
