<script>
  import { onMount } from 'svelte';
  import logo from "$lib/assets/logo.png";
  import _3dlogo from "$lib/assets/3dlogo.png";
  import { Handshake, Globe2, Briefcase, Globe } from 'lucide-svelte';
  import { MapPin, Clock, ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-svelte';

  // ── Server data ──────────────────────────────────────────────────────────────
  /** @type {import('./$types').PageData} */
  export let data;

  const ICON_MAP = { Handshake, Globe2, Briefcase, Globe };

  // Map iconKey strings → Lucide components (can't cross server boundary as components)
  $: AVENUES = (data.AVENUES ?? []).map(a => ({ ...a, icon: ICON_MAP[a.iconKey] ?? null }));
  $: PROJECTS    = data.PROJECTS    ?? [];
  $: STATS       = data.STATS       ?? [];
  $: EVENTS      = data.EVENTS      ?? [];
  $: FOOTER_COLS = data.FOOTER_COLS ?? [];

  // ── Constants ────────────────────────────────────────────────────────────────
  const PRIMARY  = '#E8175D';
  const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Projects', href: '#Projects' },
    { label: 'Events', href: '#Events' },
    { label: 'Blog', href: '/' },
    { label: 'Join Us', href: '/join' }
  ];

  const SOCIAL_ICONS = [
    { label: 'Instagram', link: '/', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
    { label: 'LinkedIn',   link: '/', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    { label: 'TikTok',     link: '/', path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
    { label: 'Facebook',   link: '/', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { label: 'X',          link: '/', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  ];

  // ── Reactive state ────────────────────────────────────────────────────────────
  let scrolled = false;
  let menuOpen = false;
  let gear     = false;
  let selectedEventIndex = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let aboutTeamImages = [];
  let activeAboutTeamImageIndex = 0;
  let aboutTeamSwipeStartX = 0;
  let aboutTeamSwipeStartY = 0;
  let aboutTeamTimer = null;

  $: activeEvent = selectedEventIndex === null ? null : EVENTS[selectedEventIndex] ?? null;
  $: aboutTeamImages = data.ABOUT_TEAM_IMAGES ?? [];
  $: if (aboutTeamImages.length && activeAboutTeamImageIndex >= aboutTeamImages.length) {
    activeAboutTeamImageIndex = 0;
  }

  // ── Setup carousel timer whenever images load ────────────────────────────
  $: {
    // Clear existing timer
    if (aboutTeamTimer) {
      window.clearInterval(aboutTeamTimer);
      aboutTeamTimer = null;
    }
    
    // Start new timer if we have multiple images
    if (aboutTeamImages.length > 1) {
      aboutTeamTimer = window.setInterval(() => {
        if (aboutTeamImages.length > 0) {
          showNextAboutTeamImage();
        }
      }, 4200);
    }
  }

  const eventPoster = (event) => event?.fileName ? `/${event.fileName}` : '';
  const eventMonth = (event) => event?.date?.split(' ')[0] ?? '';
  const eventDay = (event) => event?.date?.split(' ')[1] ?? '';

  function openEventModal(index) {
    selectedEventIndex = index;
    document.body.style.overflow = 'hidden';
  }

  function closeEventModal() {
    selectedEventIndex = null;
    document.body.style.overflow = '';
  }

  function showPreviousEvent() {
    if (EVENTS.length === 0 || selectedEventIndex === null) return;
    selectedEventIndex = (selectedEventIndex - 1 + EVENTS.length) % EVENTS.length;
  }

  function showNextEvent() {
    if (EVENTS.length === 0 || selectedEventIndex === null) return;
    selectedEventIndex = (selectedEventIndex + 1) % EVENTS.length;
  }

  function handleModalKeydown(event) {
    if (!activeEvent) return;
    if (event.key === 'Escape') closeEventModal();
    if (event.key === 'ArrowLeft') showPreviousEvent();
    if (event.key === 'ArrowRight') showNextEvent();
  }

  function handleTouchStart(event) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  function handleTouchEnd(event) {
    const touch = event.changedTouches[0];
    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;

    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      diffX > 0 ? showPreviousEvent() : showNextEvent();
    }

    touchStartX = 0;
    touchStartY = 0;
  }

  function showPreviousAboutTeamImage() {
    if (aboutTeamImages.length === 0) return;
    activeAboutTeamImageIndex = (activeAboutTeamImageIndex - 1 + aboutTeamImages.length) % aboutTeamImages.length;
  }

  function showNextAboutTeamImage() {
    if (aboutTeamImages.length === 0) return;
    activeAboutTeamImageIndex = (activeAboutTeamImageIndex + 1) % aboutTeamImages.length;
  }

  function handleAboutTeamSwipeStart(event) {
    aboutTeamSwipeStartX = event.clientX;
    aboutTeamSwipeStartY = event.clientY;
  }

  function handleAboutTeamSwipeEnd(event) {
    const diffX = event.clientX - aboutTeamSwipeStartX;
    const diffY = event.clientY - aboutTeamSwipeStartY;

    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      diffX > 0 ? showPreviousAboutTeamImage() : showNextAboutTeamImage();
    }

    aboutTeamSwipeStartX = 0;
    aboutTeamSwipeStartY = 0;
  }

  function getAboutTeamSlideOffset(index) {
    const total = aboutTeamImages.length;
    if (total <= 1) return 0;

    let offset = index - activeAboutTeamImageIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    return offset;
  }

  function shouldLoadAboutTeamImage(index) {
    return Math.abs(getAboutTeamSlideOffset(index)) <= 1;
  }

  onMount(() => {
    const handler = () => { scrolled = window.scrollY > 60; };

    window.addEventListener('scroll', handler);
    return () => {
      window.removeEventListener('scroll', handler);
      if (aboutTeamTimer) window.clearInterval(aboutTeamTimer);
      document.body.style.overflow = '';
    };
  });
</script>

<svelte:head>
  <title>Rotaract Club of Lilongwe — Unite for Good</title>
</svelte:head>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- NAVBAR                                                                      -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<svelte:window on:keydown={handleModalKeydown} />

<nav class="navbar" class:scrolled>
  <div class="navbar-inner">
    <div class="logo-wrap">
      <div class="image-logo"><img src={logo} alt="roteract logo"/></div>
      <div>
        <div class="logo-tagline">UNITE FOR GOOD</div>
        <div class="logo-name">Rotaract Club of Lilongwe</div>
      </div>
    </div>

    <div class="desktop-nav">
      {#each NAV_LINKS as link}<a href={link.href} class="nav-link" class:scrolled>{link.label}</a>{/each}
    </div>

    <a href="/login" class="btn-login mobile-login">Member Login</a>
  
  </div>

</nav>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- HERO                                                                        -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<section class="hero">
  <div class="hero-circle-main"></div>
  <div class="hero-circle-accent"></div>

  <div class="hero-wrapper">
    <div class="hero-content">
      <div class="hero-text-main">
        <div class="hero-text-wrapper">
          <div class="hero-badge">
            <span class="pulse-dot"></span>
            <span class="badge-text">ROTARACT CLUB OF LILONGWE</span>
          </div>
          <div class="hero-headline">
            <div>SERVE.</div>
            <div style="color:{PRIMARY}">FELLOW-</div>
            <div class="headline-row">
              <span>SHIP.</span>
              <span class="headline-cursive">action.</span>
            </div>
          </div>
          <p class="hero-sub">
            Empowering young leaders. Transforming communities in Lilongwe and beyond — under the banner of Rotary International.
          </p>
          <div class="hero-ctas">
            <a href="/projects" class="btn-primary">Explore Projects →</a>
            <a href="/join" class="btn-outline-white">Join the Club</a>
          </div>
          <div class="malawi-pin">
            <span class="malawi-label">Malawi</span>
          </div>
        </div>

        <div class="hero-logo-wrapper">
          <button on:click={() => gear = !gear} class="hero-logo">
            {#if gear}
              <img src={_3dlogo} alt="Rotaract Logo" class="spin-slow"/>
            {:else}
              <img src={logo} alt="Rotaract Logo" class="spin-slow"/>
            {/if}
          </button>
        </div>
      </div>

      <div class="hero-social">
        <span class="follow-label">FOLLOW US</span>
        <div class="social-divider"></div>
        <div class="social-links">
          {#each SOCIAL_ICONS as { label, path,link }}
            <a href="{link}" aria-label={label} class="social-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d={path}/>
              </svg>
            </a>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- STATS BAR                                                                   -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<section class="stats-bar">
  <div class="stats-grid">
    {#if STATS.length === 0}
      <!-- Skeleton: 4 stat placeholders -->
      {#each Array(4) as _}
        <div class="stat-item skeleton-stat">
          <div class="skel skel-stat-value"></div>
          <div class="skel skel-stat-label"></div>
        </div>
      {/each}
    {:else}
      {#each STATS as { value, label }}
        <div class="stat-item">
          <div class="stat-value">{value}</div>
          <div class="stat-label">{label}</div>
        </div>
      {/each}
    {/if}
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- ABOUT                                                                       -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<section id="About" class="about">
  <div class="about-inner">
    <div class="about-text">
      <div class="section-pill">ABOUT US</div>
      <h2 class="about-heading">
        FELLOWSHIP<br/>
        <span style="color:{PRIMARY}">THROUGH</span><br/>
        SERVICE
      </h2>
      <p class="about-body">
        From peri-urban development,health outreach camps, youth mentorship, and vocational skills programmes, we turn youth-led ideas into tangible change — right here in Lilongwe's communities and beyond.
      </p>
      <div class="about-team-carousel-wrap">
        <div
          class="about-team-carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label="Rotaract Club of Lilongwe team photos"
          on:pointerdown={handleAboutTeamSwipeStart}
          on:pointerup={handleAboutTeamSwipeEnd}
          on:pointercancel={() => {
            aboutTeamSwipeStartX = 0;
            aboutTeamSwipeStartY = 0;
          }}
        >
          {#if aboutTeamImages.length}
            {#each aboutTeamImages as image, index}
              {#if shouldLoadAboutTeamImage(index)}
                <img
                  class:active={index === activeAboutTeamImageIndex}
                  src={image.src}
                  alt={image.alt}
                  loading={index === activeAboutTeamImageIndex ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchpriority={index === activeAboutTeamImageIndex ? 'high' : 'low'}
                  style:transform={`translateX(${getAboutTeamSlideOffset(index) * 100}%)`}
                />
              {/if}
            {/each}
          {:else}
            <div class="about-team-carousel-placeholder" aria-hidden="true"></div>
          {/if}
        </div>

        {#if aboutTeamImages.length > 1}
          <div class="about-team-carousel-dots" aria-label="Choose team photo">
            {#each aboutTeamImages as image, index}
              <button
                type="button"
                class:active={index === activeAboutTeamImageIndex}
                aria-label={`Show ${image.alt}`}
                aria-current={index === activeAboutTeamImageIndex ? 'true' : undefined}
                on:click={() => activeAboutTeamImageIndex = index}
              ></button>
            {/each}
          </div>
        {/if}
      </div>
      <div class="about-quote">
        <span>"Turning youth-led ideas into global impact."</span>
      </div>
    </div>

    <div class="about-cards">
      <div class="about-card dark">
        <div class="about-card-value dark">District 9210</div>
        <div class="about-card-label dark">Rotary District covering Malawi, Zambia, Zimbabwe & Mozambique</div>
      </div>
      <div class="about-card">
        <div class="about-card-value">Ages 18–30</div>
        <div class="about-card-label">Young professionals & students united by service and leadership</div>
      </div>
      <div class="about-card">
        <div class="about-card-value">Lilongwe, Malawi</div>
        <div class="about-card-label">Rooted in the capital — reaching communities across the nation</div>
      </div>
      <div class="about-card dark">
        <div class="about-card-value dark">Sponsored by RCL</div>
        <div class="about-card-label dark">Backed by the Rotary Club of Lilongwe — chartered since 1970</div>
      </div>
    </div>

    <div class="about-page-link">
      <a href="/about">Learn More About Rotaract LIlongwe </a>
    </div>


  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- AVENUES OF SERVICE                                                          -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<section class="avenues-section">
  <div class="avenues-container">
    <div class="avenues-header">
      <div>
        <span class="chip">What we do</span>
        <h2 class="avenues-title">
          Four avenues. <br />
          <span class="text-primary">One mission.</span>
        </h2>
      </div>
      <p class="avenues-subtitle">
        Every project we run lives inside one of Rotaract's four avenues of service — the framework that has guided clubs worldwide since 1968.
      </p>
    </div>

    <div class="avenues-grid">
      {#if AVENUES.length === 0}
        <!-- Skeleton: 4 avenue cards -->
        {#each Array(4) as _}
          <div class="avenue-card skeleton-avenue">
            <div class="avenue-card-content">
              <div class="skel skel-avenue-num"></div>
              <div class="skel skel-avenue-icon"></div>
              <div class="skel skel-avenue-title"></div>
              <div class="skel skel-avenue-desc"></div>
              <div class="skel skel-avenue-desc short"></div>
            </div>
          </div>
        {/each}
      {:else}
        {#each AVENUES as item, i}
          <div class="avenue-card">
            <div class="avenue-card-bg"></div>
            <!-- Floating bubbles -->
            <div class="bubble bubble-1"></div>
            <div class="bubble bubble-2"></div>
            <div class="bubble bubble-3"></div>
            <div class="avenue-card-content">
              <span class="avenue-number">0{i + 1}</span>
              <svelte:component this={item.icon} class="avenue-icon" stroke-width={2.2} />
              <h3 class="avenue-title">{item.title}</h3>
              <p class="avenue-desc">{item.desc}</p>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- EVENTS                                                                      -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<section id="Events" class="events-section">
  <div class="events-container">
    <div class="events-header">
      <div>
        <span class="events-chip">Upcoming</span>
        <h2 class="events-title">
          Events & <span class="events-subtitle-accent" style="font-family: cursive; color: var(--orange);">Sessions</span>
        </h2>
      </div>
      <a href="https://www.instagram.com/rotaractlilongwe/" class="events-view-all">View all →</a>
    </div>

    <div class="events-carousel">
      {#if EVENTS.length === 0}
        <!-- Skeleton: 3 event cards -->
        {#each Array(3) as _}
          <article class="event-card skeleton-event">
            <div class="event-card-header">
              <div class="skel skel-event-tag"></div>
              <div class="skel skel-event-date"></div>
            </div>
            <div class="skel skel-event-title"></div>
            <div class="skel skel-event-speaker"></div>
            <div class="event-details">
              <div class="skel skel-event-detail"></div>
              <div class="skel skel-event-detail"></div>
            </div>
          </article>
        {/each}
      {:else}
        {#each EVENTS as e, i}
          <button
            type="button"
            class="event-card"
            style="background-image: url('{eventPoster(e)}'); background-position: center; background-size:contain; background-blend-mode:multiply;"
            aria-label="View poster and details for {e.title}"
            on:click={() => openEventModal(i)}
          >
            <div class="event-card-header">
              <span class="event-tag">{e.tag}</span>
              <div class="event-date">
                <div class="event-day">{eventDay(e)}</div>
                <div class="event-month">{eventMonth(e)}</div>
              </div>
            </div>
            <h3 class="event-title">{e.title}</h3>
            <p class="event-speaker">{e.speaker}</p>
            <div class="event-details">
              <div class="event-detail-item"><Clock color="#fff" class="detail-icon" /> {e.time}</div>
              <div class="event-detail-item"><MapPin color="#fff" class="detail-icon" /> {e.loc}</div>
            </div>
            <span class="event-rsvp-btn">
              View poster <ArrowRight class="rsvp-arrow" />
            </span>
          </button>
        {/each}
      {/if}
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- PROJECTS                                                                    -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
{#if activeEvent}
  <div class="event-modal" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
    <button type="button" class="event-modal-backdrop" aria-label="Close event popup" on:click={closeEventModal}></button>

    <div class="event-modal-shell" role="document" on:touchstart={handleTouchStart} on:touchend={handleTouchEnd}>
      <button type="button" class="event-modal-close" aria-label="Close event popup" on:click={closeEventModal}>
        <X size={22} stroke-width={2.4} />
      </button>

      <div class="event-modal-poster-wrap">
        <img class="event-modal-poster" src={eventPoster(activeEvent)} alt="{activeEvent.title} event poster" />
      </div>

      <div class="event-modal-details-panel">
        <div class="event-modal-meta-row">
          <span class="event-tag">{activeEvent.tag}</span>
          <div class="event-modal-date">
            <div class="event-day">{eventDay(activeEvent)}</div>
            <div class="event-month">{eventMonth(activeEvent)}</div>
          </div>
        </div>

        <h3 id="event-modal-title" class="event-modal-title">{activeEvent.title}</h3>
        <p class="event-modal-speaker">{activeEvent.speaker}</p>

        <div class="event-modal-details">
          <div class="event-modal-detail-item"><Clock class="detail-icon" /> {activeEvent.time}</div>
          <div class="event-modal-detail-item"><MapPin class="detail-icon" /> {activeEvent.loc}</div>
        </div>

        <div class="event-modal-controls">
          <button type="button" class="event-modal-nav" aria-label="Previous event" on:click={showPreviousEvent}>
            <ChevronLeft size={20} stroke-width={2.4} />
          </button>
          <span class="event-modal-count">{selectedEventIndex + 1} / {EVENTS.length}</span>
          <button type="button" class="event-modal-nav" aria-label="Next event" on:click={showNextEvent}>
            <ChevronRight size={20} stroke-width={2.4} />
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<section class="projects">
  <div class="section-inner">
    <div class="section-row-header">
      <div>
        <div class="events-chip" style="color: white;">our impact</div>
        <h2 class="events-title" style="color: white;">
          FEATURED<span class="events-subtitle-accent">PROJECTS</span>
        </h2>
      </div>
    </div>

    <div class="projects-grid">
      {#if PROJECTS.length === 0}
        <!-- Skeleton: 3 project cards -->
        {#each Array(3) as _}
          <div class="project-card skeleton-project">
            <div class="project-image skel-project-img skel"></div>
            <div class="project-text">
              <div class="skel skel-project-badge"></div>
              <div class="skel skel-project-title"></div>
              <div class="skel skel-project-desc"></div>
              <div class="skel skel-project-desc short"></div>
              <div class="skel skel-project-impact"></div>
            </div>
          </div>
        {/each}
      {:else}
        {#each PROJECTS as { name, status, impact, img, desc }}
          <div class="project-card">
            <div class="project-image">
              <img src="{img}" alt="projects">
            </div>
            <div class="project-text">
              <div class="project-status-row">
                <span class="project-badge" class:ongoing={status === 'Ongoing'}>{status}</span>
              </div>
              <h3 class="project-name">{name}</h3>
              <p class="project-desc">{desc}</p>
              <div class="project-impact">{impact}</div>
              <div class="project-impact-label">Impact</div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- JOIN CTA                                                                    -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<section class="join-cta">
  <div class="join-blob-left"></div>
  <div class="join-blob-right"></div>
  <div class="join-inner">
    <div class="cursive-label" style="color:rgba(255,255,255,0.7)">be the change</div>
    <h2 class="join-heading">READY TO MAKE A <span>difference?</span></h2>
    <p class="join-sub">
      Join a movement of young leaders committed to service, fellowship, and positive change in Lilongwe and beyond.
    </p>
    <div class="join-ctas">
      <a href="/join" class="btn-white">Apply to Join →</a>
      <a href="/contact" class="btn-outline-white-ghost">Learn More</a>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- FOOTER                                                                      -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<footer>
  <div class="footer-inner">
    <div class="footer-grid">
      <!-- Brand col -->
      <div class="footer-brand">
        <div class="logo-wrap" style="margin-bottom:16px">
          <div class="image-logo"><img src={logo} alt="roteract logo"></div>
          <div>
            <div class="logo-tagline">UNITE FOR GOOD</div>
            <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:.5px">Rotaract Club of Lilongwe</div>
          </div>
        </div>
        <p class="footer-about">
          Empowering young leaders and transforming communities in Lilongwe, Malawi. Part of Rotary International's global family.
        </p>
        <div class="social-links">
          {#each SOCIAL_ICONS as { label, path, link }}
            <a href={link} aria-label={label} class="social-icon footer-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
                <path d={path}/>
              </svg>
            </a>
          {/each}
        </div>
      </div>

      <!-- Link cols -->
      {#if FOOTER_COLS.length === 0}
        <!-- Skeleton: 3 footer columns -->
        {#each Array(3) as _}
          <div class="footer-col-skeleton">
            <div class="skel skel-footer-heading"></div>
            {#each Array(4) as _}
              <div class="skel skel-footer-link"></div>
            {/each}
          </div>
        {/each}
      {:else}
        {#each FOOTER_COLS as { heading, links }}
          <div>
            <div class="footer-col-heading">{heading}</div>
            {#each links as link}
              <a href="{link}" class="footer-link">{link}</a>
            {/each}
          </div>
        {/each}
      {/if}
    </div>

    <div class="footer-bottom">
      <span class="footer-copy">© 2025 Rotaract Club of Lilongwe. All rights reserved.</span>
      <span class="footer-tagline">UNITE FOR GOOD</span>
    </div>
  </div>
</footer>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- STYLES                                                                      -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<style>
  /* ── Reset & fonts ─────────────────────────────────────────────── */

  /* ── Tokens ────────────────────────────────────────────────────── */

  /* ── Skeleton shimmer ──────────────────────────────────────────── */
  .skel {
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.06) 75%);
    background-size: 600px 100%;
    animation: shimmer 1.6s infinite linear;
  }
  /* Light-background shimmer (stats bar, footer) */
  .stats-bar .skel, footer .skel {
    background: linear-gradient(90deg, rgba(0,0,0,0.07) 25%, rgba(0,0,0,0.13) 50%, rgba(0,0,0,0.07) 75%);
    background-size: 600px 100%;
    animation: shimmer 1.6s infinite linear;
  }

  /* Stats */
  .skel-stat-value  { width: 80px;  height: 36px; margin: 0 auto 8px; }
  .skel-stat-label  { width: 110px; height: 14px; margin: 0 auto; }

  /* Avenues */
  .skel-avenue-num   { width: 28px;  height: 16px; margin-bottom: 12px; }
  .skel-avenue-icon  { width: 40px;  height: 40px; border-radius: 50%; margin-bottom: 16px; }
  .skel-avenue-title { width: 70%;   height: 20px; margin-bottom: 12px; }
  .skel-avenue-desc  { width: 90%;   height: 14px; margin-bottom: 8px; }
  .skel-avenue-desc.short { width: 60%; }

  /* Events */
  .skeleton-event { background: rgba(255,255,255,.06) !important; }
  .skel-event-tag     { width: 70px;  height: 22px; border-radius: 100px; }
  .skel-event-date    { width: 40px;  height: 48px; border-radius: 4px; }
  .skel-event-title   { width: 80%;   height: 22px; margin: 12px 0 8px; }
  .skel-event-speaker { width: 55%;   height: 14px; margin-bottom: 16px; }
  .skel-event-detail  { width: 100px; height: 14px; }

  /* Projects */
  .skel-project-img    { height: 350px; border-radius: 0; }
  .skel-project-badge  { width: 70px;  height: 20px; border-radius: 100px; margin-bottom: 12px; }
  .skel-project-title  { width: 80%;   height: 24px; margin-bottom: 10px; }
  .skel-project-desc   { width: 95%;   height: 13px; margin-bottom: 6px; }
  .skel-project-desc.short { width: 65%; }
  .skel-project-impact { width: 90px;  height: 32px; margin-top: 16px; }

  /* Footer */
  .footer-col-skeleton { display: flex; flex-direction: column; gap: 10px; }
  .skel-footer-heading { width: 100px; height: 16px; margin-bottom: 6px; }
  .skel-footer-link    { width: 120px; height: 13px; }


  /* ── Navbar ────────────────────────────────────────────────────── */
  /* .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
  .hamburger span { display: block; width: 24px; height: 2px; background: white; border-radius: 2px; }
  .navbar.scrolled .hamburger span { background: var(--near-black); }
  .mobile-menu { display: flex; flex-direction: column; gap: 4px; background: white; padding: 16px 5vw 24px; box-shadow: 0 8px 24px rgba(0,0,0,.08); }
  .mobile-link { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 600; color: var(--near-black); text-decoration: none; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,.06); }
  .mobile-link:hover { color: var(--primary); }
  .mobile-login { margin-top: 16px; display: inline-block; } */

  /* ── Hero ──────────────────────────────────────────────────────── */
  .hero { background-image: url("./logo.png"); background-size: cover; background-position: left; background-repeat: no-repeat; min-height: 100vh; position: relative; overflow: hidden; display: flex; align-items: center; background-color: hsl(0, 0%, 8%); background-blend-mode: multiply; }
  .hero-circle-main { position: absolute; right: -50vw; top: 50%; transform: translateY(-110%); width: 65vw; height: 65vw; border-radius: 50%; background: var(--primary); opacity: .2; z-index: 0; }
  .hero-circle-accent { position: absolute; left: 10vw; bottom: -10vw; width: 30vw; height: 30vw; border-radius: 50%; border: 3px solid var(--primary); opacity: .15; z-index: 0; }
  .hero-wrapper { max-width: 1200px; margin: 0 auto; width: 100%; padding: 120px 5vw 80px; position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; }
  .hero-content { flex: 1; }
  .hero-text-main { display: flex; align-items: flex-start; gap: 40px; }
  .hero-text-wrapper { flex: 1; }
  .hero-logo-wrapper { flex: 0 0 auto; display: flex; }
  .hero-logo { flex: 0 0 auto; display: none; position: relative; z-index: 0; padding: 20px 0; }
  .hero-logo img { width: 400px; height: auto; }
  @media (min-width: 1024px) { .hero-logo { display: block; } }
  @media (max-width: 1023px) { .hero-logo { display: block; position: absolute; right: 0; top: 50%; transform: translateY(-50%); z-index: 0; opacity: 0.15; } .hero-logo img { width: 300px; height: auto; } .hero-wrapper { justify-content: flex-start; } }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(232,23,93,.15); border: 1px solid rgba(232,23,93,.4); border-radius: 100px; padding: 6px 16px; margin-bottom: 32px; }
  .pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--primary); display: inline-block; animation: pulse 2s infinite; }
  .badge-text { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 700; color: rgba(255,255,255,.8); letter-spacing: 1.5px; }
  .hero-headline { font-family: 'Anton', sans-serif; font-size: clamp(60px, 9vw, 120px); color: white; line-height: .9; margin-bottom: 28px; }
  .headline-row { display: flex; align-items: baseline; gap: 16px; }
  .headline-cursive { font-family: 'Caveat', cursive; font-size: clamp(44px, 7vw, 90px); color: var(--orange); }
  .hero-sub { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; color: rgba(255,255,255,.7); line-height: 1.7; max-width: 480px; margin-bottom: 40px; }
  .hero-ctas { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 48px; }
  .btn-primary { display: inline-block; background: var(--primary); color: white; padding: 14px 36px; border-radius: 100px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 800; text-decoration: none; letter-spacing: .3px; box-shadow: 0 8px 32px rgba(232,23,93,.4); transition: transform .2s; cursor: pointer; }
  .btn-primary:hover { transform: translateY(-2px); }
  .btn-outline-white { display: inline-block; border: 2px solid rgba(255,255,255,.4); color: white; padding: 14px 36px; border-radius: 100px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; transition: border-color .2s; cursor: pointer; }
  .btn-outline-white:hover { border-color: white; }
  .malawi-pin { display: inline-flex; align-items: center; gap: 8px; }
  .malawi-label { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: rgba(255,255,255,.5); font-weight: 600; letter-spacing: 1px; }
  .hero-social { display: flex; align-items: center; gap: 20px; margin-top: 48px; }
  .follow-label { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10px; font-weight: 700; color: rgba(255,255,255,.4); letter-spacing: 2px; }
  .social-divider { width: 32px; height: 1px; background: rgba(255,255,255,.2); }
  .social-links { display: flex; gap: 12px; }
  .social-icon { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,.08); transition: background .2s; }
  .social-icon:hover { background: var(--primary); }

  /* ── Stats Bar ─────────────────────────────────────────────────── */
  .stats-bar { background: var(--primary); padding: 48px 5vw;background-image: url("https://iksjnarreymddybgpmte.supabase.co/storage/v1/object/public/RAC/RAC/bg.jpg");background-position: center;background-repeat: no-repeat; background-size: cover; background-blend-mode: multiply; }
  .stats-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 32px; }
  .stat-item { text-align: center; }
  .stat-value { font-family: 'Anton', sans-serif; font-size: 48px; color: var(--cream); line-height: 1; margin-bottom: 8px; }
  .stat-label { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 600; color: var(--cream); letter-spacing: 1px; text-transform: uppercase; }
  .skeleton-stat { display: flex; flex-direction: column; align-items: center; }

  /* ── About ─────────────────────────────────────────────────────── */
  .about { background: var(--cream); padding: 100px 5vw; }
  .about-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
  @media (max-width: 900px) { .about-inner { grid-template-columns: 1fr; gap: 48px; } }
  .section-pill { display: inline-block; background: rgba(232,23,93,.1); color: var(--primary); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 100px; letter-spacing: 1.5px; margin-bottom: 24px; }
  .about-heading { font-family: 'Anton', sans-serif; font-size: clamp(44px, 6vw, 80px); color: var(--near-black); line-height: .9; margin-bottom: 32px; }
  .about-body { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; color: rgba(26,26,26,.7); line-height: 1.8; margin-bottom: 20px; }
  .about-team-carousel-wrap { margin: 0 0 28px; }
  .about-team-carousel { position: relative; width: 100%; aspect-ratio: 16 / 10; overflow: hidden; border-radius: 8px; background: rgba(232,23,93,.08); box-shadow: 0 18px 46px rgba(26,26,26,.12); cursor: grab; touch-action: pan-y; user-select: none; }
  .about-team-carousel:active { cursor: grabbing; }
  .about-team-carousel > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .58s ease; will-change: transform; }
  .about-team-carousel > img.active { z-index: 1; }
  .about-team-carousel-dots { display: flex; justify-content: center; align-items: center; gap: 8px; padding-top: 14px; }
  .about-team-carousel-dots button { width: 9px; height: 9px; border-radius: 999px; background: rgba(26,26,26,.22); cursor: pointer; transition: width .2s ease, background .2s ease, transform .2s ease; }
  .about-team-carousel-dots button:hover { background: rgba(232,23,93,.6); transform: translateY(-1px); }
  .about-team-carousel-dots button.active { width: 24px; background: var(--primary); }
  .about-team-carousel-dots button:focus-visible { outline: 3px solid rgba(232,23,93,.35); outline-offset: 3px; }
  .about-team-carousel-placeholder { position: absolute; inset: 0; background: linear-gradient(120deg, rgba(232,23,93,.12), rgba(255,255,255,.55), rgba(232,23,93,.08)); background-size: 220% 100%; animation: about-carousel-loading 1.4s ease-in-out infinite; }
  @keyframes about-carousel-loading {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .about-team-carousel > img,
    .about-team-carousel-dots button,
    .about-team-carousel-placeholder { transition: none; animation: none; }
  }
  .about-quote { margin-top: 32px; padding-left: 20px; border-left: 3px solid var(--primary); }
  .about-quote span { font-family: 'Caveat', cursive; font-size: 22px; color: var(--near-black); }
  .about-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .about-card { background: white; border-radius: 4px; padding: 28px; border: 1px solid rgba(0,0,0,.06); }
  .about-card.dark { background: var(--near-black); }
  .about-card-value { font-family: 'Anton', sans-serif; font-size: 24px; color: var(--primary); margin-bottom: 8px; }
  .about-card-value.dark { color: var(--primary); }
  .about-card-label { font-family: 'Plus Jakarta Sans', sans-serif; font-weight:600; font-size: 13px; color: rgba(0, 0, 0, 0.6); line-height: 1.6; }
  .about-card-label.dark { color: rgba(255,255,255,.5); }
  .about-page-link { margin-top: 12px;}
  .about-page-link a { display: block; width: 100%; align-items: center; justify-content: center; min-height: 48px; padding: 14px 34px; border-radius: 100px; background: var(--primary); color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 800; text-decoration: none; letter-spacing: .3px; box-shadow: 0 0 0 0 rgba(232,23,93,.38); animation: about-link-pulse 2s ease-out infinite; transition: transform .2s ease, box-shadow .2s ease; }
  .about-page-link a:hover { transform: translateY(-2px); box-shadow: 0 12px 34px rgba(232,23,93,.28); }
  .about-page-link a:focus-visible { outline: 3px solid rgba(232,23,93,.35); outline-offset: 4px; }
  @keyframes about-link-pulse {
    0% { box-shadow: 0 0 0 0 rgba(232,23,93,.38); }
    70% { box-shadow: 0 0 0 16px rgba(232,23,93,0); }
    100% { box-shadow: 0 0 0 0 rgba(232,23,93,0); }
  }
  @media (prefers-reduced-motion: reduce) { .about-page-link a { animation: none; } }

  /* ── Avenues ───────────────────────────────────────────────────── */
  .avenues-section { background: var(--near-black); padding: 100px 5vw; }
  .avenues-container { max-width: 1200px; margin: 0 auto; }
  .avenues-header { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: end; margin-bottom: 64px; }
  @media (max-width: 768px) { .avenues-header { grid-template-columns: 1fr; } }
  .chip { display: inline-block; background: rgba(232,23,93,.15); color: var(--primary); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 100px; letter-spacing: 1.5px; margin-bottom: 16px; }
  .avenues-title { font-family: 'Anton', sans-serif; font-size: clamp(36px, 5vw, 64px); color: white; line-height: 1; }
  .text-primary { color: var(--primary); }
  .avenues-subtitle { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; color: rgba(255,255,255,.5); line-height: 1.8; }
  .avenues-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
  .avenue-card { background-color: var(--cream)  ;position: relative; border: 1px solid rgba(255,255,255,.08); border-radius: 4px; overflow: hidden; transition: border-color .3s; }
  .avenue-card:hover { border-color: rgba(232,23,93,.4); }
  .avenue-card-bg { position: absolute; inset: 0; background: rgba(232,23,93,.06); opacity: 0; transition: opacity .3s; }
  .avenue-card:hover .avenue-card-bg { opacity: 1; }
  .avenue-card-content { position: relative; z-index: 1; padding: 36px 28px; }
  .avenue-number { font-family: 'Anton', sans-serif; font-size: 13px; color: rgba(232,23,93,.5); letter-spacing: 2px; display: block; margin-bottom: 20px; }
  .avenue-title { font-family: 'Anton', sans-serif; font-size: 22px; color: var(--primary); margin-bottom: 12px; margin-top: 16px; }
  .avenue-desc { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: var(--near-black) ; line-height: 1.7; }
  :global(.avenue-icon) { color: var(--primary); }
  .skeleton-avenue { background: rgba(255,255,255,.03); }

  /* Floating bubbles animation */
  @keyframes float-up {
    0% { transform: translateY(0px); opacity: 0; }
    15% { opacity: 0.7; }
    85% { opacity: 0.7; }
    100% { transform: translateY(-280px); opacity: 0; }
  }
  @keyframes float-sway {
    0%, 100% { transform: translateX(0px); }
    50% { transform: translateX(8px); }
  }
  @keyframes float-sway-reverse {
    0%, 100% { transform: translateX(0px); }
    50% { transform: translateX(-8px); }
  }
  .bubble {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, var(--primary), rgba(232, 23, 93, 0.6));
    pointer-events: none;
    filter: blur(0.5px);
  }
  .bubble-1 {
    width: 18px;
    height: 18px;
    bottom: 20px;
    left: 15%;
    animation: float-up 3s ease-in infinite, float-sway 2.5s ease-in-out infinite;
  }
  .bubble-2 {
    width: 26px;
    height: 26px;
    bottom: 30px;
    left: 50%;
    top: 10%;
    animation: float-up 4s ease-in infinite 0.5s, float-sway-reverse 3s ease-in-out infinite 0.5s;
  }
  .bubble-3 {
    width: 7px;
    height: 7px;
    bottom: 25px;
    right: 12%;
    top: 50%;
    animation: float-up 3.5s ease-in infinite 1s, float-sway 2.8s ease-in-out infinite 1s;
  }

  /* ── Events ────────────────────────────────────────────────────── */
  .events-section { background: var(--cream); padding: 100px 5vw; }
  .events-container { max-width: 1200px; margin: 0 auto; }
  .events-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 48px; flex-wrap: wrap; gap: 16px; }
  .events-chip { display: inline-block; background: rgba(232,23,93,.1); color: var(--primary); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 100px; letter-spacing: 1.5px; margin-bottom: 12px; }
  .events-title { font-family: 'Anton', sans-serif; font-size: clamp(36px, 5vw, 64px); color: var(--near-black); line-height: 1; }
  .events-subtitle-accent { color: var(--primary); margin-left: 12px; }
  .events-view-all { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700; color: var(--primary); text-decoration: none; }
  .events-carousel { display: flex; gap: 24px; overflow-x: auto; padding-bottom: 16px; scroll-snap-type: x mandatory; }
  .event-card { flex: 0 0 320px; scroll-snap-align: start; background-color: rgba(26,26,26,.78); border: 0; border-radius: 4px; padding: 28px; display: flex; flex-direction: column; min-height: 400px; position: relative; overflow: hidden; text-align: left; cursor: pointer; transition: transform .25s ease, box-shadow .25s ease; }
  .event-card:hover { transform: translateY(-4px); box-shadow: 0 12px 34px rgba(26,26,26,.18); }
  .event-card:focus-visible { outline: 3px solid var(--primary); outline-offset: 4px; }
  .event-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
  .event-tag { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 700; background: rgba(232,23,93,.2); color: var(--primary); padding: 4px 12px; border-radius: 100px; letter-spacing: 1px; }
  .event-date { text-align: right; }
  .event-day { font-family: 'Anton', sans-serif; font-size: 32px; color: white; line-height: 1; }
  .event-month { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; color: rgba(255,255,255,.4); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
  .event-title { font-family: 'Anton', sans-serif; font-size: 22px; color: white; margin-bottom: 8px; line-height: 1.2; flex: 1; }
  .event-speaker { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: rgba(255,255,255,.5); margin-bottom: 20px; }
  .event-details { display: flex; flex-direction: column; gap: 8px; }
  .event-detail-item { display: flex; align-items: center; gap: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: rgba(255,255,255,.6); }
  .event-rsvp-btn { margin-top: 1.25rem; display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #E8175D; background: none; border: none; cursor: pointer; transition: gap 0.2s ease; align-self: flex-start; }
  .event-card:hover .event-rsvp-btn { gap: 0.75rem; }
  .events-carousel::-webkit-scrollbar { height: 8px; }
  .events-carousel::-webkit-scrollbar-track { background: rgb(217, 217, 217, 0.8); border-radius: 4px; }
  .events-carousel::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 4px; }
  .events-carousel::-webkit-scrollbar-thumb:hover { background: #aaa; }

  .event-modal { position: fixed; inset: 0; z-index: 300; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .event-modal-backdrop { position: absolute; inset: 0; width: 100%; height: 100%; background: rgba(0,0,0,.74); backdrop-filter: blur(8px); cursor: pointer; }
  .event-modal-shell { position: relative; z-index: 1; width: min(680px, 100%); max-height: 85vh; overflow-y: auto; background: var(--cream); border-radius: 4px; box-shadow: 0 30px 90px rgba(0,0,0,.42); touch-action: pan-y; }
  .event-modal-close { position: absolute; top: 12px; right: 12px; z-index: 2; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(26,26,26,.86); color: white; cursor: pointer; transition: background .2s ease, transform .2s ease; }
  .event-modal-close:hover { background: var(--primary); transform: translateY(-1px); }
  .event-modal-poster-wrap { background: #111; padding: 18px; display: flex; align-items: center; justify-content: center; min-height: 320px; }
  .event-modal-poster { display: block; max-width: 100%; max-height: min(62vh, 680px); width: auto; height: auto; object-fit: contain; box-shadow: 0 16px 50px rgba(0,0,0,.34); }
  .event-modal-details-panel { padding: 28px; background: var(--cream); }
  .event-modal-meta-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
  .event-modal-date { text-align: right; flex: 0 0 auto; }
  .event-modal-date .event-day { color: var(--near-black); }
  .event-modal-date .event-month { color: rgba(26,26,26,.55); }
  .event-modal-title { font-family: 'Anton', sans-serif; font-size: clamp(28px, 5vw, 44px); color: var(--near-black); line-height: 1.05; margin-bottom: 10px; }
  .event-modal-speaker { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: rgba(26,26,26,.62); margin-bottom: 20px; line-height: 1.6; }
  .event-modal-details { display: grid; gap: 10px; margin-bottom: 24px; }
  .event-modal-detail-item { display: flex; align-items: center; gap: 10px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700; color: rgba(26,26,26,.68); }
  .event-modal-detail-item :global(.detail-icon) { color: var(--primary); width: 18px; height: 18px; }
  .event-modal-controls { border-top: 1px solid rgba(26,26,26,.09); padding-top: 20px; display: flex; align-items: center; justify-content: center; gap: 18px; }
  .event-modal-nav { width: 42px; height: 42px; border-radius: 50%; background: var(--near-black); color: white; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s ease, transform .2s ease; }
  .event-modal-nav:hover { background: var(--primary); transform: translateY(-1px); }
  .event-modal-count { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 800; color: rgba(26,26,26,.52); letter-spacing: 1px; min-width: 56px; text-align: center; }

  /* ── Projects ──────────────────────────────────────────────────── */
  .projects { background: var(--near-black); padding: 10px 5vw 20px 5vw; }
  .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
  .project-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 4px; transition: background .2s, border-color .2s; }
  .project-card:hover { background: rgba(232,23,93,.08); border-color: rgba(232,23,93,.3); }
  .project-image { width: 100%; height: 350px; overflow: hidden; }
  .project-image img { width: 100%; height: 350px; object-fit: cover; object-position: center; }
  .project-status-row { margin-bottom: 12px; }
  .project-badge { background: rgba(232,23,93,.13); color: var(--primary); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; letter-spacing: .8px; }
  .project-badge.ongoing { background: rgba(247,161,58,.13); color: var(--orange); }
  .project-name { font-family: 'Anton', sans-serif; font-size: 22px; color: white; margin-bottom: 10px; line-height: 1.1; }
  .project-text { padding: 10px 15px; }
  .project-desc { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: rgba(255,255,255,.55); line-height: 1.7; margin-bottom: 20px; }
  .project-impact { font-family: 'Anton', sans-serif; font-size: 28px; color: var(--primary); }
  .project-impact-label { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; color: rgba(255,255,255,.35); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }

  /* ── Join CTA ──────────────────────────────────────────────────── */
  .join-cta { background: var(--primary); padding: 100px 5vw; position: relative; overflow: hidden; }
  .join-blob-left { position: absolute; left: -10vw; top: 50%; transform: translateY(-50%); width: 40vw; height: 40vw; border-radius: 50%; background: rgba(255,255,255,.07); }
  .join-blob-right { position: absolute; right: -5vw; bottom: -10vw; width: 30vw; height: 30vw; border-radius: 50%; background: rgba(0,0,0,.1); }
  .join-inner { max-width: 800px; margin: 0 auto; text-align: center; position: relative; z-index: 1; }
  .join-heading { font-family: 'Anton', sans-serif; font-size: clamp(44px, 7vw, 88px); color: white; line-height: .95; margin-bottom: 24px; }
  .join-heading span { font-family: 'Caveat', cursive; color: var(--orange); text-transform: lowercase; }
  .join-sub { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; color: rgba(255,255,255,.8); line-height: 1.7; margin: 0 auto 48px; max-width: 520px; }
  .join-ctas { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
  .btn-white { background: white; color: var(--primary); padding: 16px 44px; border-radius: 100px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 800; text-decoration: none; letter-spacing: .3px; box-shadow: 0 8px 32px rgba(0,0,0,.2); transition: transform .2s; }
  .btn-white:hover { transform: translateY(-2px); }
  .btn-outline-white-ghost { border: 2px solid rgba(255,255,255,.5); color: white; padding: 16px 44px; border-radius: 100px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 700; text-decoration: none; }
  .cursive-label { font-family: 'Caveat', cursive; font-size: 22px; margin-bottom: 12px; }

  /* ── Footer ────────────────────────────────────────────────────── */
  footer { background: var(--near-black); padding: 64px 5vw 32px; color: white; }
  .footer-inner { max-width: 1200px; margin: 0 auto; }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 64px; }
  @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 560px) { .footer-grid { grid-template-columns: 1fr; } }
  .footer-about { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: rgba(255,255,255,.5); line-height: 1.8; max-width: 280px; margin-bottom: 24px; }
  .footer-icon svg { fill: rgba(255,255,255,.6); }
  .footer-col-heading { font-family: 'Anton', sans-serif; font-size: 14px; color: white; letter-spacing: 1px; margin-bottom: 20px; }
  .footer-link { display: block; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: rgba(255,255,255,.5); text-decoration: none; margin-bottom: 10px; transition: color .2s; }
  .footer-link:hover { color: var(--primary); }
  .footer-bottom { border-top: 1px solid rgba(255,255,255,.08); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-copy { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: rgba(255,255,255,.3); }
  .footer-tagline { font-family: 'Anton', sans-serif; font-size: 14px; color: var(--primary); letter-spacing: 2px; }

  /* ── Section shared ────────────────────────────────────────────── */
  .section-inner { max-width: 1200px; margin: 0 auto; padding: 60px 0; }
  .section-row-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; flex-wrap: wrap; gap: 16px; }

  @media (max-width: 640px) {
    .event-card { flex-basis: 280px; min-height: 360px; padding: 22px; }
    .event-modal { padding: 12px; }
    .event-modal-shell { width: 100%; max-height: 90vh; }
    .event-modal-poster-wrap { min-height: 200px; padding: 12px; }
    .event-modal-poster { max-height: 45vh; }
    .event-modal-details-panel { padding: 22px; }
    .event-modal-controls { gap: 14px; }
  }
</style>
