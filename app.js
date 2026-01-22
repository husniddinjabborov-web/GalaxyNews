/**
 * GALAXY NEWS - Main Application Logic
 */

// 1. URL uchun sarlavhani tozalash (Slug generator)
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/o‘|o'|o’/g, 'o') // O' harfi uchun
        .replace(/g‘|g'|g’/g, 'g') // G' harfi uchun
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// 2. Vaqtni hisoblash (Relative time)
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

// Global holat (State)
let currentCategory = 'all';
let searchQuery = '';

const categoryNames = {
    'entertainment': 'Entertainment',
    'crime': 'Crime',
    'royals': 'Royals',
    'humanInterest': 'Human Interest',
    'celebrity': 'Celebrity',
    'health': 'Health',
};

// 3. Ma'lumotlarni render qilish
function renderNews() {
    const container = document.getElementById('newsContainer');
    const trendingContainer = document.getElementById('trendingNews');
    const featuredSection = document.getElementById('featuredSection');
    const noResults = document.getElementById('noResults');
    const sectionTitle = document.getElementById('sectionTitle');

    // Ma'lumotlarni saralash (ID bo'yicha kamayish)
    let sortedNews = [...newsData].sort((a, b) => b.id - a.id);

    // Filtrlar
    let filteredNews = sortedNews.filter(item => {
        const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Sarlavhani yangilash
    if (sectionTitle) {
        sectionTitle.innerText = currentCategory === 'all' ? 'All news' : categoryNames[currentCategory];
    }

    // A. ASOSIY YANGILIK (Featured)
    if (currentCategory === 'all' && !searchQuery && filteredNews.length > 0) {
        const main = filteredNews[0];
        featuredSection.innerHTML = `
            <a href="article.html?title=${generateSlug(main.title)}" class="text-decoration-none shadow-sm d-block" style="border-radius: 15px; overflow: hidden;">
                <div class="featured-news mb-0">
                    <img src="${main.image}" alt="${main.title}">
                    <div class="featured-overlay">
                        <span class="badge badge-category mb-3">Latest News</span>
                        <h1 class="display-5 fw-bold mb-3">${main.title}</h1>
                        <p class="card-text lead mb-3 text-white-50">${main.description}</p>
                        <div class="d-flex align-items-center text-white-50">
                            <span><i class="fas fa-clock me-2"></i>${calculateTime(main.date)}</span>
                        </div>
                    </div>
                </div>
            </a>`;
        featuredSection.style.display = 'block';
    } else {
        featuredSection.style.display = 'none';
    }

    // B. TRENDING VA RO'YXAT
    if (filteredNews.length === 0) {
        container.innerHTML = '';
        trendingContainer.innerHTML = '';
        document.getElementById('trendingSection').style.display = 'none';
        noResults.classList.remove('d-none');
    } else {
        noResults.classList.add('d-none');

        if (currentCategory === 'all' && !searchQuery) {
            document.getElementById('trendingSection').style.display = 'block';
            trendingContainer.innerHTML = filteredNews.slice(1, 4).map(item => createNewsCard(item, true)).join('');
            container.innerHTML = filteredNews.slice(4).map(item => createNewsCard(item)).join('');
        } else {
            document.getElementById('trendingSection').style.display = 'none';
            container.innerHTML = filteredNews.map(item => createNewsCard(item)).join('');
        }
    }
}

// 4. Card yaratish (HTML strukturasi)
function createNewsCard(item, isTrending = false) {
    const vaqt = calculateTime(item.date);
    const slug = generateSlug(item.title);
    const catName = categoryNames[item.category] || 'General';

    return `
    <div class="col-md-${isTrending ? '4' : '6'} col-lg-4">
        <a href="article.html?title=${slug}" class="text-decoration-none text-dark">
            <div class="card news-card h-100"> 
                <img src="${item.image}" class="card-img-top" onerror="this.src='https://via.placeholder.com/400x250?text=No+Image'">
                <div class="card-body d-flex flex-column">
                    <span class="badge ${isTrending ? 'trending-badge' : 'badge-category'} mb-2">
                        ${catName}
                    </span>
                    <h5 class="card-title fw-bold">${item.title}</h5>
                    <p class="card-text text-muted small">${item.description}</p>
                    <div class="mt-auto pt-3 d-flex justify-content-between align-items-center text-muted small">
                        <span><i class="fas fa-clock me-1"></i>${vaqt}</span>
                        <span class="text-primary">More →</span>
                    </div>
                </div>
            </div>
        </a>
    </div>`;
}

// --- EVENT LISTENERS (HODISALAR) ---

// 5. Qidiruv (Ikkala maydon uchun: Desktop va Mobile)
['searchInput', 'searchInputMobile'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            // Bir vaqtning o'zida ikkala inputni sinxronlash (ixtiyoriy)
            document.getElementById('searchInput').value = searchQuery;
            document.getElementById('searchInputMobile').value = searchQuery;
            renderNews();
        });
    }
});

// 6. Kategoriyalar (Hammasi uchun bitta delegatsiya)
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.category-btn');
    if (btn) {
        // Active klassini yangilash
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        // Bir xil kategoriyadagi barcha tugmalarni active qilish (Desktop + Mobile)
        const cat = btn.dataset.category;
        document.querySelectorAll(`.category-btn[data-category="${cat}"]`).forEach(b => b.classList.add('active'));

        currentCategory = cat;
        renderNews();

        // Mobile menyuni avtomatik yopish
        const navbarCollapse = document.getElementById('navbarNav');
        if (navbarCollapse.classList.contains('show')) {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
            if (bsCollapse) bsCollapse.hide();
        }
    }
});

// Dastlabki yuklash
document.addEventListener('DOMContentLoaded', renderNews);