import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, MapPin, Calendar, Wallet, Users, Download, Share2, Sparkles, Clock, Utensils, Camera, Coffee, Sunset, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface StoredTripData {
  destination: string;
  startDate: string;
  endDate: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  tripType: string;
  pace: string;
  diningStyle: string;
  travelers: number;
  daysCount: number;
}

// Sample itinerary data - in real app this would come from AI backend
const generateSampleItinerary = (destination: string, days: number) => {
  const activities = [
    { time: '09:00', icon: Coffee, title: 'Morning Start', description: 'Breakfast at a local café' },
    { time: '10:30', icon: Camera, title: 'Sightseeing', description: 'Visit iconic landmarks' },
    { time: '13:00', icon: Utensils, title: 'Lunch Break', description: 'Try authentic local cuisine' },
    { time: '15:00', icon: MapPin, title: 'Explore', description: 'Discover hidden gems' },
    { time: '18:00', icon: Sunset, title: 'Golden Hour', description: 'Perfect photo opportunities' },
    { time: '20:00', icon: Moon, title: 'Evening', description: 'Dinner and nightlife' },
  ];

  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1} in ${destination}`,
    activities: activities.slice(0, 4 + (i % 3)),
  }));
};

const Itinerary = () => {
  const navigate = useNavigate();
  const [tripData, setTripData] = useState<StoredTripData | null>(null);
  const [itinerary, setItinerary] = useState<{ day: number; title: string; activities: any[] }[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('tripData');
    if (stored) {
      const data = JSON.parse(stored) as StoredTripData;
      setTripData(data);
      setItinerary(generateSampleItinerary(data.destination, data.daysCount));
    } else {
      navigate('/plan');
    }
  }, [navigate]);

  if (!tripData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/plan" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Edit Trip</span>
          </Link>
          
          <Link to="/" className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">TourGether</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => toast.success('Sharing coming soon!')}>
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => toast.success('PDF export coming soon!')}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary/20 to-accent/30 py-12">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Generated Itinerary</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Your Trip to {tripData.destination}
          </h1>
          <p className="text-muted-foreground text-lg">
            {tripData.daysCount} days of adventure await you
          </p>
        </div>
      </section>

      {/* Trip Summary */}
      <section className="py-8 border-b border-border">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Dates</p>
                <p className="font-semibold text-sm">{formatDate(tripData.startDate)} - {formatDate(tripData.endDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
              <Clock className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-semibold text-sm">{tripData.daysCount} days</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
              <Wallet className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="font-semibold text-sm">{tripData.currency} {tripData.budgetMin.toLocaleString()} - {tripData.budgetMax.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
              <Users className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Travelers</p>
                <p className="font-semibold text-sm">{tripData.travelers} {tripData.travelers === 1 ? 'person' : 'people'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Itinerary */}
      <section className="py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Day-by-Day Itinerary</h2>
          
          <div className="space-y-8">
            {itinerary.map((day) => (
              <Card key={day.day} className="overflow-hidden">
                <CardHeader className="bg-primary/10">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {day.day}
                    </div>
                    <span>{day.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {day.activities.map((activity, idx) => (
                      <div key={idx}>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-16 text-sm font-medium text-muted-foreground">
                            {activity.time}
                          </div>
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <activity.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                          </div>
                        </div>
                        {idx < day.activities.length - 1 && (
                          <Separator className="my-4 ml-20" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-card border-t border-border">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold mb-4">Want to make changes?</h3>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate('/plan')}>
              Edit Trip Details
            </Button>
            <Button onClick={() => {
              sessionStorage.removeItem('tripData');
              navigate('/plan');
            }}>
              Plan New Trip
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 TourGether • Powered by AI Vision & RAG
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Itinerary;
