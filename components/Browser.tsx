import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, X, Info, Star, Globe, Home, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

// Constants
const HOMEPAGE = 'https://www.google.com/webhp?igu=1';

// Default bookmarks with proper favicons
const DEFAULT_BOOKMARKS = [
  {
    name: "Google",
    url: "https://www.google.com/webhp?igu=1",
    favicon: "https://www.google.com/favicon.ico"
  },
  {
    name: "Wikipedia",
    url: "https://en.wikipedia.org",
    favicon: "https://en.wikipedia.org/favicon.ico"
  },
  {
    name: "GitHub",
    url: "https://github.com",
    favicon: "https://github.com/favicon.ico"
  }
];

interface BrowserProps {
  id: string;
}

export function Browser({ id }: BrowserProps) {
  const [url, setUrl] = useState(HOMEPAGE);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<string[]>([HOMEPAGE]);
  const [historyPosition, setHistoryPosition] = useState(0);
  const [showBookmarks, setShowBookmarks] = useState(true);
  const [bookmarks, setBookmarks] = useState(DEFAULT_BOOKMARKS);
  const [pageTitle, setPageTitle] = useState('Google');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const canGoBack = historyPosition > 0;
  const canGoForward = historyPosition < history.length - 1;

  const navigateTo = (newUrl: string) => {
    try {
      // Format URL if needed
      let formattedUrl = newUrl;
      if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
        if (newUrl.includes('.') && !newUrl.includes(' ')) {
          formattedUrl = `https://${newUrl}`;
        } else {
          // Treat as search query
          formattedUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(newUrl)}`;
        }
      }

      console.log("Navigating to:", formattedUrl);
      
      // Update iframe src
      if (iframeRef.current) {
        setLoading(true);
        iframeRef.current.src = formattedUrl;
      }
      
      // Update URL state
      setUrl(formattedUrl);
      
      // Hide bookmarks when navigating
      setShowBookmarks(false);
      
      // Update history
      if (historyPosition < history.length - 1) {
        setHistory(prev => [...prev.slice(0, historyPosition + 1), formattedUrl]);
        setHistoryPosition(historyPosition + 1);
      } else {
        setHistory(prev => [...prev, formattedUrl]);
        setHistoryPosition(history.length);
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const goBack = () => {
    if (canGoBack) {
      const previousUrl = history[historyPosition - 1];
      setHistoryPosition(historyPosition - 1);
      setUrl(previousUrl);
      
      if (iframeRef.current) {
        setLoading(true);
        iframeRef.current.src = previousUrl;
      }
    }
  };

  const goForward = () => {
    if (canGoForward) {
      const nextUrl = history[historyPosition + 1];
      setHistoryPosition(historyPosition + 1);
      setUrl(nextUrl);
      
      if (iframeRef.current) {
        setLoading(true);
        iframeRef.current.src = nextUrl;
      }
    }
  };

  const refresh = () => {
    if (iframeRef.current) {
      setLoading(true);
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const goHome = () => {
    navigateTo(HOMEPAGE);
  };

  const toggleBookmarks = () => {
    setShowBookmarks(!showBookmarks);
  };

  const addCurrentPageToBookmarks = () => {
    const siteName = pageTitle || url.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
    let favicon = "/favicon.ico";
    
    try {
      const urlObj = new URL(url);
      favicon = `${urlObj.origin}/favicon.ico`;
    } catch {
      // Use default favicon if URL parsing fails
    }
    
    const newBookmark = {
      name: siteName,
      url: url,
      favicon: favicon
    };
    
    // Check if bookmark already exists
    if (!bookmarks.some(bookmark => bookmark.url === url)) {
      setBookmarks([...bookmarks, newBookmark]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigateTo(e.currentTarget.value);
    }
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    setLoading(false);
    try {
      // Try to update the URL bar and title if possible
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const iframeUrl = iframeRef.current.contentWindow.location.href;
        const iframeTitle = iframeRef.current.contentDocument?.title || 'Google';
        
        // Only update URL and history if it's a new URL (not triggered by our own navigation)
        if (iframeUrl !== url) {
          setUrl(iframeUrl);
          setPageTitle(iframeTitle);
          
          // Update history state to add the new URL
          if (historyPosition < history.length - 1) {
            // We're navigating from a back/forward position
            setHistory(prev => [...prev.slice(0, historyPosition + 1), iframeUrl]);
          } else {
            // Normal navigation, add to history
            setHistory(prev => [...prev, iframeUrl]);
          }
          setHistoryPosition(prev => prev + 1);
          
          if (inputRef.current) {
            inputRef.current.value = iframeUrl;
          }
        }
      }
    } catch (error) {
      // Ignore cross-origin errors
      console.log("Could not access iframe properties due to security restrictions");
    }
  };

  // Listen for iframe navigation events
  useEffect(() => {
    const handleIframeNavigation = () => {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          // This will catch when a user clicks a link inside the iframe
          const currentUrl = iframeRef.current.contentWindow.location.href;
          if (currentUrl !== url) {
            setUrl(currentUrl);
            
            // Update history
            setHistory(prev => [...prev.slice(0, historyPosition + 1), currentUrl]);
            setHistoryPosition(prev => prev + 1);
          }
        }
      } catch (error) {
        // Ignore cross-origin errors
      }
    };

    // Try to attach navigation listener to iframe
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.addEventListener('popstate', handleIframeNavigation);
      }
    } catch (error) {
      // Ignore cross-origin errors
    }

    return () => {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.removeEventListener('popstate', handleIframeNavigation);
        }
      } catch (error) {
        // Ignore cross-origin errors
      }
    };
  }, [url, historyPosition]);

  // Update the URL bar input to match the current URL
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = url;
    }
  }, [url]);

  return (
    <div className="flex flex-col h-full w-full bg-black rounded-md overflow-hidden">
      <div className="flex items-center p-2 gap-1 bg-[#2b2b2b] border-b border-[#3a3a3a]">
        <button 
          className={cn(
            "p-1.5 rounded-full hover:bg-slate-700/50", 
            !canGoBack && "opacity-50 cursor-not-allowed"
          )}
          onClick={goBack}
          disabled={!canGoBack}
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>
        
        <button 
          className={cn(
            "p-1.5 rounded-full hover:bg-slate-700/50", 
            !canGoForward && "opacity-50 cursor-not-allowed"
          )}
          onClick={goForward}
          disabled={!canGoForward}
        >
          <ArrowRight className="h-4 w-4 text-white" />
        </button>
        
        <button 
          className="p-1.5 rounded-full hover:bg-slate-700/50"
          onClick={refresh}
        >
          <RotateCw className={cn("h-4 w-4 text-white", loading && "animate-spin")} />
        </button>
        
        <button 
          className="p-1.5 rounded-full hover:bg-slate-700/50"
          onClick={goHome}
        >
          <Home className="h-4 w-4 text-white" />
        </button>
        
        <div className="flex-1 mx-2 relative flex items-center">
          <Globe className="absolute left-2 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            defaultValue={url}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#1a1a1a] text-white rounded-md pl-8 pr-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search or enter website name"
          />
        </div>
        
        <button 
          className={cn(
            "p-1.5 rounded-full hover:bg-slate-700/50",
            showBookmarks && "bg-slate-700/50"
          )}
          onClick={toggleBookmarks}
        >
          <Bookmark className="h-4 w-4 text-white" />
        </button>
        
        <button 
          className="p-1.5 rounded-full hover:bg-slate-700/50"
          onClick={addCurrentPageToBookmarks}
        >
          <Star className="h-4 w-4 text-white" />
        </button>
        
        <button className="p-1.5 rounded-full hover:bg-slate-700/50" title={pageTitle}>
          <Info className="h-4 w-4 text-white" />
        </button>
      </div>
      
      {showBookmarks && (
        <div className="bg-[#2b2b2b] p-2 border-b border-[#3a3a3a]">
          <div className="flex flex-wrap gap-2">
            {bookmarks.map((bookmark, index) => (
              <button
                key={index}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#1a1a1a] hover:bg-[#3a3a3a] text-white text-xs"
                onClick={() => navigateTo(bookmark.url)}
              >
                <img 
                  src={bookmark.favicon} 
                  alt=""
                  className="w-4 h-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/favicon.ico";
                  }}
                />
                <span>{bookmark.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex-1 bg-white relative">
        {loading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 overflow-hidden z-10">
            <div className="h-full bg-blue-500 animate-pulse" style={{ width: '100%' }}></div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={HOMEPAGE}
          className="w-full h-full border-none"
          onLoad={handleIframeLoad}
          sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
} 