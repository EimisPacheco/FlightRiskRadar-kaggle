import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plane, 
  Clock,
  Wind,
  Building,
  Users,
  AlertTriangle,
  ChevronDown,
  Loader2,
  XCircle,
  Info,
  Star,
  Map,
  MessageCircle,
  Activity,
  Send,
  TrendingUp
} from 'lucide-react';
import TranslatedText from '../components/TranslatedText';
import { useTranslation } from '../context/TranslationContext';
import { useDarkMode } from '../context/DarkModeContext';
import { flightRiskAPI, AirportAnalysisResponse } from '../services/api';
import AirportLocationViewer from '../components/features/AirportLocationViewer';
import AirportStatusFeed from '../components/features/AirportStatusFeed';
import AirportCurrentStatus from '../components/features/AirportCurrentStatus';
import USAirportsPerformanceMap3D from '../components/features/USAirportsPerformanceMap3D';
import { SentimentAnalysis, generateAirportSentimentData } from '../components/features/SentimentAnalysis';

interface Airport {
  code: string;
  name: string;
  city: string;
  type?: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  homeLink?: string;
  wikipediaLink?: string;
  complexityScore: number;
  dailyFlights: number;
  terminals: number;
  runways: number;
  onTimeRate: number;
  avgDelay: number;
  cancellationRate: number;
  securityWaitTime: number;
  connectionEfficiency: number;
  weatherImpact: string;
  peakHours: string[];
  constructionStatus: string;
  dominantAirlines: string[];
  delayProbability?: number;
  performanceCategory?: string;
  complexityCategory?: string;
  marketShare?: number;
  efficiencyScore?: number;
  riskFactors?: string[];
  riskLevel?: string;
  rating?: number;
  sentiment?: string;
}

export const AirportAnalyticsPage: React.FC = () => {
  const { currentLanguage } = useTranslation();
  const { isDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAirport, setSelectedAirport] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('complexity');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [realData, setRealData] = useState<AirportAnalysisResponse | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState<boolean>(false);
  const [selectedAirportForMap, setSelectedAirportForMap] = useState<Airport | null>(null);
  const [statusFeedOpen, setStatusFeedOpen] = useState<boolean>(false);
  const [selectedAirportForStatus, setSelectedAirportForStatus] = useState<Airport | null>(null);
  const [currentStatusOpen, setCurrentStatusOpen] = useState<boolean>(false);
  const [selectedAirportForCurrentStatus, setSelectedAirportForCurrentStatus] = useState<Airport | null>(null);
  const [userRatings, setUserRatings] = useState<{ [key: string]: number }>({});
  const [userFeedback, setUserFeedback] = useState<{ [key: string]: string }>({});
  const [showFeedbackFor, setShowFeedbackFor] = useState<string>('');
  const [showSentimentAnalysis, setShowSentimentAnalysis] = useState<string>('');

  // Load real data from BigQuery
  useEffect(() => {
    const loadRealData = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await flightRiskAPI.getAirportPerformanceAnalysis();
        setRealData(data);
      } catch (err) {
        setError('Failed to load airport performance data');
        console.error('Error loading airport data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRealData();
  }, []);

  // Use real data or fallback to mock data
  const airports = realData?.airports?.map(airport => ({
    code: airport.code,
    name: airport.name || `${airport.code} Airport`,
    city: airport.city || airport.code,
    type: airport.type,
    latitude: airport.latitude,
    longitude: airport.longitude,
    elevation: airport.elevation,
    homeLink: airport.home_link,
    wikipediaLink: airport.wikipedia_link,
    complexityScore: airport.complexity_score,
    dailyFlights: airport.total_departures,
    terminals: 4,
    runways: 3,
    onTimeRate: airport.on_time_rate,
    avgDelay: airport.avg_delay,
    cancellationRate: airport.cancellation_rate,
    delayProbability: airport.delay_probability,
    performanceCategory: airport.performance_category,
    complexityCategory: airport.complexity_category,
    marketShare: airport.market_share,
    efficiencyScore: airport.efficiency_score,
    riskFactors: airport.risk_factors,
    riskLevel: airport.risk_level,
    rating: 3.8, // Mock rating
    sentiment: 'positive',
    securityWaitTime: 25,
    connectionEfficiency: 65,
    weatherImpact: 'High',
    peakHours: ['6:00-9:00 AM', '4:00-7:00 PM'],
    constructionStatus: 'Ongoing terminal renovations',
    dominantAirlines: ['Delta', 'American', 'JetBlue']
  })) || [
    {
      code: 'JFK',
      name: 'John F. Kennedy International Airport',
      city: 'New York',
      complexityScore: 9.2,
      dailyFlights: 1250,
      terminals: 6,
      runways: 4,
      onTimeRate: 72.5,
      avgDelay: 18.3,
      cancellationRate: 3.2,
      delayProbability: 45,
      performanceCategory: 'Fair',
      complexityCategory: 'Very High',
      marketShare: 12.8,
      efficiencyScore: 58.2,
      riskFactors: ['Low on-time performance', 'High average delays', 'High cancellation rate', 'Very high complexity'],
      riskLevel: 'High',
      securityWaitTime: 25,
      connectionEfficiency: 65,
      weatherImpact: 'High',
      peakHours: ['6:00-9:00 AM', '4:00-7:00 PM'],
      constructionStatus: 'Ongoing terminal renovations',
      dominantAirlines: ['Delta', 'American', 'JetBlue'],
      rating: 3.7,
      sentiment: 'positive'
    },
    {
      code: 'LAX',
      name: 'Los Angeles International Airport',
      city: 'Los Angeles',
      complexityScore: 8.8,
      dailyFlights: 1400,
      terminals: 9,
      runways: 4,
      onTimeRate: 75.2,
      avgDelay: 16.7,
      cancellationRate: 2.8,
      delayProbability: 42,
      performanceCategory: 'Fair',
      complexityCategory: 'Very High',
      marketShare: 14.2,
      efficiencyScore: 62.8,
      riskFactors: ['Low on-time performance', 'High average delays', 'Very high complexity'],
      riskLevel: 'Medium',
      securityWaitTime: 22,
      connectionEfficiency: 70,
      weatherImpact: 'Medium',
      peakHours: ['7:00-10:00 AM', '5:00-8:00 PM'],
      constructionStatus: 'Major expansion project',
      dominantAirlines: ['American', 'United', 'Delta'],
      rating: 3.9,
      sentiment: 'positive'
    },
    {
      code: 'ORD',
      name: 'O\'Hare International Airport',
      city: 'Chicago',
      complexityScore: 9.5,
      dailyFlights: 2300,
      terminals: 4,
      runways: 8,
      onTimeRate: 68.9,
      avgDelay: 22.1,
      cancellationRate: 4.1,
      delayProbability: 52,
      performanceCategory: 'Poor',
      complexityCategory: 'Very High',
      marketShare: 23.1,
      efficiencyScore: 45.6,
      riskFactors: ['Low on-time performance', 'High average delays', 'High cancellation rate', 'Very high complexity'],
      riskLevel: 'High',
      securityWaitTime: 30,
      connectionEfficiency: 55,
      weatherImpact: 'Very High',
      peakHours: ['6:00-9:00 AM', '3:00-6:00 PM'],
      constructionStatus: 'Runway modernization',
      dominantAirlines: ['United', 'American', 'Southwest'],
      rating: 3.2,
      sentiment: 'neutral'
    },
    {
      code: 'ATL',
      name: 'Hartsfield-Jackson Atlanta International Airport',
      city: 'Atlanta',
      latitude: 33.6407,
      longitude: -84.4277,
      elevation: 1026,
      type: 'large_airport',
      complexityScore: 7.8,
      dailyFlights: 2800,
      terminals: 2,
      runways: 5,
      onTimeRate: 82.3,
      avgDelay: 12.5,
      cancellationRate: 1.9,
      delayProbability: 28,
      performanceCategory: 'Excellent',
      complexityCategory: 'High',
      marketShare: 28.0,
      efficiencyScore: 82.7,
      riskFactors: [],
      riskLevel: 'Low',
      securityWaitTime: 18,
      connectionEfficiency: 85,
      weatherImpact: 'Medium',
      peakHours: ['6:00-9:00 AM', '4:00-7:00 PM'],
      constructionStatus: 'Terminal improvements',
      dominantAirlines: ['Delta', 'Southwest', 'American'],
      rating: 4.1,
      sentiment: 'positive'
    },
    {
      code: 'DFW',
      name: 'Dallas/Fort Worth International Airport',
      city: 'Dallas',
      complexityScore: 8.1,
      dailyFlights: 1800,
      terminals: 5,
      runways: 7,
      onTimeRate: 78.9,
      avgDelay: 14.2,
      cancellationRate: 2.3,
      delayProbability: 35,
      performanceCategory: 'Good',
      complexityCategory: 'High',
      marketShare: 18.1,
      efficiencyScore: 71.4,
      riskFactors: ['High average delays'],
      riskLevel: 'Low',
      securityWaitTime: 20,
      connectionEfficiency: 75,
      weatherImpact: 'High',
      peakHours: ['7:00-10:00 AM', '5:00-8:00 PM'],
      constructionStatus: 'Terminal D expansion',
      dominantAirlines: ['American', 'Southwest', 'Delta'],
      rating: 3.6,
      sentiment: 'positive'
    },
    {
      code: 'SFO',
      name: 'San Francisco International Airport',
      city: 'San Francisco',
      complexityScore: 8.3,
      dailyFlights: 1200,
      terminals: 4,
      runways: 4,
      onTimeRate: 78.2,
      avgDelay: 12,
      cancellationRate: 1.2,
      delayProbability: 28,
      performanceCategory: 'Good',
      complexityCategory: 'High',
      marketShare: 14.5,
      efficiencyScore: 77.8,
      riskFactors: ['Fog delays', 'High traffic'],
      riskLevel: 'Medium',
      securityWaitTime: 24,
      connectionEfficiency: 72,
      weatherImpact: 'High',
      peakHours: ['6:00-9:00 AM', '5:00-8:00 PM'],
      constructionStatus: 'Terminal renovations',
      dominantAirlines: ['United', 'Alaska', 'Southwest'],
      rating: 4.0,
      sentiment: 'positive',
      latitude: 37.6213,
      longitude: -122.3790,
      elevation: 13,
      type: 'large_airport'
    }
  ];

  // Sentiment analysis data for airport reviews
  const sentimentData = [
    { category: 'Terminal Experience', positive: 68, neutral: 22, negative: 10 },
    { category: 'Security Efficiency', positive: 72, neutral: 20, negative: 8 },
    { category: 'Dining & Shopping', positive: 65, neutral: 25, negative: 10 },
    { category: 'Cleanliness & Maintenance', positive: 75, neutral: 18, negative: 7 },
    { category: 'Staff Friendliness', positive: 70, neutral: 23, negative: 7 },
    { category: 'WiFi & Connectivity', positive: 58, neutral: 30, negative: 12 }
  ];

  const filteredAirports = airports.filter(airport =>
    airport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    airport.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    airport.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate complexity score for sorting
  const getComplexityScore = (airport: Airport) => {
    const volumeScore = Math.min(airport.dailyFlights / 100, 10);
    const terminalScore = airport.terminals * 0.5;
    const runwayScore = airport.runways * 0.3;
    const weatherScore = airport.weatherImpact === 'Very High' ? 3 : airport.weatherImpact === 'High' ? 2 : 1;
    
    return (volumeScore * 0.4 + terminalScore * 0.2 + runwayScore * 0.2 + weatherScore * 0.2);
  };

  // Sort airports based on selected criteria
  const sortedAirports = [...filteredAirports].sort((a, b) => {
    switch (sortBy) {
      case 'complexity':
        return getComplexityScore(b) - getComplexityScore(a);
      case 'performance':
        return b.onTimeRate - a.onTimeRate;
      case 'delay':
        return a.avgDelay - b.avgDelay;
      case 'volume':
        return b.dailyFlights - a.dailyFlights;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return getComplexityScore(b) - getComplexityScore(a);
    }
  });

  const getPerformanceColor = (value: number, threshold: number, reverse = false) => {
    const isGood = reverse ? value <= threshold : value >= threshold;
    return isGood 
      ? isDarkMode ? 'text-green-400' : 'text-green-600'
      : isDarkMode ? 'text-red-400' : 'text-red-600';
  };

  const getComplexityColor = (score: number) => {
    if (score >= 8) return isDarkMode ? 'text-red-400' : 'text-red-600';
    if (score >= 6) return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
    return isDarkMode ? 'text-green-400' : 'text-green-600';
  };

  const handleViewMap = (airport: Airport) => {
    setSelectedAirportForMap(airport);
    setMapModalOpen(true);
  };

  const handleViewStatus = (airport: Airport) => {
    setSelectedAirportForStatus(airport);
    setStatusFeedOpen(true);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            <TranslatedText text="Loading airport performance data..." targetLanguage={currentLanguage} />
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <TranslatedText text="Retry" targetLanguage={currentLanguage} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`py-16 relative overflow-hidden ${isDarkMode ? 'bg-slate-800/80 backdrop-blur-md' : 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700'}`}>
        <div className="absolute inset-0 bg-[url('/Airport-beauty.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Building className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              <TranslatedText text="Airport Analytics" targetLanguage={currentLanguage} />
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-4 max-w-3xl mx-auto">
              <TranslatedText 
                text="Analyze airport complexity and performance to make informed travel decisions" 
                targetLanguage={currentLanguage} 
              />
            </p>
          </div>
        </div>
      </section>

      {/* US Airports Performance Map */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <USAirportsPerformanceMap3D 
            airports={filteredAirports.filter(airport => 
              airport.latitude && 
              airport.longitude && 
              airport.onTimeRate !== undefined && 
              airport.cancellationRate !== undefined
            ).map(airport => ({
              code: airport.code,
              name: airport.name,
              latitude: airport.latitude!,
              longitude: airport.longitude!,
              onTimeRate: airport.onTimeRate,
              cancellationRate: airport.cancellationRate,
              dailyFlights: airport.dailyFlights
            }))}
          />
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search airports by name, code, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'border-slate-300 bg-white text-slate-900 placeholder-slate-500'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 ${
                      isDarkMode ? 'hover:bg-slate-600' : ''
                    }`}
                  >
                    <XCircle className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                  </button>
                )}
              </div>
              
              <div className="flex gap-4 items-center">
                <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Sort by:
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  <option value="complexity">Highest Complexity</option>
                  <option value="performance">Best Performance</option>
                  <option value="delay">Lowest Delay</option>
                  <option value="volume">Highest Volume</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>
            
            {/* Search Results Info */}
            <div className="flex items-center justify-between">
              <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {searchQuery ? (
                  <>
                    Showing {filteredAirports.length} of {airports.length} airports
                    {filteredAirports.length === 0 && ' - No matches found'}
                  </>
                ) : (
                  `Showing all ${airports.length} airports`
                )}
              </div>
              {searchQuery && (
                <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Searching in: Name, Code, and City
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Airport Performance Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              <TranslatedText text="Airport Performance Overview" targetLanguage={currentLanguage} />
            </h2>
            <p className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <TranslatedText 
                text="Compare airports based on complexity and performance metrics" 
                targetLanguage={currentLanguage} 
              />
            </p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <TranslatedText 
                text="Complexity scores (1-10) indicate operational difficulty based on traffic volume, infrastructure, and weather sensitivity" 
                targetLanguage={currentLanguage} 
              />
            </p>
          </div>

          <div className="grid gap-6">
            {sortedAirports.map((airport) => (
              <div
                key={airport.code}
                className={`p-6 rounded-xl border shadow-md transition-all cursor-pointer relative overflow-hidden ${
                  selectedAirport === airport.code
                    ? isDarkMode 
                      ? 'bg-blue-900/20 border-blue-600 shadow-lg shadow-blue-900/20' 
                      : 'bg-blue-50 border-blue-300 shadow-lg'
                    : isDarkMode 
                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => setSelectedAirport(selectedAirport === airport.code ? '' : airport.code)}
              >
                {/* Arrival board background image */}
                <div 
                  className={`absolute inset-0 pointer-events-none ${
                    isDarkMode ? 'opacity-10' : 'opacity-20'
                  }`}
                  style={{ 
                    backgroundImage: 'url(/ArrivalBoard.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                ></div>
                <div className="relative z-10">
                {/* Expand indicator arrow */}
                <div className={`absolute bottom-3 right-3 p-1 rounded-full transition-all ${
                  selectedAirport === airport.code
                    ? 'rotate-180 bg-blue-500 text-white'
                    : isDarkMode
                    ? 'bg-slate-600 text-slate-300'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center ${isDarkMode ? 'bg-slate-700 border border-slate-600' : 'bg-slate-100 border border-slate-200'}`}>
                      <Plane className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {airport.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {airport.city} • Code: {airport.code}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* View Status Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewStatus(airport);
                      }}
                      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30' 
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200'
                      }`}
                      title="View current airport status and user updates"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Travelers Feedback</span>
                    </button>
                    
                    {/* Current Status Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAirportForCurrentStatus(airport);
                        setCurrentStatusOpen(true);
                      }}
                      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30' 
                          : 'bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200'
                      }`}
                      title="View real-time airport status"
                    >
                      <Activity className="w-4 h-4" />
                      <span>Current Status</span>
                    </button>
                    
                    {/* View Map Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMap(airport);
                      }}
                      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30' 
                          : 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-200'
                      }`}
                      title="View airport location in 3D"
                    >
                      <Map className="w-4 h-4" />
                      <span>View Map</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getPerformanceColor(airport.onTimeRate, 75)}`}>
                      {airport.onTimeRate}%
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      On-Time Rate
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getPerformanceColor(airport.avgDelay, 15, true)}`}>
                      {airport.avgDelay}m
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Avg Delay
                    </div>
                  </div>

                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getPerformanceColor(airport.cancellationRate, 2, true)}`}>
                      {airport.cancellationRate}%
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Cancellation Rate
                    </div>
                  </div>

                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {airport.dailyFlights.toLocaleString()}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Daily Flights
                    </div>
                  </div>

                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {airport.terminals}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Terminals
                    </div>
                  </div>

                  {/* User Rating */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                        {airport.rating || 3.8}
                      </span>
                      <Star className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'} fill-current`} />
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      User Rating
                    </div>
                  </div>

                  {/* Complexity Score */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span className={`text-2xl font-bold ${getComplexityColor(airport.complexityScore)}`}>
                        {airport.complexityScore}
                      </span>
                      <AlertTriangle className={`w-5 h-5 ${getComplexityColor(airport.complexityScore)}`} />
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Complexity
                    </div>
                  </div>
                </div>

                {selectedAirport === airport.code && (
                  <div className="border-t pt-6 space-y-6">
                    {/* Official Links */}
                    {(airport.homeLink || airport.wikipediaLink) && (
                      <div className="flex space-x-3">
                        {airport.homeLink && (
                          <a
                            href={airport.homeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isDarkMode 
                                ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30' 
                                : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span>Official Website</span>
                          </a>
                        )}
                        {airport.wikipediaLink && (
                          <a
                            href={airport.wikipediaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isDarkMode 
                                ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30' 
                                : 'bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span>Wikipedia</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Complexity Analysis */}
                    <div>
                      <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <TranslatedText text="Complexity Analysis" targetLanguage={currentLanguage} />
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <Building className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              Infrastructure
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Terminals:</span>
                              <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{airport.terminals}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Runways:</span>
                              <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{airport.runways}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Construction:</span>
                              <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{airport.constructionStatus}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Terminal Capacity & Services */}
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <Users className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              Services & Capacity
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Daily Capacity:</span>
                              <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{(airport.dailyFlights * 1.2).toFixed(0)} flights</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Gate Utilization:</span>
                              <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{Math.round(airport.connectionEfficiency * 0.9)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Lounges:</span>
                              <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{Math.max(3, airport.terminals * 2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Historical Performance */}
                    <div>
                      <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <TranslatedText text="Historical Performance" targetLanguage={currentLanguage} />
                      </h4>
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>On-Time Performance (Last 6 Months)</span>
                              <span className={`text-sm font-medium ${
                                airport.onTimeRate >= 80 ? 'text-green-600' : 
                                airport.onTimeRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                              }`}>{airport.onTimeRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div className={`h-2 rounded-full ${
                                airport.onTimeRate >= 80 ? 'bg-green-600' : 
                                airport.onTimeRate >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                              }`} style={{ width: `${airport.onTimeRate}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Average Delay Duration</span>
                              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{airport.avgDelay} minutes</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Cancellation Rate</span>
                              <span className={`text-sm font-medium ${
                                airport.cancellationRate <= 2 ? 'text-green-600' : 
                                airport.cancellationRate <= 4 ? 'text-yellow-600' : 'text-red-600'
                              }`}>{airport.cancellationRate}%</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Weather Impact Score</span>
                              <span className={`text-sm font-medium ${
                                airport.weatherImpact === 'Low' ? 'text-green-600' : 
                                airport.weatherImpact === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
                              }`}>{airport.weatherImpact}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operational Insights */}
                    <div>
                      <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <TranslatedText text="Operational Insights" targetLanguage={currentLanguage} />
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              Peak Hours
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            {airport.peakHours.map((hour, index) => (
                              <div key={index} className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                                • {hour}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <Users className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              Dominant Airlines
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            {airport.dominantAirlines.map((airline, index) => (
                              <div key={index} className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                                • {airline}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sentiment Analysis */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          <TranslatedText text="Sentiment by Category" targetLanguage={currentLanguage} />
                        </h4>
                      </div>
                      <div className="grid gap-3">
                        {sentimentData.map((item, index) => (
                          <div key={index} className={`p-3 rounded-lg ${
                            isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
                          }`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                {item.category}
                              </span>
                            </div>
                            <div className="flex h-2 rounded overflow-hidden">
                              <div className="bg-green-500" style={{ width: `${item.positive}%` }}></div>
                              <div className="bg-yellow-500" style={{ width: `${item.neutral}%` }}></div>
                              <div className="bg-red-500" style={{ width: `${item.negative}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-green-600">{item.positive}% Positive</span>
                              <span className="text-yellow-600">{item.neutral}% Neutral</span>
                              <span className="text-red-600">{item.negative}% Negative</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Sentiment Analysis Overview */}
                    <div className={`mt-6 p-4 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-700/50 border-slate-600' 
                        : 'bg-white border-slate-200'
                    }`}>
                      <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <TranslatedText text="Customer Sentiment Analysis" targetLanguage={currentLanguage} />
                      </h4>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            {airport.onTimeRate > 80 ? '72' : airport.onTimeRate > 70 ? '56' : '28'}%
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            <TranslatedText text="Positive" targetLanguage={currentLanguage} />
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            {airport.onTimeRate > 80 ? '20' : airport.onTimeRate > 70 ? '29' : '32'}%
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            <TranslatedText text="Neutral" targetLanguage={currentLanguage} />
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                            {airport.onTimeRate > 80 ? '8' : airport.onTimeRate > 70 ? '15' : '40'}%
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            <TranslatedText text="Negative" targetLanguage={currentLanguage} />
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-4`}>
                        <strong className={`${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          <TranslatedText text="Customers say:" targetLanguage={currentLanguage} />
                        </strong>
                        <p className="mt-2">
                          {airport.onTimeRate > 80 
                            ? `Travelers praise ${airport.name} for its efficient operations and well-organized terminals that make navigation straightforward even for first-time visitors. The airport consistently receives positive feedback for its cleanliness standards and the variety of amenities available throughout the facility. Security checkpoints are generally reported as moving quickly with professional staff, and passengers appreciate the abundance of seating at gates with convenient charging stations. While some mention that food prices are higher than expected and walking distances between terminals can be long, the overall experience is enhanced by helpful airport personnel and clear signage. The transportation connections to the city center are highly rated, making ${airport.name} a preferred hub for both business and leisure travelers.`
                            : airport.onTimeRate > 70
                            ? `Passengers have mixed experiences at ${airport.name}, with many appreciating the modern facilities and range of shopping options while expressing concerns about congestion during peak travel times. The airport receives praise for its cleanliness and the helpfulness of staff, though some travelers report inconsistent wait times at security checkpoints that can vary significantly throughout the day. Terminal amenities are generally good, but passengers note that gate areas can become overcrowded during busy periods. The ground transportation options are adequate, though some find the signage for rental cars and public transit could be clearer. Despite these challenges, ${airport.name} maintains a decent reputation among travelers who value its connectivity and overall functionality.`
                            : `Travelers frequently report challenges at ${airport.name}, particularly regarding long security wait times and crowded terminals that can make the experience stressful during peak hours. While individual staff members often receive praise for their efforts to help, many passengers feel the airport infrastructure struggles to handle current traffic volumes effectively. Common complaints include limited seating at gates, expensive parking options, and confusing terminal layouts that make connections difficult. The dining options receive mixed reviews, with some travelers finding limited healthy choices and high prices. Despite ongoing construction aimed at improvements, passengers advise allowing extra time for check-in and security, especially during morning and evening rush periods. Some bright spots include recent terminal renovations and improved WiFi connectivity.`
                          }
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSentimentAnalysis(airport.code);
                        }}
                        className={`w-full inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isDarkMode 
                            ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30' 
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>
                          <TranslatedText text="View Detailed Analysis" targetLanguage={currentLanguage} />
                        </span>
                      </button>
                    </div>


                    {/* User Rating and Feedback Section */}
                    <div className={`mt-6 p-4 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-700/50 border-slate-600' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <TranslatedText text="Rate Your Experience" targetLanguage={currentLanguage} />
                      </h4>
                      
                      {/* Star Rating */}
                      <div className="mb-4">
                        <div className={`text-sm mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          <TranslatedText text="How would you rate this airport?" targetLanguage={currentLanguage} />
                        </div>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setUserRatings({ ...userRatings, [airport.code]: star })}
                              className="transition-all transform hover:scale-110"
                            >
                              <Star 
                                className={`w-8 h-8 ${
                                  (userRatings[airport.code] || 0) >= star
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : isDarkMode 
                                      ? 'text-slate-500' 
                                      : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                          {userRatings[airport.code] && (
                            <span className={`ml-2 self-center ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                              {userRatings[airport.code]}/5
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Feedback Input */}
                      <div>
                        <div className={`text-sm mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          <TranslatedText text="Share your feedback" targetLanguage={currentLanguage} />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="What was your experience like?"
                            value={userFeedback[airport.code] || ''}
                            onChange={(e) => setUserFeedback({ ...userFeedback, [airport.code]: e.target.value })}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && userFeedback[airport.code]?.trim()) {
                                // Submit feedback
                                alert(`Thank you for your feedback about ${airport.name}!\nRating: ${userRatings[airport.code] || 'Not rated'}/5\nFeedback: ${userFeedback[airport.code]}`);
                                setUserFeedback({ ...userFeedback, [airport.code]: '' });
                              }
                            }}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isDarkMode 
                                ? 'bg-slate-600 text-white placeholder-slate-400 border-slate-500' 
                                : 'bg-white text-slate-900 placeholder-slate-500 border-slate-300'
                            } border`}
                          />
                          <button
                            onClick={() => {
                              if (userFeedback[airport.code]?.trim()) {
                                alert(`Thank you for your feedback about ${airport.name}!\nRating: ${userRatings[airport.code] || 'Not rated'}/5\nFeedback: ${userFeedback[airport.code]}`);
                                setUserFeedback({ ...userFeedback, [airport.code]: '' });
                              }
                            }}
                            disabled={!userFeedback[airport.code]?.trim()}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                              userFeedback[airport.code]?.trim()
                                ? isDarkMode 
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                                : isDarkMode
                                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Send className="w-4 h-4" />
                            <span>Submit</span>
                          </button>
                        </div>
                      </div>

                      {/* Recent Feedback Preview */}
                      {(userRatings[airport.code] || userFeedback[airport.code]) && (
                        <div className={`mt-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <TranslatedText text="Your feedback helps other travelers make informed decisions" targetLanguage={currentLanguage} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Airport Location Viewer Modal */}
      {selectedAirportForMap && (
        <AirportLocationViewer
          isOpen={mapModalOpen}
          onClose={() => {
            setMapModalOpen(false);
            setSelectedAirportForMap(null);
          }}
          airportCode={selectedAirportForMap.code}
          airportName={selectedAirportForMap.name}
          airportCity={selectedAirportForMap.city}
          complexity={selectedAirportForMap.complexityCategory || 'medium'}
          description={`${selectedAirportForMap.name} - ${selectedAirportForMap.city} Airport with complexity score ${selectedAirportForMap.complexityScore}/10`}
          latitude={selectedAirportForMap.latitude}
          longitude={selectedAirportForMap.longitude}
          elevation={selectedAirportForMap.elevation}
          homeLink={selectedAirportForMap.homeLink}
          wikipediaLink={selectedAirportForMap.wikipediaLink}
        />
      )}

      {/* Airport Status Feed Modal */}
      {selectedAirportForStatus && (
        <AirportStatusFeed
          isOpen={statusFeedOpen}
          onClose={() => {
            setStatusFeedOpen(false);
            setSelectedAirportForStatus(null);
          }}
          airportCode={selectedAirportForStatus.code}
          airportName={selectedAirportForStatus.name}
        />
      )}
      
      {/* Airport Current Status Component */}
      {selectedAirportForCurrentStatus && (
        <AirportCurrentStatus
          isOpen={currentStatusOpen}
          onClose={() => {
            setCurrentStatusOpen(false);
            setSelectedAirportForCurrentStatus(null);
          }}
          airportCode={selectedAirportForCurrentStatus.code}
          airportName={selectedAirportForCurrentStatus.name}
        />
      )}
      
      {/* Sentiment Analysis Modal */}
      {showSentimentAnalysis && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowSentimentAnalysis('')}>
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <SentimentAnalysis
                data={generateAirportSentimentData(
                  airports.find(a => a.code === showSentimentAnalysis)?.name || showSentimentAnalysis
                )}
                onClose={() => setShowSentimentAnalysis('')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 