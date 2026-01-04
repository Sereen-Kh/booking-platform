import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Calendar,
  Clock,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Loader2,
  User,
  MapPin,
  DollarSign,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category_id: number;
  image_url?: string;
  location?: string;
  provider_id: number;
  provider?: {
    id: number;
    full_name: string;
    email: string;
  };
}

type CheckoutStep = "details" | "payment" | "confirmation";

export default function BookingCheckout() {
  const { serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<CheckoutStep>("details");
  const [bookingId, setBookingId] = useState<number | null>(null);

  // Booking form state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");

  // Payment form state (mock)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  useEffect(() => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book a service",
      });
      navigate("/auth");
      return;
    }
    if (serviceId) {
      fetchService();
    }
  }, [serviceId, user]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/services/${serviceId}`);
      setService(response.data);
    } catch (error: any) {
      console.error("Error fetching service:", error);
      toast({
        title: "Error",
        description: "Failed to load service details",
        variant: "destructive",
      });
      navigate("/services");
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsSubmit = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select a date and time for your booking",
        variant: "destructive",
      });
      return;
    }
    setStep("payment");
  };

  const handlePaymentSubmit = async () => {
    // Validate payment fields (mock validation)
    if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
      toast({
        title: "Missing payment information",
        description: "Please fill in all payment details",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Combine date and time into a datetime
      const startTime = new Date(`${selectedDate}T${selectedTime}:00`);

      // Create the booking via API
      const response = await api.post("/bookings", {
        service_id: parseInt(serviceId!),
        start_time: startTime.toISOString(),
        notes: notes || null,
      });

      setBookingId(response.data.id);
      setStep("confirmation");

      toast({
        title: "Booking confirmed!",
        description: "Your booking has been successfully created.",
      });
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking failed",
        description:
          error.response?.data?.detail ||
          "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Service not found</h2>
            <Button onClick={() => navigate("/services")}>
              Browse Services
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          {step !== "confirmation" && (
            <Button
              variant="ghost"
              onClick={() => {
                if (step === "payment") {
                  setStep("details");
                } else {
                  navigate(-1);
                }
              }}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {step === "payment" ? "Back to Details" : "Back"}
            </Button>
          )}

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {["details", "payment", "confirmation"].map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : ["details", "payment", "confirmation"].indexOf(step) >
                        index
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {["details", "payment", "confirmation"].indexOf(step) >
                  index ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 2 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded ${
                      ["details", "payment", "confirmation"].indexOf(step) >
                      index
                        ? "bg-green-500"
                        : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Booking Details */}
              {step === "details" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Book Your Appointment</CardTitle>
                    <CardDescription>
                      Select your preferred date and time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Select Date</Label>
                        <Input
                          id="date"
                          type="date"
                          min={getMinDate()}
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Select Time</Label>
                        <Select
                          value={selectedTime}
                          onValueChange={setSelectedTime}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a time" />
                          </SelectTrigger>
                          <SelectContent>
                            {generateTimeSlots().map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Special Requests (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special requests or notes for the provider..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant="hero"
                      onClick={handleDetailsSubmit}
                    >
                      Continue to Payment
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Step 2: Payment */}
              {step === "payment" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Details
                    </CardTitle>
                    <CardDescription>
                      Enter your payment information to complete the booking
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <Shield className="w-4 h-4" />
                      <AlertDescription>
                        This is a demo checkout. No real payment will be
                        processed.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          maxLength={19}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input
                            id="cvc"
                            placeholder="123"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant="hero"
                      onClick={handlePaymentSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Pay ${service.price.toFixed(2)}</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Step 3: Confirmation */}
              {step === "confirmation" && (
                <Card className="text-center">
                  <CardHeader>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl">
                      Booking Confirmed!
                    </CardTitle>
                    <CardDescription>
                      Your booking has been successfully placed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        Booking ID
                      </p>
                      <p className="text-2xl font-mono font-bold">
                        #{bookingId}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          Date
                        </p>
                        <p className="font-semibold">
                          {new Date(selectedDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          Time
                        </p>
                        <p className="font-semibold">{selectedTime}</p>
                      </div>
                    </div>

                    <Alert>
                      <Clock className="w-4 h-4" />
                      <AlertDescription>
                        Your booking is <strong>pending confirmation</strong>{" "}
                        from the provider. You'll receive a notification once
                        it's confirmed.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                    <Button
                      className="w-full"
                      variant="hero"
                      onClick={() => navigate("/customer/dashboard")}
                    >
                      View My Bookings
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => navigate("/services")}
                    >
                      Browse More Services
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Service Image */}
                  {service.image_url && (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}

                  {/* Service Details */}
                  <div>
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                  </div>

                  <Separator />

                  {/* Provider */}
                  {service.provider && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Provider
                        </p>
                        <p className="font-medium">
                          {service.provider.full_name}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Duration */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">
                        {formatDuration(service.duration_minutes)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {service.location && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Location
                        </p>
                        <p className="font-medium">{service.location}</p>
                      </div>
                    </div>
                  )}

                  {/* Selected Date/Time */}
                  {selectedDate && selectedTime && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Appointment
                          </p>
                          <p className="font-medium">
                            {new Date(selectedDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}{" "}
                            at {selectedTime}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span>${service.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Platform Fee
                      </span>
                      <span>$0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        ${service.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {step === "confirmation" && (
                    <Badge
                      className="w-full justify-center py-2"
                      variant="secondary"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Payment Successful
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
