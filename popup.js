document.addEventListener('DOMContentLoaded', () => {
  const dateBtn = document.getElementById('dateBtn');
  const topicBtn = document.getElementById('topicBtn');
  const topicSelector = document.getElementById('topicSelector');
  const topicFilter = document.getElementById('topicFilter');
  const refreshBtn = document.getElementById('refreshBtn');
  const bookmarksContainer = document.getElementById('bookmarksContainer');

  let currentView = 'date';
  let currentBookmarks = [];
  let organizedBookmarks = {};

  // Function to get all bookmarks recursively
  async function getAllBookmarks() {
    const bookmarks = await chrome.bookmarks.getTree();
    const flatBookmarks = [];
    
    function traverse(bookmarkNodes) {
      for (const node of bookmarkNodes) {
        if (node.url) {
          flatBookmarks.push({
            title: node.title,
            url: node.url,
            dateAdded: new Date(node.dateAdded)
          });
        }
        if (node.children) {
          traverse(node.children);
        }
      }
    }
    
    traverse(bookmarks);
    return flatBookmarks;
  }

  // Function to determine topic from bookmark
  function determineTopic(bookmark) {
    const title = bookmark.title.toLowerCase();
    const url = bookmark.url.toLowerCase();
    
    // Common topic keywords
    const topics = {
      'social': ['facebook', 'twitter', 'instagram', 'linkedin', 'social'],
      'news': ['news', 'bbc', 'cnn', 'reuters', 'article'],
      'shopping': ['amazon', 'ebay', 'shop', 'store', 'cart'],
      'entertainment': ['youtube', 'netflix', 'spotify', 'movie', 'music'],
      'technology': ['github', 'stackoverflow', 'tech', 'programming', 'code'],
      'education': ['course', 'learn', 'tutorial', 'education', 'school'],
      'work': ['work', 'job', 'career', 'business', 'office'],
      'travel': ['trip', 'travel', 'hotel', 'flight', 'vacation'],
      'health': ['health', 'fitness', 'medical', 'diet', 'exercise'],
      'finance': ['bank', 'money', 'finance', 'investment', 'stock']
    };

    // Check title and URL for topic keywords
    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => title.includes(keyword) || url.includes(keyword))) {
        return topic;
      }
    }

    return 'other';
  }

  // Function to organize bookmarks by year and month
  function organizeByDate(bookmarks) {
    const organized = {};
    
    bookmarks.forEach(bookmark => {
      const year = bookmark.dateAdded.getFullYear();
      const month = bookmark.dateAdded.toLocaleString('default', { month: 'long' });
      
      if (!organized[year]) {
        organized[year] = {};
      }
      if (!organized[year][month]) {
        organized[year][month] = [];
      }
      
      organized[year][month].push(bookmark);
    });
    
    return organized;
  }

  // Function to organize bookmarks by topic
  function organizeByTopic(bookmarks) {
    const organized = {};
    
    bookmarks.forEach(bookmark => {
      const topic = determineTopic(bookmark);
      
      if (!organized[topic]) {
        organized[topic] = [];
      }
      
      organized[topic].push(bookmark);
    });
    
    return organized;
  }

  // Function to render organized bookmarks
  function renderBookmarks() {
    bookmarksContainer.innerHTML = '';
    
    if (currentView === 'date') {
      // Sort years in descending order
      const years = Object.keys(organizedBookmarks).sort((a, b) => b - a);
      
      years.forEach(year => {
        const yearSection = document.createElement('div');
        yearSection.className = 'year-section';
        
        const yearHeader = document.createElement('div');
        yearHeader.className = 'year-header';
        yearHeader.textContent = year;
        yearSection.appendChild(yearHeader);
        
        // Sort months in chronological order
        const months = Object.keys(organizedBookmarks[year]).sort((a, b) => {
          const monthsOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                             'July', 'August', 'September', 'October', 'November', 'December'];
          return monthsOrder.indexOf(a) - monthsOrder.indexOf(b);
        });
        
        months.forEach(month => {
          const monthSection = document.createElement('div');
          monthSection.className = 'month-section';
          
          const monthHeader = document.createElement('div');
          monthHeader.className = 'month-header';
          monthHeader.textContent = month;
          monthSection.appendChild(monthHeader);
          
          organizedBookmarks[year][month].forEach(bookmark => {
            const bookmarkItem = document.createElement('div');
            bookmarkItem.className = 'bookmark-item';
            
            const link = document.createElement('a');
            link.href = bookmark.url;
            link.textContent = bookmark.title;
            link.target = '_blank';
            
            const date = document.createElement('span');
            date.className = 'bookmark-date';
            date.textContent = bookmark.dateAdded.toLocaleDateString();
            
            bookmarkItem.appendChild(link);
            bookmarkItem.appendChild(date);
            monthSection.appendChild(bookmarkItem);
          });
          
          yearSection.appendChild(monthSection);
        });
        
        bookmarksContainer.appendChild(yearSection);
      });
    } else {
      // Sort topics alphabetically
      const topics = Object.keys(organizedBookmarks).sort();
      const selectedTopic = topicFilter.value;
      
      topics.forEach(topic => {
        if (selectedTopic === 'all' || selectedTopic === topic) {
          const topicSection = document.createElement('div');
          topicSection.className = 'topic-section';
          
          const topicHeader = document.createElement('div');
          topicHeader.className = 'topic-header';
          topicHeader.textContent = topic.charAt(0).toUpperCase() + topic.slice(1);
          topicSection.appendChild(topicHeader);
          
          organizedBookmarks[topic].forEach(bookmark => {
            const bookmarkItem = document.createElement('div');
            bookmarkItem.className = 'bookmark-item';
            
            const link = document.createElement('a');
            link.href = bookmark.url;
            link.textContent = bookmark.title;
            link.target = '_blank';
            
            const date = document.createElement('span');
            date.className = 'bookmark-date';
            date.textContent = bookmark.dateAdded.toLocaleDateString();
            
            bookmarkItem.appendChild(link);
            bookmarkItem.appendChild(date);
            topicSection.appendChild(bookmarkItem);
          });
          
          bookmarksContainer.appendChild(topicSection);
        }
      });
    }
  }

  // Function to update view
  async function updateView() {
    currentBookmarks = await getAllBookmarks();
    organizedBookmarks = currentView === 'date'
      ? organizeByDate(currentBookmarks)
      : organizeByTopic(currentBookmarks);
    renderBookmarks();
  }

  // Event listeners
  dateBtn.addEventListener('click', () => {
    currentView = 'date';
    dateBtn.classList.add('active');
    topicBtn.classList.remove('active');
    topicSelector.style.display = 'none';
    updateView();
  });

  topicBtn.addEventListener('click', () => {
    currentView = 'topic';
    topicBtn.classList.add('active');
    dateBtn.classList.remove('active');
    topicSelector.style.display = 'block';
    updateView();
  });

  topicFilter.addEventListener('change', () => {
    renderBookmarks();
  });

  refreshBtn.addEventListener('click', updateView);

  // Initial load
  updateView();
}); 