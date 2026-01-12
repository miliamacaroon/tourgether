import { useState } from 'react';
import { MapPin, Search, Sparkles, Upload, X, Loader2, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { POPULAR_DESTINATIONS } from '@/types/trip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface DestinationStepProps {
  destination: string;
  onDestinationChange: (value: string) => void;
  onVisionDetection?: (data: VisionDetectionResult) => void;
}

export interface VisionDetectionResult {
  detected: boolean;
  region: string | null;
  confidence: number;
  landmark_name: string | null;
  destination_city: string | null;
  description: string;
  suggestions: {
    primary_trip_type: string;
    secondary_trip_types: string[];
    destinations: string[];
    budget_modifier: number;
    currency: string;
    best_seasons: string[];
    auto_destination: string | null;
  };
}

export const DestinationStep = ({ destination, onDestinationChange, onVisionDetection }: DestinationStepProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<VisionDetectionResult | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setUploadedImage(base64);
      await analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageBase64: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('identify-landmark', {
        body: { imageBase64 }
      });

      if (error) {
        console.error('Vision API error:', error);
        toast.error('Failed to analyze image. Please try again.');
        return;
      }

      if (data?.success && data?.detection) {
        const result: VisionDetectionResult = {
          detected: data.detection.detected,
          region: data.detection.region,
          confidence: data.detection.confidence,
          landmark_name: data.detection.landmark_name,
          destination_city: data.detection.destination_city,
          description: data.detection.description,
          suggestions: data.suggestions
        };

        setDetectionResult(result);

        // Auto-fill destination if detected
        if (result.suggestions?.auto_destination) {
          onDestinationChange(result.suggestions.auto_destination);
        }

        // Pass detection to parent for trip type/budget suggestions
        if (onVisionDetection) {
          onVisionDetection(result);
        }

        if (result.detected && result.confidence >= 0.6) {
          toast.success(`Detected: ${result.region?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`);
        } else if (result.detected) {
          toast.info('Image analyzed with low confidence. You may want to select manually.');
        }
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      toast.error('Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setDetectionResult(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <MapPin className="w-6 h-6" />
          <span className="text-sm font-medium uppercase tracking-wide">Step 1</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Where do you want to go?
        </h2>
        <p className="text-muted-foreground text-lg">
          Upload a photo or enter your dream destination
        </p>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Camera className="w-4 h-4" />
          <span className="text-sm font-medium">Smart Trip Planning (Optional)</span>
        </div>

        {!uploadedImage ? (
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">JPG, PNG (MAX. 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-border">
            <img
              src={uploadedImage}
              alt="Uploaded destination"
              className="w-full h-48 object-cover"
            />
            
            {isAnalyzing && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm font-medium text-foreground">Analyzing image...</p>
                </div>
              </div>
            )}

            {!isAnalyzing && detectionResult && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div>
                    {detectionResult.detected ? (
                      <>
                        <p className="text-white font-semibold">
                          {detectionResult.region?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </p>
                        <p className="text-white/80 text-sm">
                          {Math.round(detectionResult.confidence * 100)}% confidence
                          {detectionResult.landmark_name && ` • ${detectionResult.landmark_name}`}
                        </p>
                      </>
                    ) : (
                      <p className="text-white/80 text-sm">Could not detect region</p>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={clearImage}
                    className="gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {!isAnalyzing && !detectionResult && (
              <Button
                variant="secondary"
                size="icon"
                onClick={clearImage}
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Detected Suggestions */}
        {detectionResult?.detected && detectionResult.suggestions && (
          <div className="bg-accent/30 rounded-xl p-4 space-y-3 border border-accent/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">AI Suggestions</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {detectionResult.suggestions.destinations.slice(0, 6).map((dest) => (
                <Button
                  key={dest}
                  variant={destination === dest ? "default" : "outline"}
                  size="sm"
                  onClick={() => onDestinationChange(dest)}
                  className="rounded-full"
                >
                  {dest}
                </Button>
              ))}
            </div>

            {detectionResult.suggestions.best_seasons.length > 0 && (
              <p className="text-xs text-muted-foreground">
                🌤️ Best time to visit: {detectionResult.suggestions.best_seasons.join(', ')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-muted-foreground">or search manually</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value)}
          placeholder="e.g. Tokyo, Paris, Bali..."
          className="h-14 pl-12 pr-4 text-lg rounded-2xl bg-card border-2 border-border focus:border-primary transition-colors"
        />
      </div>

      {/* Popular Destinations Carousel */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Popular destinations</span>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {POPULAR_DESTINATIONS.map((dest) => (
              <CarouselItem key={dest.name} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4">
                <button
                  onClick={() => onDestinationChange(dest.name)}
                  className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden group transition-all duration-300 ${
                    destination === dest.name 
                      ? 'ring-3 ring-primary ring-offset-2 ring-offset-background scale-[1.02]' 
                      : 'hover:scale-105'
                  }`}
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-sm md:text-base drop-shadow-lg">
                      {dest.name}
                    </p>
                  </div>
                  {destination === dest.name && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4" />
          <CarouselNext className="hidden sm:flex -right-4" />
        </Carousel>
      </div>
    </div>
  );
};
