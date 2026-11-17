(() => {
  const apiRoot = '/API';
  const elements = {
    articleCount: document.getElementById('article-count'),
    articleGrid: document.getElementById('article-grid'),
    categoryNav: document.getElementById('category-nav'),
    currentDate: document.getElementById('current-date'),
    currentYear: document.getElementById('current-year'),
    emptyFeed: document.getElementById('empty-feed'),
    feedErrorMessage: document.getElementById('feed-error-message'),
    feedDate: document.getElementById('feed-date'),
    feedError: document.getElementById('feed-error'),
    feedRetry: document.getElementById('feed-retry'),
    feedStatus: document.getElementById('feed-status'),
    featureSection: document.getElementById('feature-section'),
    featuredArticle: document.getElementById('featured-article'),
    footerCategories: document.getElementById('footer-categories'),
    pageHeading: document.getElementById('page-heading'),
    search: document.getElementById('article-search'),
    sideStories: document.getElementById('side-stories'),
    ticker: document.getElementById('news-ticker')
  };

  let categories = [];
  let selectedCategory = null;
  let currentRequest = '/api/public/home';

  const today = new Date();
  elements.currentDate.textContent = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  elements.feedDate.textContent = `FIL DE L'ACTUALITÉ · ${today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  elements.currentYear.textContent = String(today.getFullYear());

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function articleText(article) {
    const parsed = new DOMParser().parseFromString(article.contenu || '', 'text/html');
    return (parsed.body.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function imageUrl(value) {
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    const path = value.replace(/^\/+/, '');
    if (path.startsWith('uploads/') || path.startsWith('images/')) return `${apiRoot}/${path}`;
    return `${apiRoot}/uploads/${encodeURIComponent(value)}`;
  }

  function articleLink(article) {
    return `${apiRoot}/article/${encodeURIComponent(article.slug || article.id)}`;
  }

  function formatDate(value) {
    if (!value) return 'À la une';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'À la une' : date.toLocaleDateString('fr-FR');
  }

  async function getJson(path) {
    const response = await fetch(`${apiRoot}${path}`, {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Le serveur a répondu avec le statut ${response.status}.`);
    }
    return response.json();
  }

  function setLoading(isLoading) {
    elements.feedStatus.hidden = !isLoading;
    elements.feedError.hidden = true;
    if (isLoading) elements.feedStatus.textContent = 'Chargement des actualités…';
  }

  function showError(error) {
    elements.feedStatus.hidden = true;
    elements.feedError.hidden = false;
    elements.feedErrorMessage.textContent = `Les actualités n’ont pas pu être chargées. ${error.message}`;
  }

  function makeImage(article, className) {
    if (!article.coverImage) {
      return makeElement('div', className === 'hero-image' ? 'mock-image-placeholder' : 'mock-card-placeholder', 'ELITE24.CD');
    }
    const image = makeElement('img', className);
    image.src = imageUrl(article.coverImage);
    image.alt = article.titre || 'Image de couverture';
    image.loading = className === 'hero-image' ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
      image.replaceWith(makeElement('div', className === 'hero-image' ? 'mock-image-placeholder' : 'mock-card-placeholder', 'ELITE24.CD'));
    }, { once: true });
    return image;
  }

  function renderFeatured(article) {
    elements.featuredArticle.replaceChildren();
    if (!article) {
      elements.featureSection.hidden = true;
      return;
    }

    const summary = articleText(article);
    elements.featuredArticle.dataset.search = `${article.titre} ${article.category?.nom || ''} ${summary}`.toLocaleLowerCase('fr');
    elements.featuredArticle.append(makeImage(article, 'hero-image'));

    const copy = makeElement('div', 'mock-hero-copy');
    copy.append(makeElement('span', 'mock-category', article.category?.nom || 'Actualité'));

    const title = makeElement('h2');
    const titleLink = makeElement('a', '', article.titre || 'Actualité');
    titleLink.href = articleLink(article);
    title.append(titleLink);
    copy.append(title);
    copy.append(makeElement('p', '', summary ? `${summary.slice(0, 230)}${summary.length > 230 ? '…' : ''}` : 'Découvrez cette actualité.'));

    const meta = makeElement('div', 'mock-meta');
    meta.append(makeElement('span', '', `Par ${article.author?.username || 'La rédaction'}`));
    const readLink = makeElement('a', '', 'Lire l’article complet →');
    readLink.href = articleLink(article);
    meta.append(readLink);
    copy.append(meta);
    elements.featuredArticle.append(copy);
    elements.featureSection.hidden = false;
  }

  function renderSideStories(articles) {
    elements.sideStories.replaceChildren();
    articles.slice(1, 4).forEach(article => {
      const link = makeElement('a', 'mock-side-story');
      link.href = articleLink(article);
      link.dataset.search = `${article.titre} ${article.category?.nom || ''} ${articleText(article)}`.toLocaleLowerCase('fr');
      link.append(makeElement('span', '', article.category?.nom || 'Actualité'));
      link.append(makeElement('strong', '', article.titre || 'Actualité'));
      link.append(makeElement('small', '', `Par ${article.author?.username || 'La rédaction'}`));
      elements.sideStories.append(link);
    });
  }

  function renderArticleCards(articles) {
    elements.articleGrid.replaceChildren();
    articles.forEach(article => {
      const link = makeElement('a', 'mock-article-card');
      link.href = articleLink(article);
      link.dataset.search = `${article.titre} ${article.category?.nom || ''} ${articleText(article)}`.toLocaleLowerCase('fr');
      link.append(makeImage(article, 'card-image'));

      const copy = makeElement('div');
      copy.append(makeElement('span', 'mock-category', article.category?.nom || 'Actualité'));
      copy.append(makeElement('h3', '', article.titre || 'Actualité'));
      copy.append(makeElement('small', '', `${formatDate(article.publishedAt)} · ${article.viewsCount || 0} vues`));
      link.append(copy);
      elements.articleGrid.append(link);
    });
  }

  function renderTicker(article) {
    const title = article?.titre || 'L’actualité de la République démocratique du Congo en continu.';
    const link = article ? articleLink(article) : '#actualites';
    elements.ticker.replaceChildren();
    for (let index = 0; index < 2; index += 1) {
      const item = makeElement('a', '', title);
      item.href = link;
      if (index === 1) item.setAttribute('aria-hidden', 'true');
      elements.ticker.append(item);
    }
  }

  function renderCategories() {
    elements.categoryNav.querySelectorAll('[data-category]:not([data-category=""])').forEach(link => link.remove());
    elements.footerCategories.replaceChildren();
    categories.forEach(category => {
      const navLink = makeElement('a', '', category.nom);
      navLink.href = `?categorie=${encodeURIComponent(category.slug)}#actualites`;
      navLink.dataset.category = category.slug;
      elements.categoryNav.insertBefore(navLink, elements.categoryNav.querySelector('a[href="/API/a-propos"]'));

      const footerLink = makeElement('a', '', category.nom);
      footerLink.href = `?categorie=${encodeURIComponent(category.slug)}#actualites`;
      footerLink.dataset.category = category.slug;
      elements.footerCategories.append(footerLink);
    });
  }

  function applySearch() {
    const query = elements.search.value.trim().toLocaleLowerCase('fr');
    const searchable = [...elements.articleGrid.children, ...elements.sideStories.children, elements.featuredArticle];
    let visibleCards = 0;
    searchable.forEach(item => {
      if (item === elements.featuredArticle && elements.featureSection.hidden) return;
      const matches = !query || (item.dataset.search || '').includes(query);
      item.hidden = !matches;
      if (item.parentElement === elements.articleGrid && matches) visibleCards += 1;
    });
    elements.emptyFeed.hidden = visibleCards > 0;
    elements.articleCount.textContent = `${visibleCards} publication${visibleCards === 1 ? '' : 's'}`;
  }

  function renderFeed(articles, heading) {
    elements.pageHeading.textContent = heading || 'L’essentiel de l’actualité';
    renderFeatured(articles[0] || null);
    renderSideStories(articles);
    renderArticleCards(articles);
    renderTicker(articles[0]);
    applySearch();
    elements.feedStatus.hidden = true;
    elements.feedError.hidden = true;
  }

  async function loadHome() {
    currentRequest = '/api/public/home';
    selectedCategory = null;
    setLoading(true);
    try {
      const data = await getJson(currentRequest);
      if (!data || !Array.isArray(data.articles) || !Array.isArray(data.categories)) {
        throw new Error('La réponse de l’API est invalide.');
      }
      categories = data.categories;
      renderCategories();
      renderFeed(data.articles, 'L’essentiel de l’actualité');
    } catch (error) {
      showError(error);
    }
  }

  async function loadCategory(category) {
    currentRequest = `/api/public/categories/${encodeURIComponent(category.slug)}/articles`;
    selectedCategory = category;
    setLoading(true);
    try {
      const data = await getJson(currentRequest);
      if (!data || !Array.isArray(data.articles)) {
        throw new Error('La réponse de l’API est invalide.');
      }
      renderFeed(data.articles, category.nom);
    } catch (error) {
      showError(error);
    }
  }

  elements.categoryNav.addEventListener('click', event => {
    const link = event.target.closest('[data-category], [data-home]');
    if (!link) return;
    event.preventDefault();
    elements.categoryNav.querySelectorAll('[data-category], [data-home]').forEach(item => item.classList.toggle('active', item === link));
    elements.search.value = '';
    if (link.hasAttribute('data-home')) {
      window.history.replaceState(null, '', '/');
      loadHome();
      return;
    }
    const category = categories.find(item => item.slug === link.dataset.category);
    if (category) {
      window.history.replaceState(null, '', `/?categorie=${encodeURIComponent(category.slug)}#actualites`);
      loadCategory(category);
    }
  });

  elements.footerCategories.addEventListener('click', event => {
    const link = event.target.closest('[data-category]');
    if (!link) return;
    event.preventDefault();
    const category = categories.find(item => item.slug === link.dataset.category);
    if (category) {
      window.history.replaceState(null, '', `/?categorie=${encodeURIComponent(category.slug)}#actualites`);
      elements.categoryNav.querySelectorAll('[data-category], [data-home]').forEach(item => {
        item.classList.toggle('active', item.dataset.category === category.slug);
      });
      elements.search.value = '';
      loadCategory(category);
      document.getElementById('actualites').scrollIntoView({ behavior: 'smooth' });
    }
  });

  elements.search.addEventListener('input', applySearch);
  elements.feedRetry.addEventListener('click', () => {
    if (selectedCategory) loadCategory(selectedCategory);
    else loadHome();
  });

  const requestedCategory = new URLSearchParams(window.location.search).get('categorie');
  loadHome().then(() => {
    const category = categories.find(item => item.slug === requestedCategory);
    if (category) {
      elements.categoryNav.querySelectorAll('[data-category], [data-home]').forEach(item => {
        item.classList.toggle('active', item.dataset.category === category.slug);
      });
      loadCategory(category);
    }
  });
})();
