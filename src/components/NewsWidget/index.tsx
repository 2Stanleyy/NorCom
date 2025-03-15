import React, { useState } from 'react';
import './NewsWidget.css';

interface NewsItem {
  id: number;
  title: string;
  time: string;
  category: string;
  content: string;
}

const NewsWidget: React.FC = () => {
  const [expandedNews, setExpandedNews] = useState<number | null>(null);
  
  // Sample news items with terminal/financial aesthetic
  const newsItems: NewsItem[] = [
    {
      id: 1,
      title: "MARKET ALERT",
      time: "09:30",
      category: "URGENT",
      content: "NYSE opens with significant volatility. S&P 500 futures indicate sharp decline in tech sector."
    },
    {
      id: 2,
      title: "CRYPTO UPDATE",
      time: "10:15",
      category: "INFO",
      content: "BTC stabilizing after weekend sell-off. Resistance at $45K level holds strong despite whale movements."
    },
    {
      id: 3,
      title: "EARNINGS REPORT",
      time: "11:32",
      category: "DATA",
      content: "Q3 reports exceed analyst expectations with 15% growth YoY. Tech sector leads with 22% gains."
    },
    {
      id: 4,
      title: "SECURITY ADVISORY",
      time: "12:45",
      category: "WARNING",
      content: "New zero-day vulnerability detected in financial systems. Patch deployment recommended immediately."
    }
  ];
  
  // Toggle expanded news item
  const toggleNewsExpand = (id: number) => {
    if (expandedNews === id) {
      setExpandedNews(null);
    } else {
      setExpandedNews(id);
    }
  };
  
  return (
    <div className="news-widget">
      <div className="news-list">
        {newsItems.map((item) => (
          <div 
            key={item.id}
            className={`news-item ${expandedNews === item.id ? 'expanded' : ''}`}
            onClick={() => toggleNewsExpand(item.id)}
          >
            <div className="news-header">
              <div className="news-meta">
                <span className="news-time">{item.time}</span>
                <span className={`news-category ${item.category.toLowerCase()}`}>
                  {item.category}
                </span>
              </div>
              <div className="news-title">{item.title}</div>
              <div className="expand-icon">{expandedNews === item.id ? '−' : '+'}</div>
            </div>
            
            {expandedNews === item.id && (
              <div className="news-content">
                <p>{item.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsWidget; 