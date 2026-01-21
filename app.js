
function calculateTime(date) {
    const now = new Date();
    const articleDate = new Date(date);
    const diff = Math.floor((now - articleDate) / 1000);

    if (diff < 60) return "just now";

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return articleDate.toLocaleDateString('en-US');
}
let currentCategory = 'all';
let searchQuery = '';

function renderNews() {
    const container = document.getElementById('newsContainer');
    const trendingContainer = document.getElementById('trendingNews');
    const featuredSection = document.getElementById('featuredSection');
    const noResults = document.getElementById('noResults');

    let filteredNews = newsData.filter(item => {
        const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // 1. ASOSIY YANGILIK (FEATURED) QISMI
    if (currentCategory === 'all' && !searchQuery && filteredNews.length > 0) {
        const main = filteredNews[0];
        featuredSection.innerHTML = `
<a href="maqola.html?id=${main.id}" class="text-decoration-none shadow-sm d-block" style="border-radius: 15px; overflow: hidden;">
    <div class="featured-news mb-0">
        <img src="${main.image}" alt="${main.title}">
        <div class="featured-overlay">
            <span class="badge badge-category mb-3">Featured</span>
            <h1 class="display-5 fw-bold mb-3">${main.title}</h1>
            <p class="card-text lead mb-3 text-white-50">${main.description}</p>
            <div class="d-flex align-items-center text-white-50">
                <span><i class="fas fa-clock me-2"></i>${calculateTime(main.date)}</span>
            </div>
        </div>
    </div>
</a>`;
        featuredSection.style.display = 'block';
    }
    else {
        featuredSection.style.display = 'none';
    }

    // 2. TRENDDAGI VA BARCHA YANGILIKLAR
    if (filteredNews.length === 0) {
        container.innerHTML = '';
        noResults.classList.remove('d-none');
    } else {
        noResults.classList.add('d-none');

        // Trenddagilar (agar kategoriya 'all' bo'lsa)
        if (currentCategory === 'all' && !searchQuery) {
            document.getElementById('trendingSection').style.display = 'block';
            trendingContainer.innerHTML = filteredNews.slice(1, 4).map(item => createNewsCard(item, true)).join('');
        } else {
            document.getElementById('trendingSection').style.display = 'none';
        }

        // Oddiy ro'yxat - BU QATOR TUZATILDI!
        const newsToShow = (currentCategory === 'all' && !searchQuery)
            ? filteredNews.slice(4)  // Featured(1) va Trending(3) ni olib tashlash
            : filteredNews;          // Filtrlanganda hammasini ko'rsatish

        container.innerHTML = newsToShow.map(item => createNewsCard(item)).join('');
    }
}

function createNewsCard(item, isTrending = false) {
    const categoryNames = {
        'entertainment': 'Entertainment',
    };

    const vaqtMatni = calculateTime(item.date);

    return `
<div class="col-md-${isTrending ? '4' : '6'} col-lg-4">
    <a href="maqola.html?id=${item.id}" class="text-decoration-none text-dark">
        <div class="card news-card h-100"> 
            <img src="${item.image}" class="card-img-top">
            <div class="card-body">
                <span class="badge ${isTrending ? 'trending-badge' : 'badge-category'} mb-2">
                    ${categoryNames[item.category]}
                </span>
                <h5 class="card-title fw-bold">${item.title}</h5>
                <p class="card-text text-muted small">${item.description}</p>
                
                <div class="card-footer-info mt-auto">
                    <div class="d-flex justify-content-between align-items-center text-muted small">
                        <span><i class="fas fa-clock me-1"></i>${vaqtMatni}</span>
                        <span class="text-primary">Batafsil →</span>
                    </div>
                </div>
            </div>
        </div>
    </a>
</div>
`;
}

// Category buttons
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.dataset.category;
        renderNews();
    });
});

// Search
document.getElementById('searchInput').addEventListener('input', function (e) {
    searchQuery = e.target.value;
    renderNews();
});

// Initial render
renderNews();