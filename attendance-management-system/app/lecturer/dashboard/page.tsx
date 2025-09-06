"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { LogOut, PieChart, Timer, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const Dashboard = () => {
  const [otp, setOtp] = useState("")
  return (
    <div className="relative w-full">
      <div className="absolute -top-14 right-4">
        <button className='w-30 flex gap-2 items-center justify-center cursor-pointer border rounded-lg border-black p-2 text-xs'>
          <LogOut size={15} /> Log Out
        </button>
      </div>

      <div className="border-t-2 border-background/90 p-2 my-5">
        <p className="text-lg font-semibold">
          Welcome, <span className="text-2xl font-extrabold">DR. AHMED RAFIU</span>
        </p>
        <span className="text-sm font-light">
          Manage attendance for your courses.
        </span>
      </div>
      <div className="flex flex-col gap-5">
        {[1, 2, 3, 4].map((el) => (
          <Card key={el}>
            <CardHeader>
              <div className="flex items-center justify-between px-8">
                <div>
                  <p className="text-lg font-bold">History of library</p>
                  <p className="text-sm font-light">KWASULIS116</p>
                </div>
                <div className="rounded-2xl border-black p-2 border-1 text-xs font-light text-center">
                  12 of 30 Classes
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full space-y-5 p-10">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center justify-between gap-1">
                    <Users />
                    <p className='text-2xl font-bold'>576</p>
                    <span className='text-xs font-light'>Students</span>
                  </div>
                  <div className="flex flex-col items-center justify-between gap-1">
                    <PieChart />
                    <p className='text-2xl font-bold'>89%</p>
                    <span className='text-sm font-light'>Attendance</span>
                  </div>
                </div>
                <div className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <p className='text-xs font-light'>Course progress</p>
                    <p className='text-xs font-light'>65%</p>
                  </div>
                  <Progress className='h-4' value={65} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className='flex flex-col px-10 gap-5 w-full'>
                <OtpDialog otp={otp} setOtp={setOtp} />
                <Button className="cursor-pointer w-full p-5" onClick={() => {}}>
                  <Link href="/lecturer/attendance">Attendance</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default Dashboard

const OtpDialog = ({otp, setOtp}: {
  otp: string,
  setOtp: (otp: string) => void
}) => {

  const randomInt = Math.round(Math.random() * 100000) + 99999;
  const isActive: boolean  = true
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="cursor-pointer w-full p-5">Generate Otp</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Attendance Otp</DialogTitle>
          <DialogDescription>KWASULIS116</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-3 bg-gray-100 p-5 text-center mt-5">
          {!otp ? (
            <>
              <p className="font-light text-xs">No Otp generated yet</p>
              <Button
                onClick={() => setOtp(randomInt.toString())}
                className="w-full p-5"
              >
                Generate OTP
              </Button>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-primary">{otp}</p>
              <p className="font-light text-sm">
                Share this code with your students to mark attendance
              </p>
            </>
          )}
        </div>

        {otp && (
        <DialogFooter className="sm:justify-start mt-10">
           <div className="flex flex-col items-center justify-center gap-5 p-5 text-center">
            <Button size="lg" variant="ghost" className={cn("w-full p-5 border-primary border-1", isActive && "bg-primary text-white")}>
              {!isActive ? "Activate OTP" : "OTP is Active"}
            </Button>
            <p className='flex items-center justify-center gap-2 text-primary/75 text-sm p-2 w-full bg-gray-100'><Timer /> OTP will expire after 10 minutes</p>
          </div>
        </DialogFooter>
        )}
      </DialogContent>
        
    </Dialog>
  );
}