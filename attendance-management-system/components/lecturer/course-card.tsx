import { useState, useEffect, useCallback, useMemo } from "react";
import { useSetAtom } from "jotai";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Activity,
  Users,
  PieChart,
  CheckCircle2,
  Clock,
  Timer,
  LogOut as LogOutIcon,
  XCircle,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  createSessionAtom,
  generateSignOutOtpAtom,
  endSessionAtom,
  ActiveSession,
} from "@/lib/atoms/session";
import { Feed } from "@/types/feed";

interface CourseCardProps {
  course: Feed;
  activeSession?: ActiveSession;
  refetchFeed: () => void;
}

export const CourseCard = ({
  course,
  activeSession,
  refetchFeed,
}: CourseCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expiryMinutes, setExpiryMinutes] = useState(10);
  const [timeLeft, setTimeLeft] = useState({ signIn: 0, signOut: 0 });

  const createSession = useSetAtom(createSessionAtom);
  const generateSignOutOtp = useSetAtom(generateSignOutOtpAtom);
  const endSession = useSetAtom(endSessionAtom);

  // Memoized timer calculation with useCallback
  const calculateTimeLeft = useCallback(() => {
    if (!activeSession) return { signIn: 0, signOut: 0 };

    const now = Date.now();
    const signInLeft = Math.max(
      0,
      Math.floor((activeSession.signInExpiry - now) / 1000)
    );
    const signOutLeft = activeSession.signOutExpiry
      ? Math.max(0, Math.floor((activeSession.signOutExpiry - now) / 1000))
      : 0;

    return { signIn: signInLeft, signOut: signOutLeft };
  }, [activeSession]);

  const handleCreateSession = async () => {
    setIsLoading(true);
    const result = await createSession({
      courseId: course.course_id,
      expiryMinutes,
    });
    setIsLoading(false);

    if (result.success) {
      toast.success(
        `Sign-in OTP generated! Expires in ${expiryMinutes} minute${
          expiryMinutes > 1 ? "s" : ""
        }`
      );
      refetchFeed();
    } else {
      toast.error(result.error || "Failed to generate OTP");
    }
  };

  const handleGenerateSignOut = async () => {
    setIsLoading(true);
    const result = await generateSignOutOtp(course.course_id);
    setIsLoading(false);

    if (result.success) {
      toast.success("Sign-out OTP generated successfully!");
      refetchFeed();
    } else {
      toast.error(result.error || "Failed to generate sign-out OTP");
    }
  };

  const handleEndSession = async () => {
    setIsLoading(true);
    const result = await endSession(course.course_id);
    setIsLoading(false);

    if (result.success) {
      toast.success("Session ended successfully!");
      setIsOpen(false);
      refetchFeed();
    } else {
      toast.error(result.error || "Failed to end session");
    }
  };

  // Memoized utility functions
  const formatTime = useMemo(
    () => (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    },
    []
  );

  const getTimeColor = useMemo(
    () => (seconds: number) => {
      if (seconds > 300) return "text-green-600";
      if (seconds > 120) return "text-yellow-600";
      return "text-red-600";
    },
    []
  );

  // Timer effect with useCallback for cleanup
  useEffect(() => {
    if (!activeSession) return;

    const updateTimer = () => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Auto-end session when both OTPs expire
      if (
        newTimeLeft.signIn === 0 &&
        newTimeLeft.signOut === 0 &&
        activeSession.hasSignedIn
      ) {
        handleEndSession();
      }
    };

    // Initial update
    updateTimer();

    // Set interval
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeSession, calculateTimeLeft, handleEndSession]);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between px-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{course.code}</h2>
              {activeSession && (
                <Badge variant="default" className="animate-pulse">
                  <Activity className="w-3 h-3 mr-1" />
                  Session Active
                </Badge>
              )}
            </div>
            <p className="text-base text-muted-foreground mt-1">
              {course.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {course.level} • {course.semester}
            </p>
          </div>
          <Badge variant="outline" className="text-sm px-4 py-2">
            {course.total_sessions} Sessions
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-8">
        <div className="w-full space-y-6 px-4">
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30">
              <Users className="text-primary" size={28} />
              <p className="text-3xl font-bold">{course.student_count}</p>
              <span className="text-xs font-medium text-muted-foreground">
                Enrolled Students
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30">
              <PieChart className="text-primary" size={28} />
              <p className="text-3xl font-bold">{course.attendance_rate}%</p>
              <span className="text-xs font-medium text-muted-foreground">
                Attendance Rate
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Overall Progress
              </p>
              <p className="text-sm font-bold">
                {Math.round(course.attendance_rate)}%
              </p>
            </div>
            <Progress
              className="h-3"
              value={Math.round(course.attendance_rate)}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20">
        <div className="flex flex-col px-4 gap-4 w-full">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                className={cn(
                  "w-full h-12 text-base font-semibold transition-all shadow-md hover:shadow-lg",
                  activeSession && "bg-green-600 hover:bg-green-700"
                )}
              >
                {activeSession ? (
                  <>
                    <CheckCircle2 className="mr-2" size={18} />
                    Manage Active Session
                  </>
                ) : (
                  "Start New Session"
                )}
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {activeSession
                    ? "Active Session Management"
                    : "Start Attendance Session"}
                </DialogTitle>
                <DialogDescription>
                  {course.code} - {course.title}
                </DialogDescription>
              </DialogHeader>

              {!activeSession ? (
                <div className="space-y-6 mt-4">
                  {/* Expiry Time Selection */}
                  <div className="flex flex-col gap-4 bg-gradient-to-br from-muted/50 to-muted/30 p-6 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Settings className="text-primary" size={24} />
                      </div>
                      <div>
                        <Label className="text-base font-semibold">
                          OTP Expiry Time
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Set how long the OTP will remain valid
                        </p>
                      </div>
                    </div>

                    <Select
                      value={expiryMinutes.toString()}
                      onValueChange={(value) => setExpiryMinutes(Number(value))}
                    >
                      <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="Select expiry time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes (Default)</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Session Info */}
                  <div className="flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/5 to-transparent p-8 rounded-lg text-center">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Clock className="text-primary" size={48} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-2">
                        Ready to Start Session
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Generate a sign-in OTP for students to mark their
                        attendance
                      </p>
                    </div>
                    <Button
                      onClick={handleCreateSession}
                      disabled={isLoading}
                      className="w-full h-12 text-base font-semibold"
                      size="lg"
                    >
                      {isLoading
                        ? "Generating..."
                        : `Generate ${expiryMinutes}-Min OTP`}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 mt-4">
                  {/* Sign-In OTP Section */}
                  <div className="p-6 rounded-lg border-2 border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CheckCircle2 className="text-green-600" size={20} />
                        Sign-In OTP
                      </h3>
                      {timeLeft.signIn > 0 && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono text-base",
                            getTimeColor(timeLeft.signIn)
                          )}
                        >
                          <Timer className="mr-1" size={14} />
                          {formatTime(timeLeft.signIn)}
                        </Badge>
                      )}
                    </div>

                    <div className="bg-background p-6 rounded-md text-center">
                      <p className="text-5xl font-bold text-primary tracking-wider mb-2">
                        {activeSession.signInOtp}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Students use this code to sign in
                      </p>
                    </div>

                    {timeLeft.signIn === 0 && (
                      <Alert className="mt-4" variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          Sign-in OTP has expired
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Sign-Out OTP Section */}
                  {activeSession.hasSignedIn && activeSession.signOutOtp ? (
                    <div className="p-6 rounded-lg border-2 border-orange-500/20 bg-orange-500/5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <LogOutIcon className="text-orange-600" size={20} />
                          Sign-Out OTP
                        </h3>
                        {timeLeft.signOut > 0 && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-mono text-base",
                              getTimeColor(timeLeft.signOut)
                            )}
                          >
                            <Timer className="mr-1" size={14} />
                            {formatTime(timeLeft.signOut)}
                          </Badge>
                        )}
                      </div>

                      <div className="bg-background p-6 rounded-md text-center">
                        <p className="text-5xl font-bold text-orange-600 tracking-wider mb-2">
                          {activeSession.signOutOtp}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Students use this code to sign out
                        </p>
                      </div>

                      {timeLeft.signOut === 0 && (
                        <Alert className="mt-4" variant="destructive">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription>
                            Sign-out OTP has expired
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={handleGenerateSignOut}
                      disabled={timeLeft.signIn !== 0 || isLoading}
                      variant="outline"
                      className="w-full h-12 text-base font-semibold border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
                      size="lg"
                    >
                      {isLoading ? "Generating..." : "Generate Sign-Out OTP"}
                    </Button>
                  )}

                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Each OTP expires in {activeSession.expiryMinutes} minute
                      {activeSession.expiryMinutes > 1 ? "s" : ""}. Session
                      auto-ends when all OTPs expire.
                    </AlertDescription>
                  </Alert>

                  <DialogFooter>
                    <Button
                      onClick={handleEndSession}
                      disabled={isLoading}
                      variant="destructive"
                      className="w-full h-12 text-base font-semibold"
                    >
                      {isLoading ? "Ending..." : "End Session Now"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="w-full h-12 text-base font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
            asChild
          >
            <Link href={`/lecturer/attendance/${course.course_id}`}>
              View Attendance Records
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
