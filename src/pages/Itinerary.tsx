import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Calendar, Wallet, Users, Download, Share2, Sparkles, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

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
  const [isExporting, setIsExporting] = useState(false);

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const exportToPDF = async () => {
    if (!tripData) return;
    
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPosition = margin;

      // Colors - Orchid theme with complementary colors
      const primary = { r: 168, g: 85, b: 247 };      // Purple-500
      const primaryDark = { r: 126, g: 34, b: 206 };  // Purple-700
      const primaryLight = { r: 243, g: 232, b: 255 }; // Purple-50
      const accent = { r: 236, g: 72, b: 153 };        // Pink-500
      const teal = { r: 20, g: 184, b: 166 };          // Teal-500
      const tealDark = { r: 15, g: 118, b: 110 };      // Teal-700
      const tealLight = { r: 204, g: 251, b: 241 };    // Teal-50
      const gold = { r: 234, g: 179, b: 8 };           // Amber/Gold
      const goldDark = { r: 161, g: 98, b: 7 };        // Amber-700
      const goldLight = { r: 254, g: 249, b: 195 };    // Amber-50
      const darkGray = { r: 30, g: 30, b: 46 };
      const mediumGray = { r: 100, g: 100, b: 120 };
      const lightGray = { r: 248, g: 245, b: 255 };

      // Helper function to add new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - 30) {
          doc.addPage();
          yPosition = margin + 10;
          // Add subtle header on new pages
          doc.setFillColor(primaryLight.r, primaryLight.g, primaryLight.b);
          doc.rect(0, 0, pageWidth, 15, 'F');
          doc.setDrawColor(primary.r, primary.g, primary.b);
          doc.setLineWidth(0.5);
          doc.line(0, 15, pageWidth, 15);
          return true;
        }
        return false;
      };

      // ==================== COVER PAGE ====================
      
      // Gradient header background
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.rect(0, 0, pageWidth, 80, 'F');
      
      // Decorative diagonal stripe with teal
      doc.setFillColor(teal.r, teal.g, teal.b);
      doc.triangle(pageWidth - 60, 0, pageWidth, 0, pageWidth, 60, 'F');
      
      // Additional accent stripe
      doc.setFillColor(gold.r, gold.g, gold.b);
      doc.triangle(0, 60, 0, 80, 40, 80, 'F');
      
      // Brand name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(36);
      doc.setFont('helvetica', 'bold');
      doc.text('TourGether', pageWidth / 2, 35, { align: 'center' });
      
      // Tagline
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('AI-Powered Travel Planning', pageWidth / 2, 50, { align: 'center' });
      
      // Destination badge
      doc.setFillColor(255, 255, 255);
      const destText = tripData.destination.toUpperCase();
      const destWidth = Math.min(doc.getTextWidth(destText) * 1.5 + 30, contentWidth);
      doc.roundedRect((pageWidth - destWidth) / 2, 58, destWidth, 16, 4, 4, 'F');
      doc.setTextColor(primary.r, primary.g, primary.b);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(destText, pageWidth / 2, 69, { align: 'center' });
      
      yPosition = 100;
      
      // Trip Details Card with teal accent
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(teal.r, teal.g, teal.b);
      doc.setLineWidth(1);
      doc.roundedRect(margin, yPosition, contentWidth, 70, 6, 6, 'FD');
      
      // Card header with teal
      doc.setFillColor(tealLight.r, tealLight.g, tealLight.b);
      doc.roundedRect(margin, yPosition, contentWidth, 20, 6, 6, 'F');
      doc.rect(margin, yPosition + 14, contentWidth, 6, 'F');
      
      doc.setTextColor(tealDark.r, tealDark.g, tealDark.b);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('📅 TRIP DETAILS', margin + 10, yPosition + 13);
      
      // Grid layout for details
      const detailsY = yPosition + 32;
      const colWidth = contentWidth / 2;
      
      const details = [
        { icon: '📅', label: 'DATES', value: `${formatDate(tripData.startDate)} - ${formatDate(tripData.endDate)}` },
        { icon: '⏱️', label: 'DURATION', value: `${tripData.daysCount} days` },
        { icon: '💰', label: 'BUDGET', value: `${tripData.currency} ${tripData.budgetMin.toLocaleString()} - ${tripData.budgetMax.toLocaleString()}` },
        { icon: '👥', label: 'TRAVELERS', value: `${tripData.travelers} ${tripData.travelers === 1 ? 'person' : 'people'}` },
      ];
      
      details.forEach((detail, i) => {
        const x = margin + 15 + (i % 2) * colWidth;
        const y = detailsY + Math.floor(i / 2) * 18;
        
        doc.setTextColor(mediumGray.r, mediumGray.g, mediumGray.b);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`${detail.icon} ${detail.label}`, x, y);
        
        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(detail.value, x, y + 8);
      });
      
      yPosition += 85;
      
      // Preferences Card with gold accent
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(gold.r, gold.g, gold.b);
      doc.roundedRect(margin, yPosition, contentWidth, 45, 6, 6, 'FD');
      
      doc.setFillColor(goldLight.r, goldLight.g, goldLight.b);
      doc.roundedRect(margin, yPosition, contentWidth, 20, 6, 6, 'F');
      doc.rect(margin, yPosition + 14, contentWidth, 6, 'F');
      
      doc.setTextColor(goldDark.r, goldDark.g, goldDark.b);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('🎯 PREFERENCES', margin + 10, yPosition + 13);
      
      const prefsY = yPosition + 32;
      const prefColWidth = contentWidth / 3;
      
      const prefs = [
        { icon: '🎯', label: 'TYPE', value: tripData.tripType.replace('_', ' ').toUpperCase() },
        { icon: '🚶', label: 'PACE', value: tripData.pace.toUpperCase() },
        { icon: '🍽️', label: 'DINING', value: tripData.diningStyle.toUpperCase() },
      ];
      
      prefs.forEach((pref, i) => {
        const x = margin + 15 + i * prefColWidth;
        
        doc.setTextColor(mediumGray.r, mediumGray.g, mediumGray.b);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`${pref.icon} ${pref.label}`, x, prefsY);
        
        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        const truncatedValue = pref.value.length > 15 ? pref.value.substring(0, 15) + '...' : pref.value;
        doc.text(truncatedValue, x, prefsY + 8);
      });
      
      yPosition += 60;
      
      // Disclaimer
      doc.setTextColor(mediumGray.r, mediumGray.g, mediumGray.b);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      const disclaimer = 'This itinerary was AI-generated based on your preferences. Please verify opening hours, prices, and availability before your trip.';
      const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth - 20);
      doc.text(disclaimerLines, pageWidth / 2, yPosition, { align: 'center' });
      
      // ==================== ITINERARY PAGES ====================
      doc.addPage();
      yPosition = margin;
      
      // Section Header with gradient effect
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.roundedRect(margin, yPosition, contentWidth, 18, 4, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('📋 YOUR ITINERARY', margin + 10, yPosition + 12);
      
      yPosition += 30;
      
      // Parse and render markdown content
      const lines = itinerary.split('\n');
      let listItemIndex = 0;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          yPosition += 4;
          continue;
        }
        
        // Day headers (## Day X) - alternating colors
        if (trimmedLine.startsWith('## ')) {
          checkPageBreak(35);
          yPosition += 10;
          
          const dayMatch = trimmedLine.match(/Day (\d+)/);
          const dayNum = dayMatch ? dayMatch[1] : '•';
          const dayNumber = dayMatch ? parseInt(dayMatch[1]) : 1;
          const dayTitle = trimmedLine.replace('## ', '');
          const isEven = dayNumber % 2 === 0;
          
          // Alternating day badge colors (pink/purple vs teal)
          const badgeColor = isEven ? teal : primary;
          const badgeDark = isEven ? tealDark : primaryDark;
          
          doc.setFillColor(badgeColor.r, badgeColor.g, badgeColor.b);
          doc.roundedRect(margin, yPosition - 5, contentWidth, 22, 4, 4, 'F');
          
          // Day number circle
          doc.setFillColor(255, 255, 255);
          doc.circle(margin + 15, yPosition + 6, 10, 'F');
          doc.setTextColor(badgeDark.r, badgeDark.g, badgeDark.b);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(dayNum, margin + 15, yPosition + 10, { align: 'center' });
          
          // Day title
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(13);
          doc.text(dayTitle, margin + 32, yPosition + 10);
          
          yPosition += 28;
        }
        // Time of day headers (### Morning, etc) - color-coded by time
        else if (trimmedLine.startsWith('### ')) {
          checkPageBreak(20);
          yPosition += 8;
          
          const timeText = trimmedLine.replace('### ', '');
          const isMorning = timeText.toLowerCase().includes('morning');
          const isAfternoon = timeText.toLowerCase().includes('afternoon');
          const isEvening = timeText.toLowerCase().includes('evening') || timeText.toLowerCase().includes('night');
          
          const icon = isMorning ? '🌅' :
                      isAfternoon ? '☀️' :
                      isEvening ? '🌆' : '📍';
          
          // Time-based colors
          let bgColor, borderColor, textColor;
          if (isMorning) {
            bgColor = goldLight;
            borderColor = gold;
            textColor = goldDark;
          } else if (isAfternoon) {
            bgColor = tealLight;
            borderColor = teal;
            textColor = tealDark;
          } else {
            bgColor = primaryLight;
            borderColor = primary;
            textColor = primaryDark;
          }
          
          // Pill-shaped time badge with dynamic colors
          doc.setFillColor(bgColor.r, bgColor.g, bgColor.b);
          doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
          doc.setLineWidth(0.8);
          const pillWidth = doc.getTextWidth(timeText) + 30;
          doc.roundedRect(margin + 20, yPosition - 5, pillWidth, 14, 5, 5, 'FD');
          
          // Small colored dot
          doc.setFillColor(borderColor.r, borderColor.g, borderColor.b);
          doc.circle(margin + 28, yPosition + 2, 2, 'F');
          
          doc.setTextColor(textColor.r, textColor.g, textColor.b);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`${icon} ${timeText}`, margin + 34, yPosition + 4);
          
          yPosition += 18;
        }
        // Bold text (activity titles)
        else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          checkPageBreak(16);
          doc.setTextColor(accent.r, accent.g, accent.b);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const cleanText = trimmedLine.replace(/\*\*/g, '');
          const splitText = doc.splitTextToSize(`📍 ${cleanText}`, contentWidth - 35);
          doc.text(splitText, margin + 25, yPosition);
          yPosition += splitText.length * 6 + 5;
        }
        // List items - cycling colors
        else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          checkPageBreak(18);
          
          // Cycling colors for list items
          const colors = [primary, teal, gold];
          const bulletColor = colors[listItemIndex % 3];
          listItemIndex++;
          
          // Colored left border line
          doc.setDrawColor(bulletColor.r, bulletColor.g, bulletColor.b);
          doc.setLineWidth(2);
          doc.line(margin + 24, yPosition - 4, margin + 24, yPosition + 8);
          
          // Colored bullet
          doc.setFillColor(bulletColor.r, bulletColor.g, bulletColor.b);
          doc.circle(margin + 32, yPosition - 1, 2, 'F');
          
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const cleanText = trimmedLine.replace(/^[-*]\s*/, '').replace(/\*\*/g, '').replace(/\*/g, '');
          const splitText = doc.splitTextToSize(cleanText, contentWidth - 55);
          doc.text(splitText, margin + 40, yPosition);
          yPosition += splitText.length * 6 + 6;
        }
        // Regular paragraphs
        else if (!trimmedLine.startsWith('#')) {
          checkPageBreak(16);
          doc.setTextColor(mediumGray.r, mediumGray.g, mediumGray.b);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const cleanText = trimmedLine.replace(/\*\*/g, '').replace(/\*/g, '');
          const splitText = doc.splitTextToSize(cleanText, contentWidth - 35);
          doc.text(splitText, margin + 25, yPosition);
          yPosition += splitText.length * 6 + 4;
        }
      }
      
      // ==================== BUDGET BREAKDOWN ====================
      checkPageBreak(80);
      yPosition += 15;
      
      // Budget section header
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.roundedRect(margin, yPosition, contentWidth, 18, 4, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('💰 BUDGET BREAKDOWN', margin + 10, yPosition + 12);
      
      yPosition += 28;
      
      // Budget table
      const budgetData = [
        { category: '🎭 Activities & Attractions', allocation: '40%', notes: 'Entry fees, tours, experiences' },
        { category: '🍽️ Dining & Food', allocation: '35%', notes: 'Meals, snacks, beverages' },
        { category: '🚗 Transport & Misc', allocation: '25%', notes: 'Local transport, tips, souvenirs' },
      ];
      
      // Table header
      doc.setFillColor(primaryDark.r, primaryDark.g, primaryDark.b);
      doc.rect(margin, yPosition, contentWidth, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Category', margin + 5, yPosition + 8);
      doc.text('Allocation', margin + 85, yPosition + 8);
      doc.text('Notes', margin + 115, yPosition + 8);
      
      yPosition += 12;
      
      // Table rows
      budgetData.forEach((row, i) => {
        const rowY = yPosition + i * 14;
        doc.setFillColor(i % 2 === 0 ? 255 : lightGray.r, i % 2 === 0 ? 255 : lightGray.g, i % 2 === 0 ? 255 : lightGray.b);
        doc.rect(margin, rowY, contentWidth, 14, 'F');
        
        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(row.category, margin + 5, rowY + 9);
        doc.setFont('helvetica', 'bold');
        doc.text(row.allocation, margin + 85, rowY + 9);
        doc.setFont('helvetica', 'normal');
        doc.text(row.notes, margin + 115, rowY + 9);
      });
      
      yPosition += 42;
      
      // Total row
      doc.setFillColor(primaryLight.r, primaryLight.g, primaryLight.b);
      doc.rect(margin, yPosition, contentWidth, 14, 'F');
      doc.setDrawColor(primary.r, primary.g, primary.b);
      doc.setLineWidth(1);
      doc.rect(margin, yPosition, contentWidth, 14, 'S');
      
      doc.setTextColor(primaryDark.r, primaryDark.g, primaryDark.b);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('💰 Total Budget Range', margin + 5, yPosition + 9);
      doc.text(`${tripData.currency} ${tripData.budgetMin.toLocaleString()} - ${tripData.budgetMax.toLocaleString()}`, margin + 85, yPosition + 9);
      
      // ==================== TRAVEL TIPS ====================
      yPosition += 30;
      checkPageBreak(60);
      
      doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
      doc.roundedRect(margin, yPosition, contentWidth, 55, 6, 6, 'F');
      doc.setDrawColor(primary.r, primary.g, primary.b);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, yPosition, contentWidth, 55, 6, 6, 'S');
      
      doc.setTextColor(primaryDark.r, primaryDark.g, primaryDark.b);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('💡 Travel Tips', margin + 10, yPosition + 12);
      
      const tips = [
        '• Book accommodations and major attractions in advance',
        '• Keep digital and physical copies of important documents',
        '• Check visa requirements and travel advisories',
        '• Consider travel insurance for peace of mind',
        '• Download offline maps and translation apps',
      ];
      
      doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      tips.forEach((tip, i) => {
        doc.text(tip, margin + 10, yPosition + 24 + i * 7);
      });
      
      // ==================== FOOTER ON ALL PAGES ====================
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Footer bar
        doc.setFillColor(primaryLight.r, primaryLight.g, primaryLight.b);
        doc.rect(0, pageHeight - 18, pageWidth, 18, 'F');
        doc.setDrawColor(primary.r, primary.g, primary.b);
        doc.setLineWidth(0.5);
        doc.line(0, pageHeight - 18, pageWidth, pageHeight - 18);
        
        doc.setTextColor(primaryDark.r, primaryDark.g, primaryDark.b);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated by TourGether • ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, margin, pageHeight - 7);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
      }
      
      // Save the PDF
      const fileName = `TourGether-${tripData.destination.replace(/[^a-zA-Z0-9]/g, '-')}-Itinerary.pdf`;
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

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
            <Button onClick={exportToPDF} disabled={isExporting} className="gap-2">
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">Download PDF</span>
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
          <Card className="overflow-hidden shadow-xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
            <CardContent className="p-6 md:p-10">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => {
                    const dayNum = String(children).match(/Day (\d+)/)?.[1];
                    const isEven = dayNum ? parseInt(dayNum) % 2 === 0 : false;
                    return (
                      <div className="mt-10 first:mt-0 mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0 shadow-xl ring-4 ${
                            isEven 
                              ? 'bg-gradient-to-br from-[hsl(175,80%,40%)] via-[hsl(180,70%,45%)] to-[hsl(185,75%,50%)] shadow-[hsl(175,80%,40%)]/30 ring-[hsl(175,80%,40%)]/20' 
                              : 'bg-gradient-to-br from-primary via-primary to-accent shadow-primary/30 ring-primary/20'
                          }`}>
                            {dayNum || '📍'}
                          </div>
                          <div className="flex-1">
                            <h2 className={`text-xl md:text-2xl font-bold bg-clip-text text-transparent ${
                              isEven 
                                ? 'bg-gradient-to-r from-[hsl(175,80%,40%)] via-[hsl(180,70%,35%)] to-[hsl(175,80%,40%)]' 
                                : 'bg-gradient-to-r from-primary via-accent-foreground to-primary'
                            }`}>{children}</h2>
                            <div className={`h-1.5 w-24 rounded-full mt-2 ${
                              isEven 
                                ? 'bg-gradient-to-r from-[hsl(175,80%,40%)] via-[hsl(180,70%,50%)] to-[hsl(175,80%,40%)]/40' 
                                : 'bg-gradient-to-r from-primary via-accent to-primary/40'
                            }`}></div>
                          </div>
                        </div>
                      </div>
                    );
                  },
                  h3: ({ children }) => {
                    const timeText = String(children).toLowerCase();
                    const isMorning = timeText.includes('morning');
                    const isAfternoon = timeText.includes('afternoon');
                    const isEvening = timeText.includes('evening') || timeText.includes('night');
                    
                    const getTimeStyles = () => {
                      if (isMorning) return 'from-[hsl(45,90%,55%)]/25 via-[hsl(35,85%,50%)]/20 to-[hsl(45,90%,55%)]/15 border-[hsl(45,90%,55%)]/40 text-[hsl(35,85%,40%)]';
                      if (isAfternoon) return 'from-[hsl(175,80%,40%)]/20 via-[hsl(180,70%,45%)]/15 to-[hsl(175,80%,40%)]/10 border-[hsl(175,80%,40%)]/30 text-[hsl(175,80%,35%)]';
                      if (isEvening) return 'from-primary/20 via-accent/15 to-primary/10 border-primary/30 text-primary';
                      return 'from-primary/20 via-accent/15 to-primary/10 border-primary/30 text-primary';
                    };
                    
                    const getDotColor = () => {
                      if (isMorning) return 'from-[hsl(45,90%,55%)] to-[hsl(35,85%,50%)]';
                      if (isAfternoon) return 'from-[hsl(175,80%,40%)] to-[hsl(180,70%,45%)]';
                      return 'from-primary to-accent';
                    };
                    
                    return (
                      <div className="mt-6 mb-4 ml-4 md:ml-18">
                        <div className={`inline-flex items-center gap-3 bg-gradient-to-r ${getTimeStyles()} px-5 py-2.5 rounded-full border shadow-md shadow-primary/10`}>
                          <span className={`w-3 h-3 rounded-full bg-gradient-to-br ${getDotColor()} animate-pulse`}></span>
                          <span className="text-sm font-bold tracking-wide">{children}</span>
                        </div>
                      </div>
                    );
                  },
                  p: ({ children }) => (
                    <p className="text-foreground/85 leading-relaxed mb-4 ml-4 md:ml-18 text-sm md:text-base">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-3 mb-6 ml-4 md:ml-18 list-none">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="space-y-3 mb-6 ml-4 md:ml-18 list-none">{children}</ol>
                  ),
                  li: ({ children }) => {
                    const colors = [
                      { bg: 'from-primary/10 via-accent/5', border: 'border-primary hover:border-accent', bullet: 'text-primary group-hover:text-accent' },
                      { bg: 'from-[hsl(175,80%,40%)]/10 via-[hsl(180,70%,45%)]/5', border: 'border-[hsl(175,80%,40%)] hover:border-[hsl(180,70%,45%)]', bullet: 'text-[hsl(175,80%,40%)] group-hover:text-[hsl(180,70%,45%)]' },
                      { bg: 'from-[hsl(45,90%,55%)]/10 via-[hsl(35,85%,50%)]/5', border: 'border-[hsl(45,90%,55%)] hover:border-[hsl(35,85%,50%)]', bullet: 'text-[hsl(45,90%,50%)] group-hover:text-[hsl(35,85%,45%)]' },
                    ];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    return (
                      <li className={`flex items-start gap-3 text-foreground/85 text-sm md:text-base bg-gradient-to-r ${randomColor.bg} to-transparent p-4 rounded-xl border-l-4 ${randomColor.border} hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group`}>
                        <span className={`text-lg ${randomColor.bullet} transition-colors`}>▸</span>
                        <span className="flex-1">{children}</span>
                      </li>
                    );
                  },
                  strong: ({ children }) => (
                    <strong className="font-bold bg-gradient-to-r from-primary via-[hsl(175,80%,40%)] to-accent-foreground bg-clip-text text-transparent">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <span className="text-[hsl(175,80%,35%)] font-medium italic">{children}</span>
                  ),
                  hr: () => (
                    <hr className="my-8 border-gradient-to-r from-primary/30 via-[hsl(175,80%,40%)]/30 to-primary/30 ml-4 md:ml-18" />
                  ),
                }}
              >
                {itinerary}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Budget Breakdown */}
      <section className="py-12 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-2 rounded-full mb-4">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Estimated Budget</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent-foreground to-primary bg-clip-text text-transparent">
              Budget Breakdown
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group">
              <div className="h-2 bg-gradient-to-r from-primary to-primary/60"></div>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎭</span>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Activities & Attractions</p>
                <p className="text-3xl font-bold text-primary mb-2">40%</p>
                <p className="text-sm text-muted-foreground">Entry fees, tours, experiences</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-lg font-semibold text-foreground">
                    {tripData.currency} {Math.round((tripData.budgetMin + tripData.budgetMax) / 2 * 0.4).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Estimated amount</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-2 border-accent-foreground/20 hover:border-accent-foreground/40 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 group">
              <div className="h-2 bg-gradient-to-r from-accent-foreground to-accent-foreground/60"></div>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🍽️</span>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Dining & Food</p>
                <p className="text-3xl font-bold text-accent-foreground mb-2">35%</p>
                <p className="text-sm text-muted-foreground">Meals, snacks, beverages</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-lg font-semibold text-foreground">
                    {tripData.currency} {Math.round((tripData.budgetMin + tripData.budgetMax) / 2 * 0.35).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Estimated amount</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-2 border-secondary/40 hover:border-secondary/60 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/10 group">
              <div className="h-2 bg-gradient-to-r from-secondary to-secondary/60"></div>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🚗</span>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Transport & Misc</p>
                <p className="text-3xl font-bold text-secondary-foreground mb-2">25%</p>
                <p className="text-sm text-muted-foreground">Local transport, tips, souvenirs</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-lg font-semibold text-foreground">
                    {tripData.currency} {Math.round((tripData.budgetMin + tripData.budgetMax) / 2 * 0.25).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Estimated amount</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <span className="text-xl">💰</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Budget Range</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                      {tripData.currency} {tripData.budgetMin.toLocaleString()} - {tripData.budgetMax.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 px-4 py-2 rounded-full">
                  <Users className="w-4 h-4" />
                  <span>For {tripData.travelers} {tripData.travelers === 1 ? 'traveler' : 'travelers'}</span>
                </div>
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
