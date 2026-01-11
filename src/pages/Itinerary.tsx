import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, MapPin, Calendar, Wallet, Users, Download, Share2, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

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

const Itinerary = () => {
  const navigate = useNavigate();
  const [tripData, setTripData] = useState<StoredTripData | null>(null);
  const [itinerary, setItinerary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedTripData = sessionStorage.getItem('tripData');
    const storedItinerary = sessionStorage.getItem('generatedItinerary');
    
    if (storedTripData) {
      setTripData(JSON.parse(storedTripData));
    }
    
    if (storedItinerary) {
      setItinerary(storedItinerary);
    }
    
    if (!storedTripData || !storedItinerary) {
      navigate('/plan');
      return;
    }
    
    setIsLoading(false);
  }, [navigate]);

  if (isLoading || !tripData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your itinerary...</p>
        </div>
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

      {/* Itinerary Content */}
      <section className="py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="overflow-hidden">
            <CardContent className="p-6 md:p-10">
              <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert
                prose-headings:text-foreground prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-primary
                prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-li:text-muted-foreground
                prose-strong:text-foreground
                prose-ul:my-2 prose-ol:my-2
              ">
                <ReactMarkdown>{itinerary}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
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
              sessionStorage.removeItem('generatedItinerary');
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
            © 2025 TourGether • Powered by AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Itinerary;
