import { ArrowRight, Globe, MapPin, Sparkles, Calendar, Wallet, Compass, Star, Heart, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-travel.jpg';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with enhanced overlay */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Beautiful travel destination"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20" />
        </div>

        {/* Animated decorative shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full blur-2xl animate-float" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-accent/30 to-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-gradient-to-br from-primary/40 to-transparent rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Floating icons */}
        <div className="absolute top-1/4 left-[15%] animate-float opacity-30" style={{ animationDelay: '0.5s' }}>
          <Plane className="w-8 h-8 text-primary rotate-45" />
        </div>
        <div className="absolute top-1/3 right-[20%] animate-float opacity-30" style={{ animationDelay: '1.5s' }}>
          <Compass className="w-10 h-10 text-accent-foreground" />
        </div>
        <div className="absolute bottom-1/3 left-[10%] animate-float opacity-30" style={{ animationDelay: '2.5s' }}>
          <Star className="w-6 h-6 text-primary fill-primary/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 container max-w-5xl mx-auto px-4 text-center">
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/30 to-accent/20 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-primary/30 shadow-lg shadow-primary/10">
              <Globe className="w-5 h-5 text-primary animate-spin-slow" />
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                AI-Powered Trip Planning
              </span>
              <Sparkles className="w-4 h-4 text-accent-foreground" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              Tour
            </span>
            <span className="bg-gradient-to-r from-primary via-primary to-accent-foreground bg-clip-text text-transparent">
              Gether
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.6s' }}>
            Plan your <span className="text-primary font-semibold">perfect adventure</span> with AI.
            Get personalized itineraries, local gems, and insider tips – all crafted just for you.
          </p>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <Button 
              onClick={() => navigate('/plan')}
              size="lg"
              className="gap-3 h-16 px-10 text-lg rounded-full shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90 group animate-pulse-glow"
            >
              <Sparkles className="w-6 h-6 group-hover:animate-wiggle" />
              Start Your Journey
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Stats row */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 animate-fade-in-up" style={{ animationDelay: '1s' }}>
            {[
              { icon: MapPin, label: 'Destinations', value: '500+' },
              { icon: Star, label: 'Happy Travelers', value: '10K+' },
              { icon: Heart, label: 'Trips Planned', value: '25K+' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-border/50">
                <stat.icon className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center p-2">
            <div className="w-1.5 h-3 bg-primary rounded-full animate-fade-in" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-card to-background relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Your Dream Trip in{' '}
              <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              From destination to detailed itinerary in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                step: '01',
                title: 'Choose Destination',
                description: 'Pick from popular destinations or upload a photo – our AI will identify landmarks and suggest places.',
                gradient: 'from-primary/20 to-primary/5',
                borderColor: 'border-primary/30',
                iconBg: 'bg-gradient-to-br from-primary to-primary/70',
              },
              {
                icon: Calendar,
                step: '02',
                title: 'Set Your Dates',
                description: 'Select travel dates, budget, and preferences. Tell us your travel style and dining preferences.',
                gradient: 'from-accent/30 to-accent/5',
                borderColor: 'border-accent-foreground/30',
                iconBg: 'bg-gradient-to-br from-accent-foreground to-accent-foreground/70',
              },
              {
                icon: Sparkles,
                step: '03',
                title: 'Get Your Itinerary',
                description: 'Our AI creates a personalized day-by-day plan with attractions, restaurants, and insider tips.',
                gradient: 'from-primary/20 to-accent/20',
                borderColor: 'border-primary/30',
                iconBg: 'bg-gradient-to-br from-primary via-primary to-accent-foreground',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`group relative p-8 bg-gradient-to-br ${feature.gradient} rounded-3xl border ${feature.borderColor} hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2`}
              >
                {/* Step number */}
                <span className="absolute top-6 right-6 text-6xl font-bold text-foreground/5 group-hover:text-primary/10 transition-colors">
                  {feature.step}
                </span>
                
                <div className={`w-16 h-16 mb-6 rounded-2xl ${feature.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Vibrant gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/20 to-accent/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_hsl(var(--background))_70%)]" />
        
        {/* Animated shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-primary/30 rounded-full animate-spin-slow" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-accent-foreground/30 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-primary rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-accent-foreground rounded-full animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="container max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="bg-card/80 backdrop-blur-xl p-12 rounded-[2rem] border border-border shadow-2xl">
            <Plane className="w-16 h-16 text-primary mx-auto mb-6 animate-bounce-subtle" />
            
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready for Your Next{' '}
              <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                Adventure?
              </span>
            </h2>
            <p className="text-muted-foreground text-xl mb-10 max-w-xl mx-auto">
              Join thousands of travelers who trust TourGether to create unforgettable experiences.
            </p>
            
            <Button 
              onClick={() => navigate('/plan')}
              size="lg"
              className="gap-3 h-14 px-8 text-lg rounded-full shadow-xl hover:shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-105 group"
            >
              <Wallet className="w-5 h-5" />
              Plan Your Trip Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-foreground">TourGether</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 TourGether • Powered by AI Vision & RAG
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Heart className="w-4 h-4 text-primary fill-primary" />
                Made with love
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
