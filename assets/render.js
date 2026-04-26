const contentPath = 'assets/content.json';

function createNode(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createExternalLink(label, url, className) {
  const mergedClass = className ? `${className} interactive-link` : 'interactive-link';
  const link = createNode('a', mergedClass, label);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function appendInlineLinks(container, text) {
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let cursor = 0;
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    const [fullMatch, label, url] = match;
    const startIndex = match.index;

    if (startIndex > cursor) {
      container.appendChild(document.createTextNode(text.slice(cursor, startIndex)));
    }

    const link = createNode('a', 'bio-inline-link', label);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    container.appendChild(link);

    cursor = startIndex + fullMatch.length;
  }

  if (cursor < text.length) {
    container.appendChild(document.createTextNode(text.slice(cursor)));
  }
}

function getPaperUrl(item) {
  if (item.paperUrl) return item.paperUrl;

  const preferredLabels = ['pdf', 'paper', 'arxiv'];
  const matchedLink = (item.links || []).find((link) =>
    preferredLabels.includes(String(link.label || '').toLowerCase())
  );
  if (matchedLink?.url) return matchedLink.url;

  if (item.media?.href) return item.media.href;
  if (item.links?.[0]?.url) return item.links[0].url;

  return null;
}

function renderAbout(data) {
  const image = document.getElementById('about-image');
  image.src = data.image.src;
  image.alt = data.image.alt;
  image.width = data.image.width;
  image.height = data.image.height;

  document.getElementById('about-name').textContent = data.name;
  document.getElementById('about-tagline').textContent = data.tagline;

  const bioContainer = document.getElementById('about-bio');
  bioContainer.innerHTML = '';
  data.bio.forEach((paragraph) => {
    const paragraphNode = createNode('p');
    appendInlineLinks(paragraphNode, paragraph);
    bioContainer.appendChild(paragraphNode);
  });

  const socialContainer = document.getElementById('social-links');
  socialContainer.innerHTML = '';
  data.links.forEach((item) => {
    socialContainer.appendChild(
      createExternalLink(
        item.label,
        item.url,
        'flex items-center gap-2 text-muted hover:text-accent transition-colors'
      )
    );
  });
}

function createMediaNode(media) {
  const wrapperClass = media.type === 'video'
    ? 'aspect-video bg-white rounded-sm overflow-hidden'
    : 'aspect-[4/3] bg-white rounded-sm overflow-hidden';
  const wrapper = createNode('div', wrapperClass);

  if (media.type === 'video') {
    const video = createNode('video', 'w-full h-full object-cover');
    video.controls = true;
    video.playsInline = true;
    video.poster = media.poster;

    const source = document.createElement('source');
    source.src = media.src;
    source.type = 'video/mp4';
    video.appendChild(source);
    video.appendChild(document.createTextNode('Your browser does not support the video tag.'));
    wrapper.appendChild(video);
    return wrapper;
  }

  const image = createNode('img', 'w-full h-full object-contain hover:opacity-80 transition-opacity');
  image.src = media.src;
  image.alt = media.alt;
  image.loading = 'lazy';

  if (media.href) {
    const link = document.createElement('a');
    link.className = 'interactive-link interactive-media';
    link.href = media.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.appendChild(image);
    wrapper.appendChild(link);
  } else {
    wrapper.appendChild(image);
  }

  return wrapper;
}

function renderResearch(research) {
  document.getElementById('research-title').textContent = research.title;

  const list = document.getElementById('research-list');
  list.innerHTML = '';

  research.items.forEach((item) => {
    const article = createNode('article');
    const grid = createNode('div', 'grid md:grid-cols-3 gap-6 items-start');

    const mediaCol = createNode('div', 'md:col-span-1');
    mediaCol.appendChild(createMediaNode(item.media));

    const contentCol = createNode('div', 'md:col-span-2 space-y-3');
    const heading = createNode('h4', 'text-lg font-medium leading-tight');
    const paperUrl = getPaperUrl(item);
    if (paperUrl) {
      heading.appendChild(
        createExternalLink(item.title, paperUrl, 'project-title-link')
      );
    } else {
      heading.textContent = item.title;
    }
    contentCol.appendChild(heading);

    const meta = createNode('p', 'text-sm text-muted');
    meta.appendChild(document.createTextNode(item.authors));
    if (item.venue) {
      meta.appendChild(createNode('span', 'mx-2', '•'));
      meta.appendChild(document.createTextNode(item.venue));
    }
    contentCol.appendChild(meta);

    const summary = createNode('p', 'text-sm text-gray-900/70 leading-relaxed');
    summary.appendChild(createNode('span', 'text-muted font-medium', 'TL;DR:'));
    summary.appendChild(document.createTextNode(` ${item.summary}`));
    contentCol.appendChild(summary);

    const links = createNode('div', 'flex flex-wrap gap-3 pt-2');
    item.links.forEach((link) => {
      links.appendChild(
        createExternalLink(
          link.label,
          link.url,
          'inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors'
        )
      );
    });

    contentCol.appendChild(links);
    grid.appendChild(mediaCol);
    grid.appendChild(contentCol);
    article.appendChild(grid);
    list.appendChild(article);
  });
}

function renderContact(contact) {
  document.getElementById('contact-title').textContent = contact.title;
  document.getElementById('contact-subtitle').textContent = contact.subtitle;

  const email = document.getElementById('contact-email');
  email.textContent = contact.email;
  email.href = `mailto:${contact.email}`;

  if (contact.contactCard) {
    const row = document.getElementById('contact-card-row');
    const link = document.getElementById('contact-card-link');
    link.textContent = contact.contactCard.label;
    link.href = contact.contactCard.url;
    row.classList.remove('hidden');
  }
}

function renderFooter(footer) {
  document.getElementById('footer-copyright').textContent = footer.copyright;
  document.getElementById('footer-signature').textContent = footer.signature;
  const navSignature = document.getElementById('site-signature');
  if (navSignature) {
    navSignature.textContent = footer.signature;
  }
}

function setupMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    menuBtn.setAttribute('aria-expanded', String(!mobileMenu.classList.contains('hidden')));
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

function enhanceInteractiveElements() {
  document.querySelectorAll('a').forEach((link) => {
    link.classList.add('interactive-link');
  });
}

async function init() {
  try {
    const response = await fetch(contentPath, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load content.json');

    const content = await response.json();
    renderAbout({ ...content.about, tagline: content.site.tagline });
    renderResearch(content.research);
    renderContact(content.contact);
    renderFooter(content.footer);
  } catch (error) {
    console.error(error);
  } finally {
    enhanceInteractiveElements();
    setupMobileMenu();
  }
}

init();
