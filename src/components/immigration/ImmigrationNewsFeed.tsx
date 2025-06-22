'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Newspaper, Globe, Bell, TrendingUp, Calendar, 
  ExternalLink, Filter, Search, Bookmark, Share2,
  AlertTriangle, CheckCircle, Clock, Eye, Tag,
  Rss, BookOpen, Users, MessageSquare, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PolicyUpdate, CountryCode, VisaType } from '@/lib/types';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'policy_change' | 'processing_times' | 'requirements' | 'statistics' | 'court_decision' | 'general';
  countries: CountryCode[];
  visaTypes: VisaType[];
  publishedAt: string;
  source: string;
  url?: string;
  impact: 'high' | 'medium' | 'low';
  isBreaking: boolean;
  tags: string[];
  readTime: number; // in minutes
}

interface ImmigrationNewsFeedProps {
  userCountries?: CountryCode[];
  userVisaTypes?: VisaType[];
  onNewsBookmark?: (newsId: string) => void;
  onNewsShare?: (newsId: string) => void;
}

const mockNewsData: NewsItem[] = [
  {
    id: '1',
    title: 'US Announces New Student Visa Processing Improvements',
    summary: 'USCIS introduces streamlined processing for F-1 visa applications with digital document submission.',
    content: 'The United States Citizenship and Immigration Services (USCIS) has announced significant improvements to the F-1 student visa processing system. Starting March 2024, applicants will be able to submit documents digitally through a new online portal, reducing processing times by an estimated 30%. The new system includes AI-powered document verification and automated status updates for applicants. This change affects all new F-1 applications and is expected to benefit over 200,000 international students annually.',
    category: 'policy_change',
    countries: ['US'],
    visaTypes: ['student_visa'],
    publishedAt: '2024-01-15T10:00:00Z',
    source: 'USCIS Official',
    url: 'https://uscis.gov/news/updates',
    impact: 'high',
    isBreaking: true,
    tags: ['F-1', 'processing_times', 'digital_submission'],
    readTime: 3
  },  {
    id: '2',
    title: 'Canada Express Entry Draw Results - January 2024',
    summary: 'Latest Express Entry draw invites 3,500 candidates with CRS score of 488.',
    content: 'Immigration, Refugees and Citizenship Canada (IRCC) conducted an Express Entry draw on January 10, 2024, inviting 3,500 candidates to apply for permanent residence. The minimum Comprehensive Ranking System (CRS) score was 488, marking a slight decrease from the previous draw. This draw was a general category draw, welcoming candidates from all Express Entry programs. The invited candidates have 60 days to submit their complete application for permanent residence.',
    category: 'statistics',
    countries: ['CA'],
    visaTypes: ['permanent_residency'],
    publishedAt: '2024-01-10T14:30:00Z',
    source: 'IRCC',
    url: 'https://ircc.gc.ca/express-entry',
    impact: 'medium',
    isBreaking: false,
    tags: ['express_entry', 'draw', 'CRS_score'],
    readTime: 2
  },  {
    id: '3',
    title: 'UK Skilled Worker Visa Salary Thresholds Updated',
    summary: 'New minimum salary requirements take effect for Skilled Worker visa applications.',
    content: 'The UK Home Office has announced updates to the minimum salary thresholds for Skilled Worker visa applications, effective from April 2024. The general salary threshold increases to £38,700 per year, while occupation-specific thresholds have been adjusted across various sectors. These changes align with the government\'s commitment to ensure skilled migration supports economic growth while protecting domestic workers. Existing visa holders are not affected by these changes.',
    category: 'requirements',
    countries: ['UK'],
    visaTypes: ['skilled_worker'],
    publishedAt: '2024-01-08T09:15:00Z',
    source: 'UK Home Office',
    impact: 'high',
    isBreaking: false,
    tags: ['salary_threshold', 'skilled_worker', 'requirements'],
    readTime: 4
  },  {
    id: '4',
    title: 'Australia Introduces New Priority Processing for Healthcare Workers',
    summary: 'Fast-track visa processing launched for qualified healthcare professionals.',
    content: 'The Australian Department of Home Affairs has launched a new priority processing service for healthcare workers applying for skilled visas. This initiative aims to address critical healthcare workforce shortages across Australia. Eligible applicants include doctors, nurses, physiotherapists, and other allied health professionals. Applications under this pathway will be processed within 4-6 weeks, significantly faster than standard processing times.',
    category: 'processing_times',
    countries: ['AU'],
    visaTypes: ['skilled_worker'],
    publishedAt: '2024-01-05T12:00:00Z',
    source: 'Department of Home Affairs',
    impact: 'medium',
    isBreaking: false,
    tags: ['healthcare', 'priority_processing', 'skilled_visa'],
    readTime: 3
  },
  {
    id: '5',
    title: 'Federal Court Rules on Immigration Appeal Process',
    summary: 'Landmark decision affects procedural requirements for visa refusal appeals.',
    content: 'A recent Federal Court decision has clarified procedural requirements for appealing visa refusals, particularly regarding evidence submission timelines. The court ruled that applicants must submit all relevant evidence within the initial appeal period, with limited exceptions for genuinely unavailable documents. This decision affects appeals across all visa categories and emphasizes the importance of comprehensive initial submissions.',
    category: 'court_decision',
    countries: ['US', 'CA', 'AU'],
    visaTypes: ['work_visa'],
    publishedAt: '2024-01-03T16:45:00Z',
    source: 'Federal Court',
    impact: 'medium',
    isBreaking: false,
    tags: ['court_decision', 'appeals', 'evidence'],
    readTime: 5
  }
];

export function ImmigrationNewsFeed({ 
  userCountries = [], 
  userVisaTypes = [], 
  onNewsBookmark, 
  onNewsShare 
}: ImmigrationNewsFeedProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(mockNewsData);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>(mockNewsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  const [showBreakingOnly, setShowBreakingOnly] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCategory, selectedCountry, selectedImpact, showBreakingOnly, newsItems]);

  const applyFilters = () => {
    let filtered = newsItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Country filter
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(item => 
        item.countries.includes(selectedCountry as CountryCode) ||
        item.countries.includes('all' as CountryCode)
      );
    }

    // Impact filter
    if (selectedImpact !== 'all') {
      filtered = filtered.filter(item => item.impact === selectedImpact);
    }

    // Breaking news filter
    if (showBreakingOnly) {
      filtered = filtered.filter(item => item.isBreaking);
    }

    setFilteredNews(filtered);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'policy_change': return Rss;
      case 'processing_times': return Clock;
      case 'requirements': return CheckCircle;
      case 'statistics': return TrendingUp;
      case 'court_decision': return BookOpen;
      default: return Newspaper;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'policy_change': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'processing_times': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'requirements': return 'bg-green-100 text-green-700 border-green-300';
      case 'statistics': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'court_decision': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleBookmark = (newsId: string) => {
    const newBookmarked = new Set(bookmarkedItems);
    if (newBookmarked.has(newsId)) {
      newBookmarked.delete(newsId);
    } else {
      newBookmarked.add(newsId);
    }
    setBookmarkedItems(newBookmarked);
    onNewsBookmark?.(newsId);
  };

  const handleShare = (newsId: string) => {
    const news = newsItems.find(item => item.id === newsId);
    if (news && navigator.share) {
      navigator.share({
        title: news.title,
        text: news.summary,
        url: news.url || window.location.href
      });
    }
    onNewsShare?.(newsId);
  };

  const breakingNews = newsItems.filter(item => item.isBreaking);

  return (
    <div className="space-y-6">
      {/* Breaking News Alert */}
      {breakingNews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-200">Breaking News</h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {breakingNews.length} breaking immigration {breakingNews.length === 1 ? 'update' : 'updates'} available
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowBreakingOnly(!showBreakingOnly)}
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              {showBreakingOnly ? 'Show All' : 'View Breaking'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                <Newspaper className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Immigration News & Updates</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Stay informed about the latest immigration policies and changes
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Rss className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search news, policies, countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="policy_change">Policy Changes</SelectItem>
                <SelectItem value="processing_times">Processing Times</SelectItem>
                <SelectItem value="requirements">Requirements</SelectItem>
                <SelectItem value="statistics">Statistics</SelectItem>
                <SelectItem value="court_decision">Court Decisions</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedImpact} onValueChange={setSelectedImpact}>
              <SelectTrigger>
                <SelectValue placeholder="Impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Impact Levels</SelectItem>
                <SelectItem value="high">High Impact</SelectItem>
                <SelectItem value="medium">Medium Impact</SelectItem>
                <SelectItem value="low">Low Impact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* News Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredNews.length} of {newsItems.length} articles
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-1" />
              Team View
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              Discussions
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {filteredNews.map((news, index) => {
            const CategoryIcon = getCategoryIcon(news.category);
            
            return (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-full ${getCategoryColor(news.category)}`}>
                          <CategoryIcon className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {news.isBreaking && (
                                <Badge className="bg-red-100 text-red-700 border-red-300 animate-pulse">
                                  BREAKING
                                </Badge>
                              )}
                              <Badge className={getImpactColor(news.impact)}>
                                {news.impact.toUpperCase()} IMPACT
                              </Badge>
                              <Badge variant="outline">
                                {news.readTime} min read
                              </Badge>
                            </div>

                            <h3 className="text-lg font-semibold leading-tight">
                              {news.title}
                            </h3>

                            <p className="text-muted-foreground">
                              {news.summary}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBookmark(news.id)}
                              className={bookmarkedItems.has(news.id) ? 'text-yellow-600' : ''}
                            >
                              <Bookmark className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare(news.id)}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{news.source}</span>
                          <span>•</span>
                          <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span>{news.countries.join(', ')}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {news.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <Tag className="h-2 w-2 mr-1" />
                                {tag.replace('_', ' ')}
                              </Badge>
                            ))}
                            {news.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{news.tags.length - 3} more
                              </Badge>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Read More
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>{news.title}</DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="max-h-96">
                                  <div className="prose prose-sm max-w-none">
                                    <p className="text-muted-foreground mb-4">
                                      {news.summary}
                                    </p>
                                    <div className="whitespace-pre-wrap">
                                      {news.content}
                                    </div>
                                  </div>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>

                            {news.url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={news.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Source
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredNews.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="mb-4">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No news found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms to find relevant news.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
