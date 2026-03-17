import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

function updateTopNav(topNavElements) {
  // 1) Scope to the correct wrapper
  const wrapper = topNavElements.querySelector('.nav-top .default-content-wrapper');
  if (!wrapper) return;

  // 2) Add class "topnav-address" to the first <p>
  const firstP = wrapper.querySelector('p');
  if (!firstP) return;
  firstP.classList.add('topnav-address');

  // 3) Create a new div with class "topnav-address" inside the wrapper
  const container = document.createElement('div');
  container.className = 'topnav-detail-wrapper';

  // Insert the new div at the top of the wrapper (adjust if you prefer a different position)
  wrapper.insertBefore(container, wrapper.firstChild);

  // 4) Move the first <p> and the ".nav-top__email" into the new container
  const emailEl = wrapper.querySelector('.nav-top__email');
  container.appendChild(firstP);      // move the first paragraph inside
  if (emailEl) container.appendChild(emailEl); // move email block if present
}

function decorateStickyBehaviour(elements) {
  const header = document.querySelector('header.header-wrapper');
  const carousel = document.querySelector('.carousel');

  if (!header || !carousel) {
    // Graceful no-op if the expected elements aren't present.
    return;
  }

  // ---- Spacer prevents layout jump when we switch to fixed positioning
  const spacer = document.createElement('div');
  spacer.setAttribute('aria-hidden', 'true');
  Object.assign(spacer.style, { width: '100%', height: '0px' });

  let isSticky = false;
  let lastScrollY = window.scrollY;

  function updateSpacer() {
    if (!isSticky) return;
    const h = header.getBoundingClientRect().height;
    spacer.style.height = `${h}px`;
  }

  function stick() {
    if (isSticky) return;
    isSticky = true;
    header.classList.add('is-sticky');
    header.insertAdjacentElement('afterend', spacer);
    updateSpacer();
  }

  function unstick() {
    if (!isSticky) return;
    isSticky = false;
    header.classList.remove('is-sticky', 'is-compact', 'is-hidden');
    spacer.remove();
    spacer.style.height = '0px';
  }

  // ---- IntersectionObserver: watch a 1px sentinel at the top of .carousel
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  Object.assign(sentinel.style, { position: 'absolute', inset: '0 auto auto 0', width: '1px', height: '1px' });

  // Ensure .carousel is positioned so the sentinel can be placed at its top-left
  if (getComputedStyle(carousel).position === 'static') {
    carousel.style.position = 'relative';
  }
  carousel.prepend(sentinel);

  const io = new IntersectionObserver((entries) => {
    const e = entries[0];
    // If sentinel is visible, we're still at/above the carousel => not sticky
    if (e.isIntersecting) {
      unstick();
    } else {
      stick();
    }
  }, { root: null, threshold: 0 });

  io.observe(sentinel);

  // ---- Scroll direction: compact/shrink and auto-hide behavior
  const COMPACT_AFTER = 80; // px after sticky to shrink/collapse top band
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (!isSticky) {
      lastScrollY = y;
      return;
    }

    // Shrink after a small distance
    const shouldCompact = y > COMPACT_AFTER;
    header.classList.toggle('is-compact', shouldCompact);
    lastScrollY = y;
    updateSpacer();
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  // Keep spacer in sync if header resizes (brand image loads, responsive changes, etc.)
  const ro = new ResizeObserver(updateSpacer);
  ro.observe(header);

  // Edge case: orientation changes / font loading
  window.addEventListener('orientationchange', () => setTimeout(updateSpacer, 250));

  // If the header was hidden and user focuses (e.g., tabs to the page), reveal it
  document.addEventListener('focusin', () => {
    if (isSticky && header.classList.contains('is-hidden')) {
      header.classList.remove('is-hidden');
    }
  });
} 

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const topNav = document.createElement('div');
  topNav.classList.add('nav-top'); 
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['topnav','brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) {
      section.classList.add(`nav-${c}`);
    } 
    
  });
  const navTop = nav.querySelector('.nav-topnav');
  topNav.innerHTML = navTop.innerHTML;
  navTop?.remove();
  topNav.querySelector('.button-wrapper').classList.add('nav-top__email');
  topNav.querySelector('.nav-top__email').classList.remove('button-wrapper');
  updateTopNav(topNav);
  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(topNav);
  navWrapper.append(nav);
  block.append(navWrapper);
  decorateStickyBehaviour(block);
}
