<script>
  import { onMount } from 'svelte';
  import logo from "$lib/assets/logo.png";

  /** @type {import('./$types').PageData} */
  export let data;

  $: PROJECTS = data.PROJECTS ?? [];

  let scrolled = false;
  onMount(() => {
    const handler = () => { scrolled = window.scrollY > 60; };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  });
</script>

<svelte:head>
  <title>Projects — Rotaract Club of Lilongwe</title>
</svelte:head>

<!-- NAVBAR -->
<nav class="navbar" class:scrolled>
  <div class="navbar-inner">
    <div class="logo-wrap">
      <a href="/" class="image-logo"><img src={logo} alt="roteract logo"/></a>
      <div>
        <div class="logo-tagline">UNITE FOR GOOD</div>
        <div class="logo-name">Rotaract Club of Lilongwe</div>
      </div>
    </div>

    <div class="desktop-nav">
      <a href="/" class="nav-link" class:scrolled>Home</a>
      <a href="/about" class="nav-link" class:scrolled>About</a>
      <a href="/projects" class="nav-link active" class:scrolled>Projects</a>
      <a href="/#Events" class="nav-link" class:scrolled>Events</a>
      <a href="/" class="nav-link" class:scrolled>Blog</a>
      <a href="/join" class="nav-link" class:scrolled>Join Us</a>
    </div>

    <a href="/login" class="btn-login">Member Login</a>
  </div>
</nav>

<!-- HERO SECTION -->
<section class="projects-hero">
  <div class="hero-blob-1"></div>
  <div class="hero-blob-2"></div>
  <div class="hero-content">
    <div class="hero-badge">OUR IMPACT</div>
    <h1 class="hero-title">
      FEATURED<br/>
      <span class="hero-accent">PROJECTS</span>
    </h1>
    <p class="hero-sub">
      From community development to health outreach, discover how we're transforming lives across Lilongwe through service and action.
    </p>
  </div>
</section>

<!-- PROJECTS GRID -->
<section class="projects-section">
  <div class="projects-container">
    <div class="projects-header">
      <h2 class="section-title">All Projects</h2>
      <p class="section-subtitle">Our ongoing and completed initiatives making a difference in communities</p>
    </div>

    <div class="projects-grid">
      {#if PROJECTS.length === 0}
        <!-- Skeleton loading state -->
        {#each Array(6) as _}
          <div class="project-card skeleton">
            <div class="project-image skel-img"></div>
            <div class="project-content">
              <div class="skel-badge"></div>
              <div class="skel-title"></div>
              <div class="skel-desc"></div>
              <div class="skel-desc short"></div>
              <div class="skel-impact"></div>
            </div>
          </div>
        {/each}
      {:else}
        {#each PROJECTS as { name, status, impact, img, desc }}
          <div class="project-card">
            <div class="project-image">
              <img src="{img}" alt="{name}" />
            </div>
            <div class="project-content">
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

<!-- CTA SECTION -->
<section class="cta-section">
  <div class="cta-content">
    <h2 class="cta-title">Want to Get Involved?</h2>
    <p class="cta-sub">Join us in making a difference. Apply to become a member or volunteer for our upcoming projects.</p>
    <div class="cta-buttons">
      <a href="/join" class="btn-primary">Apply to Join</a>
      <a href="/#Events" class="btn-outline">View Events</a>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-inner">
    <div class="footer-brand">
      <div class="logo-wrap">
        <div class="image-logo"><img src={logo} alt="roteract logo"></div>
        <div>
          <div class="logo-tagline">UNITE FOR GOOD</div>
          <div class="logo-name">Rotaract Club of Lilongwe</div>
        </div>
      </div>
      <p class="footer-about">
        Empowering young leaders and transforming communities in Lilongwe, Malawi. Part of Rotary International's global family.
      </p>
    </div>
    <div class="footer-bottom">
      <span class="footer-copy">© 2025 Rotaract Club of Lilongwe. All rights reserved.</span>
    </div>
  </div>
</footer>

<style>
  /* Reset & fonts */

  /* Skeleton shimmer */
  .skel {
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(0,0,0,0.07) 25%, rgba(0,0,0,0.13) 50%, rgba(0,0,0,0.07) 75%);
    background-size: 600px 100%;
    animation: shimmer 1.6s infinite linear;
  }
  .skel-img { height: 250px; }
  .skel-badge { width: 70px; height: 20px; margin-bottom: 12px; }
  .skel-title { width: 80%; height: 24px; margin-bottom: 10px; }
  .skel-desc { width: 95%; height: 13px; margin-bottom: 6px; }
  .skel-desc.short { width: 65%; }
  .skel-impact { width: 90px; height: 32px; margin-top: 16px; }

  /* Navbar */

  /* Hero */
  .projects-hero {
    background: var(--near-black);
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 120px 5vw 80px;
  }
  .hero-blob-1 {
    position: absolute; right: -20vw; top: -20vw;
    width: 50vw; height: 50vw; border-radius: 50%;
    background: var(--primary); opacity: .15;
    pointer-events: none;
  }
  .hero-blob-2 {
    position: absolute; left: 20vw; bottom: -10vw;
    width: 30vw; height: 30vw; border-radius: 50%;
    border: 3px solid var(--primary); opacity: .1;
    pointer-events: none;
  }
  .hero-content {
    max-width: 800px;
    position: relative; z-index: 1;
    text-align: center;
  }
  .hero-badge {
    display: inline-block;
    background: rgba(232,23,93,.2); border: 1px solid rgba(232,23,93,.4);
    color: var(--primary); font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 2px;
    padding: 6px 16px; border-radius: 100px; margin-bottom: 32px;
  }
  .hero-title {
    font-family: 'Anton', sans-serif;
    font-size: clamp(48px, 8vw, 80px); color: white;
    line-height: .95; margin-bottom: 24px; letter-spacing: -1px;
  }
  .hero-accent { color: var(--primary); }
  .hero-sub {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px;
    color: rgba(255,255,255,.7); line-height: 1.7; max-width: 600px;
    margin: 0 auto;
  }

  /* Projects Section */
  .projects-section {
    padding: 80px 5vw;
    background: var(--cream);
  }
  .projects-container {
    max-width: 1200px; margin: 0 auto;
  }
  .projects-header {
    text-align: center; margin-bottom: 60px;
  }
  .section-title {
    font-family: 'Anton', sans-serif; font-size: 48px;
    color: var(--near-black); margin-bottom: 16px;
  }
  .section-subtitle {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px;
    color: #666; max-width: 600px; margin: 0 auto;
  }
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 32px;
  }
  .project-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,.06);
    transition: transform .3s, box-shadow .3s;
  }
  .project-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0,0,0,.12);
  }
  .project-image {
    height: 250px;
    overflow: hidden;
  }
  .project-image img {
    width: 100%; height: 100%; object-fit: cover;
  }
  .project-content {
    padding: 32px;
  }
  .project-status-row {
    margin-bottom: 16px;
  }
  .project-badge {
    display: inline-block;
    background: rgba(42,157,143,.1); color: #2A9D8F;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px;
    font-weight: 700; padding: 6px 14px; border-radius: 100px;
  }
  .project-badge.ongoing {
    background: rgba(232,23,93,.1); color: var(--primary);
  }
  .project-name {
    font-family: 'Anton', sans-serif; font-size: 24px;
    color: var(--near-black); margin-bottom: 12px; line-height: 1.2;
  }
  .project-desc {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px;
    color: #666; line-height: 1.6; margin-bottom: 20px;
  }
  .project-impact {
    font-family: 'Anton', sans-serif; font-size: 28px;
    color: var(--primary); margin-bottom: 4px;
  }
  .project-impact-label {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px;
    color: #999; font-weight: 600; letter-spacing: .5px;
  }

  /* CTA Section */
  .cta-section {
    background: var(--near-black);
    padding: 80px 5vw;
    text-align: center;
  }
  .cta-content {
    max-width: 600px; margin: 0 auto;
  }
  .cta-title {
    font-family: 'Anton', sans-serif; font-size: 48px;
    color: white; margin-bottom: 16px;
  }
  .cta-sub {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px;
    color: rgba(255,255,255,.7); line-height: 1.7; margin-bottom: 32px;
  }
  .cta-buttons {
    display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
  }
  .btn-primary {
    background: var(--primary); color: white;
    padding: 14px 36px; border-radius: 100px;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px;
    font-weight: 800; text-decoration: none; letter-spacing: .3px;
    box-shadow: 0 8px 32px rgba(232,23,93,.4);
    transition: transform .2s;
  }
  .btn-primary:hover { transform: translateY(-2px); }
  .btn-outline {
    border: 2px solid rgba(255,255,255,.4); color: white;
    padding: 14px 36px; border-radius: 100px;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px;
    font-weight: 700; text-decoration: none;
    transition: border-color .2s;
  }
  .btn-outline:hover { border-color: white; }

  /* Footer */
  footer {
    background: var(--near-black);
    padding: 60px 5vw 40px;
  }
  .footer-inner {
    max-width: 1200px; margin: 0 auto;
  }
  .footer-brand {
    text-align: center; margin-bottom: 40px;
  }
  .footer-brand .logo-wrap {
    justify-content: center; margin-bottom: 20px;
  }
  .footer-about {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px;
    color: rgba(255,255,255,.5); line-height: 1.6;
    max-width: 400px; margin: 0 auto;
  }
  .footer-bottom {
    text-align: center; padding-top: 40px;
    border-top: 1px solid rgba(255,255,255,.1);
  }
  .footer-copy {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px;
    color: rgba(255,255,255,.4);
  }

  @media (max-width: 768px) {
    .projects-grid { grid-template-columns: 1fr; }
    .hero-title { font-size: 36px; }
    .section-title { font-size: 36px; }
  }
</style>
