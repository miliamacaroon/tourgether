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
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-6 md:p-10">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <div className="mt-10 first:mt-0 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0 shadow-md">
                          {String(children).match(/Day (\d+)/)?.[1] || '📍'}
                        </div>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold text-foreground">{children}</h2>
                        </div>
                      </div>
                    </div>
                  ),
                  h3: ({ children }) => (
                    <div className="mt-6 mb-3 ml-4 md:ml-16">
                      <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-lg border border-border">
                        <span className="text-sm font-semibold text-accent-foreground">{children}</span>
                      </div>
                    </div>
                  ),
                  p: ({ children }) => (
                    <p className="text-muted-foreground leading-relaxed mb-4 ml-4 md:ml-16 text-sm md:text-base">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-3 mb-6 ml-4 md:ml-16 list-none">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="space-y-3 mb-6 ml-4 md:ml-16 list-none">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-3 text-muted-foreground text-sm md:text-base bg-muted/30 p-3 rounded-lg">
                      <span className="text-primary text-lg">▸</span>
                      <span className="flex-1">{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <span className="text-primary font-medium">{children}</span>
                  ),
                  hr: () => (
                    <hr className="my-8 border-border ml-4 md:ml-16" />
                  ),
                }}
              >
                {itinerary}
              </ReactMarkdown>
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
