import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Calendar, Wallet, Users, Download, Share2, Sparkles, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

      // Colors - Teal, Amber, Pink palette
      const primary = { r: 20, g: 184, b: 166 };        // Teal-500
      const primaryDark = { r: 15, g: 118, b: 110 };    // Teal-700
      const primaryLight = { r: 204, g: 251, b: 241 };  // Teal-50
      const accent = { r: 236, g: 72, b: 153 };         // Pink-500
      const accentDark = { r: 190, g: 24, b: 93 };      // Pink-700
      const accentLight = { r: 252, g: 231, b: 243 };   // Pink-50
      const gold = { r: 234, g: 179, b: 8 };            // Amber-500
      const goldDark = { r: 161, g: 98, b: 7 };         // Amber-700
      const goldLight = { r: 254, g: 249, b: 195 };     // Amber-50
      const darkGray = { r: 30, g: 30, b: 46 };
      const mediumGray = { r: 100, g: 100, b: 120 };
      const lightGray = { r: 248, g: 250, b: 252 };

      // Helper to strip emojis from text (jsPDF doesn't support them)
      const stripEmojis = (text: string) => {
        return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu, '').trim();
      };

      // Helper function to add new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - 30) {
          doc.addPage();
          yPosition = margin + 5;
          return true;
        }
        return false;
      };

      // ==================== COVER PAGE ====================
      
      // Full page teal header
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.rect(0, 0, pageWidth, 100, 'F');
      
      // Decorative pink accent corner
      doc.setFillColor(accent.r, accent.g, accent.b);
      doc.triangle(pageWidth - 50, 0, pageWidth, 0, pageWidth, 50, 'F');
      
      // Decorative amber accent
      doc.setFillColor(gold.r, gold.g, gold.b);
      doc.circle(0, 100, 30, 'F');
      
      // Brand name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.text('TourGether', pageWidth / 2, 40, { align: 'center' });
      
      // Destination - Large centered
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text(tripData.destination.toUpperCase(), pageWidth / 2, 65, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`${tripData.daysCount}-Day Travel Itinerary`, pageWidth / 2, 85, { align: 'center' });
      
      yPosition = 120;
      
      // Trip Details Table
      doc.setFillColor(primaryLight.r, primaryLight.g, primaryLight.b);
      doc.roundedRect(margin, yPosition, contentWidth, 15, 3, 3, 'F');
      doc.setTextColor(primaryDark.r, primaryDark.g, primaryDark.b);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Trip Details', margin + 5, yPosition + 10);
      
      yPosition += 18;
      
      const tripDetails = [
        { label: 'Duration', value: `${tripData.daysCount} days` },
        { label: 'Dates', value: `${formatDate(tripData.startDate)} - ${formatDate(tripData.endDate)}` },
        { label: 'Budget', value: `${tripData.currency} ${tripData.budgetMin.toLocaleString()} - ${tripData.budgetMax.toLocaleString()}` },
        { label: 'Travelers', value: `${tripData.travelers} ${tripData.travelers === 1 ? 'person' : 'people'}` },
        { label: 'Focus', value: tripData.tripType.replace('_', ' ') },
        { label: 'Pace', value: tripData.pace },
        { label: 'Dining', value: tripData.diningStyle },
        { label: 'Generated', value: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
      ];
      
      tripDetails.forEach((detail, i) => {
        const rowY = yPosition + i * 12;
        doc.setFillColor(i % 2 === 0 ? 255 : lightGray.r, i % 2 === 0 ? 255 : lightGray.g, i % 2 === 0 ? 255 : lightGray.b);
        doc.rect(margin, rowY, contentWidth, 12, 'F');
        
        doc.setTextColor(mediumGray.r, mediumGray.g, mediumGray.b);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(detail.label, margin + 5, rowY + 8);
        
        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFont('helvetica', 'bold');
        doc.text(detail.value, margin + 60, rowY + 8);
      });
      
      yPosition += tripDetails.length * 12 + 15;
      
      // Disclaimer
      doc.setFillColor(goldLight.r, goldLight.g, goldLight.b);
      doc.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');
      doc.setTextColor(goldDark.r, goldDark.g, goldDark.b);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      const disclaimer = 'This itinerary was AI-generated based on your preferences. Please verify opening hours, prices, and availability before your trip.';
      const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth - 10);
      doc.text(disclaimerLines, margin + 5, yPosition + 10);
      
      // ==================== ITINERARY PAGES ====================
      doc.addPage();
      yPosition = margin;
      
      // Page header
      doc.setFillColor(primaryLight.r, primaryLight.g, primaryLight.b);
      doc.roundedRect(margin, yPosition, contentWidth, 12, 3, 3, 'F');
      doc.setTextColor(primaryDark.r, primaryDark.g, primaryDark.b);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Your Itinerary', margin + 5, yPosition + 8);
      
      yPosition += 20;
      
      // Parse and render markdown content
      const lines = itinerary.split('\n');
      let currentDayColor = primary;
      let inTable = false;
      let tableHeaders: string[] = [];
      let tableRows: string[][] = [];
      
      const renderTable = () => {
        if (tableHeaders.length === 0 && tableRows.length === 0) return;
        
        checkPageBreak(20 + tableRows.length * 12);
        
        const colCount = tableHeaders.length || (tableRows[0]?.length || 2);
        const colWidth = (contentWidth - 10) / colCount;
        
        // Table header
        if (tableHeaders.length > 0) {
          doc.setFillColor(primaryDark.r, primaryDark.g, primaryDark.b);
          doc.rect(margin + 5, yPosition, contentWidth - 10, 10, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          
          tableHeaders.forEach((header, i) => {
            const cleanHeader = stripEmojis(header);
            const truncated = cleanHeader.length > 25 ? cleanHeader.substring(0, 22) + '...' : cleanHeader;
            doc.text(truncated, margin + 8 + i * colWidth, yPosition + 7);
          });
          yPosition += 10;
        }
        
        // Table rows
        tableRows.forEach((row, rowIndex) => {
          checkPageBreak(12);
          doc.setFillColor(rowIndex % 2 === 0 ? 255 : lightGray.r, rowIndex % 2 === 0 ? 255 : lightGray.g, rowIndex % 2 === 0 ? 255 : lightGray.b);
          doc.rect(margin + 5, yPosition, contentWidth - 10, 10, 'F');
          
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          
          row.forEach((cell, i) => {
            const cleanCell = stripEmojis(cell);
            const truncated = cleanCell.length > 30 ? cleanCell.substring(0, 27) + '...' : cleanCell;
            doc.text(truncated, margin + 8 + i * colWidth, yPosition + 7);
          });
          yPosition += 10;
        });
        
        yPosition += 5;
        tableHeaders = [];
        tableRows = [];
        inTable = false;
      };
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        if (!trimmedLine) {
          if (inTable) renderTable();
          yPosition += 3;
          continue;
        }
        
        // Detect markdown table
        if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
          const cells = trimmedLine.split('|').filter(c => c.trim()).map(c => c.trim());
          
          // Check if this is a separator row (|---|---|)
          if (cells.every(c => /^[-:]+$/.test(c))) {
            continue; // Skip separator
          }
          
          if (!inTable) {
            inTable = true;
            tableHeaders = cells;
          } else {
            tableRows.push(cells);
          }
          continue;
        } else if (inTable) {
          renderTable();
        }
        
        // Day headers (## Day X)
        if (trimmedLine.startsWith('## ')) {
          checkPageBreak(25);
          yPosition += 8;
          
          const dayMatch = trimmedLine.match(/Day (\d+)/);
          const dayNumber = dayMatch ? parseInt(dayMatch[1]) : 1;
          const dayTitle = stripEmojis(trimmedLine.replace('## ', ''));
          
          // Cycle colors: teal, pink, amber
          const colors = [primary, accent, gold];
          currentDayColor = colors[(dayNumber - 1) % 3];
          
          // Day header bar
          doc.setFillColor(currentDayColor.r, currentDayColor.g, currentDayColor.b);
          doc.roundedRect(margin, yPosition, contentWidth, 16, 3, 3, 'F');
          
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(dayTitle, margin + 8, yPosition + 11);
          
          yPosition += 22;
        }
        // Section headers (### like "Estimated Total Costs", "Travel Tips")
        else if (trimmedLine.startsWith('### ')) {
          checkPageBreak(18);
          yPosition += 8;
          
          const sectionTitle = stripEmojis(trimmedLine.replace('### ', '').replace(/\*/g, ''));
          
          // Section header with accent color
          doc.setFillColor(accentLight.r, accentLight.g, accentLight.b);
          doc.roundedRect(margin, yPosition, contentWidth, 14, 3, 3, 'F');
          
          doc.setTextColor(accentDark.r, accentDark.g, accentDark.b);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(sectionTitle, margin + 8, yPosition + 10);
          
          yPosition += 20;
        }
        // Bold text with time (e.g., **8:00 AM - Activity**)
        else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          checkPageBreak(14);
          doc.setTextColor(currentDayColor.r, currentDayColor.g, currentDayColor.b);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const cleanText = stripEmojis(trimmedLine.replace(/\*\*/g, ''));
          const splitText = doc.splitTextToSize(cleanText, contentWidth - 15);
          doc.text(splitText, margin + 10, yPosition);
          yPosition += splitText.length * 5 + 4;
        }
        // Numbered list items (1. 2. 3. etc)
        else if (/^\d+\.\s/.test(trimmedLine)) {
          checkPageBreak(14);
          
          doc.setFillColor(currentDayColor.r, currentDayColor.g, currentDayColor.b);
          doc.circle(margin + 14, yPosition - 1, 1.5, 'F');
          
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const cleanText = stripEmojis(trimmedLine.replace(/\*\*/g, '').replace(/\*/g, ''));
          const splitText = doc.splitTextToSize(cleanText, contentWidth - 25);
          doc.text(splitText, margin + 20, yPosition);
          yPosition += splitText.length * 5 + 4;
        }
        // List items
        else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          checkPageBreak(14);
          
          // Colored bullet
          doc.setFillColor(currentDayColor.r, currentDayColor.g, currentDayColor.b);
          doc.circle(margin + 14, yPosition - 1, 1.5, 'F');
          
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const cleanText = stripEmojis(trimmedLine.replace(/^[-*]\s*/, '').replace(/\*\*/g, '').replace(/\*/g, ''));
          const splitText = doc.splitTextToSize(cleanText, contentWidth - 25);
          doc.text(splitText, margin + 20, yPosition);
          yPosition += splitText.length * 5 + 4;
        }
        // Regular paragraphs
        else if (!trimmedLine.startsWith('#')) {
          checkPageBreak(14);
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const cleanText = stripEmojis(trimmedLine.replace(/\*\*/g, '').replace(/\*/g, ''));
          const splitText = doc.splitTextToSize(cleanText, contentWidth - 20);
          doc.text(splitText, margin + 10, yPosition);
          yPosition += splitText.length * 5 + 3;
        }
      }
      
      // Render any remaining table
      if (inTable) renderTable();
      
      // ==================== BUDGET BREAKDOWN ====================
      checkPageBreak(90);
      yPosition += 12;
      
      // Budget section header
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.roundedRect(margin, yPosition, contentWidth, 14, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Budget Breakdown', margin + 5, yPosition + 10);
      
      yPosition += 20;
      
      // Budget table
      const budgetData = [
        { category: 'Activities & Attractions', allocation: '40%', notes: 'Entry fees, tours, experiences' },
        { category: 'Dining & Food', allocation: '35%', notes: 'Meals, snacks, beverages' },
        { category: 'Transport & Misc', allocation: '25%', notes: 'Local transport, tips, souvenirs' },
      ];
      
      // Table header
      doc.setFillColor(primaryDark.r, primaryDark.g, primaryDark.b);
      doc.rect(margin, yPosition, contentWidth, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Expense Category', margin + 5, yPosition + 7);
      doc.text('Allocation', margin + 85, yPosition + 7);
      doc.text('Notes', margin + 115, yPosition + 7);
      
      yPosition += 10;
      
      // Table rows
      budgetData.forEach((row, i) => {
        const rowY = yPosition + i * 10;
        doc.setFillColor(i % 2 === 0 ? 255 : lightGray.r, i % 2 === 0 ? 255 : lightGray.g, i % 2 === 0 ? 255 : lightGray.b);
        doc.rect(margin, rowY, contentWidth, 10, 'F');
        
        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(row.category, margin + 5, rowY + 7);
        doc.setFont('helvetica', 'bold');
        doc.text(row.allocation, margin + 85, rowY + 7);
        doc.setFont('helvetica', 'normal');
        doc.text(row.notes, margin + 115, rowY + 7);
      });
      
      yPosition += 35;
      
      // Total row
      doc.setFillColor(goldLight.r, goldLight.g, goldLight.b);
      doc.rect(margin, yPosition, contentWidth, 12, 'F');
      doc.setTextColor(goldDark.r, goldDark.g, goldDark.b);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Budget Range: ${tripData.currency} ${tripData.budgetMin.toLocaleString()} - ${tripData.budgetMax.toLocaleString()} (Flexible based on choices)`, margin + 5, yPosition + 8);
      
      // ==================== TRAVEL TIPS ====================
      yPosition += 22;
      checkPageBreak(50);
      
      doc.setFillColor(accentLight.r, accentLight.g, accentLight.b);
      doc.roundedRect(margin, yPosition, contentWidth, 14, 3, 3, 'F');
      doc.setTextColor(accentDark.r, accentDark.g, accentDark.b);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Travel Tips:', margin + 5, yPosition + 10);
      
      yPosition += 18;
      
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
        doc.text(tip, margin + 5, yPosition + i * 7);
      });
      
      // ==================== FOOTER ON ALL PAGES ====================
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Simple footer line
        doc.setDrawColor(primary.r, primary.g, primary.b);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        doc.setTextColor(mediumGray.r, mediumGray.g, mediumGray.b);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated by TourGether`, margin, pageHeight - 8);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
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
                    return (
                      <div className="mt-10 first:mt-0 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0 shadow-xl shadow-primary/30 ring-4 ring-primary/20">
                            {dayNum || '📍'}
                          </div>
                          <div className="flex-1">
                            <h2 className="text-xl md:text-2xl font-bold text-primary">{children}</h2>
                            <div className="h-1.5 w-24 bg-primary/40 rounded-full mt-2"></div>
                          </div>
                        </div>
                      </div>
                    );
                  },
                  h3: ({ children }) => (
                    <div className="mt-6 mb-4 ml-4 md:ml-18">
                      <div className="inline-flex items-center gap-3 bg-accent px-5 py-2.5 rounded-full border border-primary/20 shadow-md">
                        <span className="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-sm font-bold text-primary tracking-wide">{children}</span>
                      </div>
                    </div>
                  ),
                  p: ({ children }) => (
                    <p className="text-foreground/85 leading-relaxed mb-4 ml-4 md:ml-18 text-sm md:text-base">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-3 mb-6 ml-4 md:ml-18 list-none">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="space-y-3 mb-6 ml-4 md:ml-18 list-none">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-3 text-foreground/85 text-sm md:text-base bg-accent/50 p-4 rounded-xl border-l-4 border-primary hover:border-accent-foreground hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
                      <span className="text-primary text-lg group-hover:text-accent-foreground transition-colors">▸</span>
                      <span className="flex-1">{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-primary">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <span className="text-accent-foreground font-medium italic">{children}</span>
                  ),
                  hr: () => (
                    <hr className="my-8 border-primary/30 ml-4 md:ml-18" />
                  ),
                  table: ({ children }) => (
                    <div className="my-6 ml-4 md:ml-18 overflow-x-auto">
                      <table className="w-full border-collapse rounded-xl overflow-hidden shadow-lg border-2 border-primary/20">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-primary text-primary-foreground">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="bg-card">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-3 text-left font-semibold text-sm">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 text-sm text-foreground">
                      {children}
                    </td>
                  ),
                }}
                remarkPlugins={[remarkGfm]}
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
            <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full mb-4">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Estimated Budget</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary">
              Budget Breakdown
            </h2>
          </div>
          
          <Card className="overflow-hidden border-2 border-primary/20 shadow-xl">
            <div className="h-2 bg-primary"></div>
            <CardContent className="p-0">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="px-6 py-4 text-left font-semibold">Category</th>
                      <th className="px-6 py-4 text-center font-semibold">Allocation</th>
                      <th className="px-6 py-4 text-right font-semibold">Estimated Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🎭</span>
                          <div>
                            <p className="font-medium text-foreground">Activities & Attractions</p>
                            <p className="text-xs text-muted-foreground">Entry fees, tours, experiences</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-14 h-8 bg-primary/10 text-primary font-bold rounded-full">40%</span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-foreground">
                        {tripData.currency} {Math.round((tripData.budgetMin + tripData.budgetMax) / 2 * 0.4).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-border hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🍽️</span>
                          <div>
                            <p className="font-medium text-foreground">Dining & Food</p>
                            <p className="text-xs text-muted-foreground">Meals, snacks, beverages</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-14 h-8 bg-primary/10 text-primary font-bold rounded-full">35%</span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-foreground">
                        {tripData.currency} {Math.round((tripData.budgetMin + tripData.budgetMax) / 2 * 0.35).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-border hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🚗</span>
                          <div>
                            <p className="font-medium text-foreground">Transport & Misc</p>
                            <p className="text-xs text-muted-foreground">Local transport, tips, souvenirs</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-14 h-8 bg-primary/10 text-primary font-bold rounded-full">25%</span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-foreground">
                        {tripData.currency} {Math.round((tripData.budgetMin + tripData.budgetMax) / 2 * 0.25).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-accent">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">💰</span>
                          <div>
                            <p className="font-bold text-primary">Total Budget Range</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              For {tripData.travelers} {tripData.travelers === 1 ? 'traveler' : 'travelers'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-16 h-8 bg-primary text-primary-foreground font-bold rounded-full">100%</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xl font-bold text-primary">
                          {tripData.currency} {tripData.budgetMin.toLocaleString()} - {tripData.budgetMax.toLocaleString()}
                        </p>
                      </td>
                    </tr>
                  </tfoot>
                </table>
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
