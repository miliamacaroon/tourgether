import { ArrowRight, Globe, MapPin, Sparkles, Calendar, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-travel.jpg';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Beautiful travel destination"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 container max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Trip Planning</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            TourGether
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Plan your perfect trip with AI. Get personalized itineraries, local recommendations, and insider tips – all in one place.
          </p>

          <Button 
            onClick={() => navigate('/plan')}
            size="lg"
            className="gap-2 h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            Start Planning
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How TourGether Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to your dream vacation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center p-8 bg-background rounded-2xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Choose Destination</h3>
              <p className="text-muted-foreground">
                Tell us where you want to go – pick from popular destinations or enter your dream location.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center p-8 bg-background rounded-2xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Set Your Dates</h3>
              <p className="text-muted-foreground">
                Select your travel dates and tell us about your budget and travel style preferences.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center p-8 bg-background rounded-2xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Your Itinerary</h3>
              <p className="text-muted-foreground">
                Our AI creates a personalized day-by-day itinerary with restaurants, attractions, and tips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/20 to-accent/30">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to plan your next adventure?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join thousands of travelers who trust TourGether to create unforgettable experiences.
          </p>
          <Button 
            onClick={() => navigate('/plan')}
            size="lg"
            className="gap-2 h-14 px-8 text-lg rounded-full"
          >
            <Wallet className="w-5 h-5" />
            Plan Your Trip Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 TourGether • Powered by AI Vision & RAG
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
