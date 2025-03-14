import React, { useState, useEffect } from 'react';
import './NewsWidget.css';

interface NewsItem {
  title: string;
  url: string;
  source: string;
  category: 'market' | 'tech' | 'political' | 'business' | 'global' | 'commodities';
  publishedAt: string;
  breaking?: boolean;
  urgent?: boolean;
}

const NewsWidget: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'market' | 'tech' | 'political' | 'business' | 'global' | 'commodities'>('market');
  const [hasNewItems, setHasNewItems] = useState(false);
  const [showBreakingNews, setShowBreakingNews] = useState(true);

  // Fetch news from API
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        // For demo purposes - in a real app, you would use actual API endpoints
        // Simulating API response with mock data
        const mockResponse = {
          market: [
            { 
              title: "Dow hits record high on Fed rate decision", 
              url: "#", 
              source: "MarketWatch",
              publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              urgent: true
            },
            { 
              title: "NVIDIA shares surge after AI partnership announcement", 
              url: "#", 
              source: "Bloomberg",
              publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
              breaking: true
            },
            { 
              title: "Oil prices drop amid supply concerns", 
              url: "#", 
              source: "Reuters",
              publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Bank earnings exceed analyst expectations", 
              url: "#", 
              source: "Financial Times",
              publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "S&P 500 reaches new all-time high", 
              url: "#", 
              source: "CNBC",
              publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Treasury yields fall as inflation data comes in below expectations", 
              url: "#", 
              source: "WSJ",
              publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Fed signals potential rate cuts later this year", 
              url: "#", 
              source: "Reuters",
              publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
              urgent: true
            },
            { 
              title: "Market volatility increases ahead of earnings season", 
              url: "#", 
              source: "Bloomberg",
              publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString()
            }
          ],
          
          tech: [
            { 
              title: "Apple announces next-gen AI features for iOS", 
              url: "#", 
              source: "TechCrunch",
              publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
              breaking: true
            },
            { 
              title: "Microsoft's cloud revenue grows 30% in Q3", 
              url: "#", 
              source: "The Verge",
              publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Meta's new VR headset shipments begin next month", 
              url: "#", 
              source: "Wired",
              publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Tesla unveils new battery technology", 
              url: "#", 
              source: "Ars Technica",
              publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Semiconductor shortage eases as production ramps up", 
              url: "#", 
              source: "IEEE Spectrum",
              publishedAt: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "AI startup secures $200M in Series C funding", 
              url: "#", 
              source: "VentureBeat",
              publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Quantum computing breakthrough announced by IBM", 
              url: "#", 
              source: "MIT Technology Review",
              publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Cybersecurity firms report surge in ransomware attacks", 
              url: "#", 
              source: "ZDNet",
              publishedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
            },
          ],
          
          political: [
            { 
              title: "Senate passes new infrastructure bill", 
              url: "#", 
              source: "Washington Post",
              publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              breaking: true
            },
            { 
              title: "G7 leaders agree on new climate initiatives", 
              url: "#", 
              source: "AP News",
              publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Trade negotiations with China resume next week", 
              url: "#", 
              source: "BBC",
              publishedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "New tax policy expected to be announced tomorrow", 
              url: "#", 
              source: "Reuters",
              publishedAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Congressional hearing on tech regulation scheduled", 
              url: "#", 
              source: "The Hill",
              publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "White House announces new economic advisory team", 
              url: "#", 
              source: "NPR",
              publishedAt: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "EU proposes stricter environmental regulations", 
              url: "#", 
              source: "Politico",
              publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Election polls show tight race in key states", 
              url: "#", 
              source: "FiveThirtyEight",
              publishedAt: new Date(Date.now() - 27 * 60 * 60 * 1000).toISOString()
            },
          ],
          
          business: [
            { 
              title: "Major airline announces expansion into new markets", 
              url: "#", 
              source: "Business Insider",
              publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              breaking: true
            },
            { 
              title: "Retail giant closes 50 stores amid restructuring", 
              url: "#", 
              source: "Fortune",
              publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Restaurant chain reports strongest quarter since pandemic", 
              url: "#", 
              source: "WSJ",
              publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Pharmaceutical merger creates industry giant", 
              url: "#", 
              source: "Financial Times",
              publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Supply chain disruptions continue to impact manufacturing", 
              url: "#", 
              source: "Manufacturing Weekly",
              publishedAt: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "E-commerce sales reach new quarterly record", 
              url: "#", 
              source: "Retail Dive",
              publishedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Hospitality industry shows signs of recovery", 
              url: "#", 
              source: "Hotel Business",
              publishedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Auto maker announces electric vehicle production targets", 
              url: "#", 
              source: "Automotive News",
              publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString()
            },
          ],
          
          global: [
            { 
              title: "Central bank of Japan adjusts monetary policy", 
              url: "#", 
              source: "Nikkei Asia",
              publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "European markets respond to ECB announcement", 
              url: "#", 
              source: "Euro News",
              publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Asian markets rally on positive economic data", 
              url: "#", 
              source: "South China Morning Post",
              publishedAt: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
              breaking: true
            },
            { 
              title: "UK inflation rate drops below forecasts", 
              url: "#", 
              source: "The Guardian",
              publishedAt: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Canadian dollar strengthens on commodity price surge", 
              url: "#", 
              source: "Globe and Mail",
              publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Latin American startup scene shows strong growth", 
              url: "#", 
              source: "Bloomberg Línea",
              publishedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Australian markets react to mining sector developments", 
              url: "#", 
              source: "Australian Financial Review",
              publishedAt: new Date(Date.now() - 29 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "India announces new tech investment incentives", 
              url: "#", 
              source: "Economic Times",
              publishedAt: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString()
            },
          ],
          
          commodities: [
            { 
              title: "Gold prices surge on inflation concerns", 
              url: "#", 
              source: "Kitco",
              publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              breaking: true
            },
            { 
              title: "Crude oil futures fall on inventory report", 
              url: "#", 
              source: "OilPrice.com",
              publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Natural gas hits 6-month high on supply constraints", 
              url: "#", 
              source: "ICIS",
              publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Copper demand expected to rise with green energy transition", 
              url: "#", 
              source: "Mining.com",
              publishedAt: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Agricultural futures mixed as weather impacts crop outlook", 
              url: "#", 
              source: "Farm Journal",
              publishedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Silver prices hit resistance level after recent rally", 
              url: "#", 
              source: "Seeking Alpha",
              publishedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Iron ore prices stabilize after volatile week", 
              url: "#", 
              source: "S&P Global",
              publishedAt: new Date(Date.now() - 31 * 60 * 60 * 1000).toISOString()
            },
            { 
              title: "Lithium market faces supply challenges amid EV growth", 
              url: "#", 
              source: "Battery Materials",
              publishedAt: new Date(Date.now() - 35 * 60 * 60 * 1000).toISOString()
            },
          ],
        };

        // Format the data to match our NewsItem interface
        const formattedNews = mockResponse[activeCategory].map(item => ({
          ...item,
          category: activeCategory
        })) as NewsItem[];
        
        setNewsItems(formattedNews);
        setError(null);
        
        // Flash "NEW" indicator briefly
        setHasNewItems(true);
        setTimeout(() => setHasNewItems(false), 3000);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to load news");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    
    // Refresh every 2 minutes for a more dynamic feel
    const intervalId = setInterval(fetchNews, 2 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [activeCategory]);

  // Format the published time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  // Add a new news item randomly every 30-60 seconds to create a dynamic feel
  useEffect(() => {
    if (newsItems.length === 0) return;
    
    const addRandomNews = () => {
      // Only add news sometimes (30% chance)
      if (Math.random() > 0.3) return;
      
      const newsSources = [
        "Bloomberg", "Reuters", "CNBC", "Wall Street Journal", 
        "Financial Times", "MarketWatch", "Barron's", "The Economist"
      ];
      
      const breakingNews = [
        "Breaking: Market volatility increases on Fed comments",
        "Flash: Major tech company announces surprise acquisition",
        "Alert: Regulatory changes impact banking sector",
        "Breaking: Unexpected shift in commodity markets",
        "Flash: Surprise earnings beat from major retailer",
        "Alert: Central bank announces policy shift"
      ];
      
      // Pick a random breaking news headline
      const randomHeadline = breakingNews[Math.floor(Math.random() * breakingNews.length)];
      const randomSource = newsSources[Math.floor(Math.random() * newsSources.length)];
      
      const newItem: NewsItem = {
        title: randomHeadline,
        url: "#",
        source: randomSource,
        category: activeCategory,
        publishedAt: new Date().toISOString(),
        breaking: true
      };
      
      // Add to beginning of the list
      setNewsItems(prev => [newItem, ...prev.slice(0, 7)]);
      
      // Flash "NEW" indicator
      setHasNewItems(true);
      setTimeout(() => setHasNewItems(false), 3000);
    };
    
    // Randomly add news every 30-60 seconds
    const randomTime = Math.floor(Math.random() * 30000) + 30000;
    const intervalId = setInterval(addRandomNews, randomTime);
    
    return () => clearInterval(intervalId);
  }, [newsItems, activeCategory]);

  return (
    <div className="news-widget">
      <div className="news-header">
        <div className="news-categories">
          <button 
            className={`category-button ${activeCategory === 'market' ? 'active' : ''}`}
            onClick={() => setActiveCategory('market')}
          >
            MARKETS
          </button>
          <button 
            className={`category-button ${activeCategory === 'business' ? 'active' : ''}`}
            onClick={() => setActiveCategory('business')}
          >
            BUSINESS
          </button>
          <button 
            className={`category-button ${activeCategory === 'tech' ? 'active' : ''}`}
            onClick={() => setActiveCategory('tech')}
          >
            TECH
          </button>
          <button 
            className={`category-button ${activeCategory === 'global' ? 'active' : ''}`}
            onClick={() => setActiveCategory('global')}
          >
            GLOBAL
          </button>
        </div>
      </div>

      {showBreakingNews && newsItems.some(item => item.breaking) && (
        <div className="breaking-news-banner">
          <div className="breaking-label">BREAKING</div>
          <div className="breaking-content">
            {newsItems.find(item => item.breaking)?.title}
          </div>
          <button 
            className="close-breaking" 
            onClick={() => setShowBreakingNews(false)}
          >
            ×
          </button>
        </div>
      )}

      <div className="news-content">
        {loading ? (
          <div className="loading-indicator">Loading news...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="news-items">
            {newsItems.map((item, index) => (
              <div 
                key={index} 
                className={`news-item ${item.urgent ? 'urgent' : ''}`}
              >
                <div className="news-item-header">
                  <span className="news-source">{item.source}</span>
                  <span className="news-time">
                    {new Date(item.publishedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="news-title">
                  {item.urgent && <span className="urgent-label">URGENT</span>}
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="news-footer">
        <div className="news-update-indicator">
          <div className="indicator-dot"></div>
          LIVE UPDATES
        </div>
        <div className="news-timestamp">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default NewsWidget; 