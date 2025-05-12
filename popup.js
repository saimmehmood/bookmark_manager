document.addEventListener('DOMContentLoaded', () => {
  const organizeBtn = document.getElementById('organizeBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const bookmarksContainer = document.getElementById('bookmarksContainer');

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

  // Function to organize bookmarks by year and month
  function organizeBookmarks(bookmarks) {
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

  // Function to render organized bookmarks
  function renderBookmarks(organizedBookmarks) {
    bookmarksContainer.innerHTML = '';
    
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
  }

  // Event listeners
  organizeBtn.addEventListener('click', async () => {
    const bookmarks = await getAllBookmarks();
    const organized = organizeBookmarks(bookmarks);
    renderBookmarks(organized);
  });

  refreshBtn.addEventListener('click', async () => {
    const bookmarks = await getAllBookmarks();
    const organized = organizeBookmarks(bookmarks);
    renderBookmarks(organized);
  });

  // Initial load
  organizeBtn.click();
}); 