import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Clock,
  User,
  Calendar,
  CreditCard,
  CheckCircle,
  Loader2,
  AlertCircle,
  ShoppingBag,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

type CheckoutStep = "cart" | "schedule" | "payment" | "confirmation";

interface BookingResult {
  id: number;
  service_name: string;
  status: string;
  start_time: string;
}

export default function Cart() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    items,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartTotal,
    getItemCount,
  } = useCart();

  const [step, setStep] = useState<CheckoutStep>("cart");
  const [submitting, setSubmitting] = useState(false);
  const [bookingResults, setBookingResults] = useState<BookingResult[]>([]);

  // Payment form state (mock)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const validateSchedule = () => {
    for (const item of items) {
      if (!item.selectedDate || !item.selectedTime) {
        toast({
          title: "Missing schedule",
          description: `Please select date and time for "${item.name}"`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const validatePayment = () => {
    if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
      toast({
        title: "Missing payment information",
        description: "Please fill in all payment details",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleProceedToSchedule = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to continue checkout",
      });
      navigate("/auth");
      return;
    }
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some services to your cart first",
      });
      return;
    }
    setStep("schedule");
  };

  const handleProceedToPayment = () => {
    if (validateSchedule()) {
      setStep("payment");
    }
  };

  const handleCompleteCheckout = async () => {
    if (!validatePayment()) return;

    setSubmitting(true);
    const results: BookingResult[] = [];
    const errors: string[] = [];

    try {
      // Create a booking for each cart item
      for (const item of items) {
        try {
          const startTime = new Date(
            `${item.selectedDate}T${item.selectedTime}:00`
          );

          const response = await api.post("/bookings", {
            service_id: item.serviceId,
            start_time: startTime.toISOString(),
            notes: item.notes || null,
          });

          results.push({
            id: response.data.id,
            service_name: item.name,
            status: "pending",
            start_time: startTime.toISOString(),
          });
        } catch (error: any) {
          console.error(`Error booking ${item.name}:`, error);
          errors.push(
            `${item.name}: ${error.response?.data?.detail || "Failed to book"}`
          );
        }
      }

      setBookingResults(results);

      if (results.length > 0) {
        setStep("confirmation");
        clearCart();

        if (errors.length > 0) {
          toast({
            title: "Some bookings failed",
            description: `${results.length} succeeded, ${errors.length} failed`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "All bookings confirmed!",
            description: `${results.length} booking(s) created successfully`,
          });
        }
      } else {
        toast({
          title: "Checkout failed",
          description: "Could not create any bookings. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const stepIndex = ["cart", "schedule", "payment", "confirmation"].indexOf(
    step
  );

  if (!user && step !== "cart") {
    navigate("/auth");
    return null;
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
                if (step === "cart") navigate(-1);
                else if (step === "schedule") setStep("cart");
                else if (step === "payment") setStep("schedule");
              }}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {step === "cart"
                ? "Continue Shopping"
                : step === "schedule"
                ? "Back to Cart"
                : "Back to Schedule"}
            </Button>
          )}

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {["Cart", "Schedule", "Payment", "Confirmation"].map((s, index) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      stepIndex === index
                        ? "bg-primary text-primary-foreground"
                        : stepIndex > index
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stepIndex > index ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground hidden sm:block">
                    {s}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`w-8 sm:w-16 h-1 mx-1 rounded ${
                      stepIndex > index ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Cart */}
              {step === "cart" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      My Cart ({getItemCount()})
                    </CardTitle>
                    <CardDescription>
                      Review your selected services before checkout
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {items.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mb-2">
                          Your cart is empty
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Browse our services and add some to your cart
                        </p>
                        <Button onClick={() => navigate("/services")}>
                          Browse Services
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-4 p-4 border rounded-lg"
                          >
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{item.name}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {item.description}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatDuration(item.duration_minutes)}
                                </span>
                                {item.provider && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {item.provider.full_name}
                                  </span>
                                )}
                              </div>
                              <p className="text-lg font-bold text-primary mt-2">
                                ${item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  {items.length > 0 && (
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant="hero"
                        onClick={handleProceedToSchedule}
                      >
                        Proceed to Schedule
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              )}

              {/* Step 2: Schedule */}
              {step === "schedule" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Schedule Your Services
                    </CardTitle>
                    <CardDescription>
                      Select a date and time for each service
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion
                      type="multiple"
                      defaultValue={items.map((i) => `item-${i.id}`)}
                    >
                      {items.map((item, index) => (
                        <AccordionItem key={item.id} value={`item-${item.id}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                              <Badge variant="outline">{index + 1}</Badge>
                              <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.selectedDate && item.selectedTime
                                    ? `${new Date(
                                        item.selectedDate
                                      ).toLocaleDateString()} at ${
                                        item.selectedTime
                                      }`
                                    : "Not scheduled"}
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Select Date</Label>
                                  <Input
                                    type="date"
                                    min={getMinDate()}
                                    value={item.selectedDate || ""}
                                    onChange={(e) =>
                                      updateCartItem(item.id, {
                                        selectedDate: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Select Time</Label>
                                  <Select
                                    value={item.selectedTime || ""}
                                    onValueChange={(value) =>
                                      updateCartItem(item.id, {
                                        selectedTime: value,
                                      })
                                    }
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
                                <Label>Special Requests (Optional)</Label>
                                <Textarea
                                  placeholder="Any special requests..."
                                  value={item.notes || ""}
                                  onChange={(e) =>
                                    updateCartItem(item.id, {
                                      notes: e.target.value,
                                    })
                                  }
                                  rows={2}
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant="hero"
                      onClick={handleProceedToPayment}
                    >
                      Proceed to Payment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Step 3: Payment */}
              {step === "payment" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Details
                    </CardTitle>
                    <CardDescription>
                      Enter your payment information to complete checkout
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertCircle className="w-4 h-4" />
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
                      onClick={handleCompleteCheckout}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Pay ${getCartTotal().toFixed(2)}</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Step 4: Confirmation */}
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
                      {bookingResults.length} booking(s) have been created
                      successfully
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {bookingResults.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="text-left">
                            <p className="font-semibold">
                              {result.service_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(result.start_time).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">#{result.id}</Badge>
                            <Badge
                              variant="outline"
                              className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                            >
                              Pending
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Alert>
                      <Clock className="w-4 h-4" />
                      <AlertDescription>
                        Your bookings are <strong>pending confirmation</strong>{" "}
                        from the providers. You'll receive notifications once
                        they're confirmed.
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
            {step !== "confirmation" && (
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No items in cart
                      </p>
                    ) : (
                      <>
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground truncate max-w-[150px]">
                              {item.name}
                            </span>
                            <span className="font-medium">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                        ))}

                        <Separator />

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Subtotal ({getItemCount()} items)
                          </span>
                          <span>${getCartTotal().toFixed(2)}</span>
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
                            ${getCartTotal().toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
