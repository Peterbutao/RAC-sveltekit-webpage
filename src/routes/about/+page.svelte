<script>
  import { onMount } from 'svelte';
  import logo from '$lib/assets/logo.png';
  import { ArrowRight, Briefcase, Clock, Globe, Globe2, Handshake, MapPin } from 'lucide-svelte';

  const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Events', href: '/#Events' },
    { label: 'Blog', href: '/' },
    { label: 'Join Us', href: '/join' }
  ];

  const highlights = [
    {
      value: '2015',
      label: 'Chartered',
      text: 'The club was chartered on February 13, 2015 by the Rotary Club of Lilongwe.'
    },
    {
      value: '42',
      label: 'Active members',
      text: 'A growing membership base with 30 inducted and 12 uninducted members.'
    },
    {
      value: '2 weeks',
      label: 'Meeting rhythm',
      text: 'Regular meetings happen every two weeks, supported by fellowships and assemblies.'
    }
  ];

  const fourWayTest = [
    'Is it the truth?',
    'Is it fair to all concerned?',
    'Will it build goodwill and good friendships?',
    'Will it be beneficial to all concerned?'
  ];

  const focusAreas = [
    { title: 'Peace and Conflict Prevention/Resolution', icon: Globe2 },
    { title: 'Disease Prevention and Treatment', icon: Briefcase },
    { title: 'Water and Sanitation', icon: MapPin },
    { title: 'Maternal and Child Health', icon: Handshake },
    { title: 'Basic Education and Literacy', icon: Globe },
    { title: 'Economic and Community Development', icon: Briefcase },
    { title: 'Environment', icon: Globe2 }
  ];

  const rotaryObjects = [
    {
      title: 'Encourage acquaintance',
      text: 'See friendship as a pathway to serve society.'
    },
    {
      title: 'Promote high ethics',
      text: "Recognize the worthiness of all occupations and dignify each person's work as service."
    },
    {
      title: 'Apply service',
      text: "Use service in personal, business, and community life."
    },
    {
      title: 'Advance understanding',
      text: 'Build goodwill and peace through a worldwide fellowship united by service.'
    }
  ];

  const currentLeadership = [
    { role: 'Current President', name: 'Timothy Sikelo', term: '2025/26' },
    { role: 'President Elect', name: 'Menia Chaphamtengo', term: '2026/27' },
    { role: 'President Nominee', name: 'Tadala Tenthani', term: '2027/28' }
  ];

  const boardMembers = [
    ['Secretary', 'Francisco Mijoni'],
    ['Treasurer', 'Prince Mthikira'],
    ['Sergeant At Arms', 'Tapiwa Dube'],
    ['Club Service Committee Director', 'Menia Chaphamtengo'],
    ['Community Service Committee Director', 'Jonathan Mtondo'],
    ['Vice Community Service Committee Director', 'Beatrice Likhwala'],
    ['International Service Director', 'Phillip Juwaoh'],
    ['Professional and Leadership Committee Director', 'Omega Mughogho'],
    ['The Rotary Foundation Committee', 'Tadala Tenthani'],
    ['Public Image Committee', 'Vitumbiko Luhanga'],
    ['Fundraising Committee', 'Wedson Kumwenda']
  ];

  const pastPresidents = [
    ['Chifundo Chilera', 'Charter President, 2015/16'],
    ["Dominic Mang'anda", '2015/16'],
    ['Isabel Kumwembe', '2016/17'],
    ['Mayamiko Tembo', '2017/18'],
    ['Pius Kanyengambeta', '2018/19'],
    ['Mvaiwa Chigaru', '2018/19'],
    ['Helena Mnthinda', '2019/20'],
    ['Mphanda Kabwazi', '2020/21'],
    ['Mike Jambawe', '2022/23'],
    ['Esther Bonyonga', '2023/24'],
    ['Violet Odala', '2024/25']
  ];

  let scrolled = false;

  onMount(() => {
    const handler = () => {
      scrolled = window.scrollY > 60;
    };

    handler();
    window.addEventListener('scroll', handler);

    return () => window.removeEventListener('scroll', handler);
  });
</script>

<svelte:head>
  <title>About RAC Lilongwe - Rotaract Club of Lilongwe</title>
  <meta
    name="description"
    content="Learn about the Rotaract Club of Lilongwe, its Rotary values, leadership, members, and meeting rhythm."
  />
</svelte:head>

<nav class="navbar about-nav" class:scrolled>
  <div class="navbar-inner">
    <div class="logo-wrap">
      <a href="/" class="image-logo"><img src={logo} alt="Rotaract Club of Lilongwe logo" /></a>
      <div>
        <div class="logo-tagline">UNITE FOR GOOD</div>
        <div class="logo-name">Rotaract Club of Lilongwe</div>
      </div>
    </div>

    <div class="desktop-nav">
      {#each NAV_LINKS as link}
        <a href={link.href} class="nav-link" class:active={link.href === '/about'} class:scrolled>{link.label}</a>
      {/each}
    </div>

    <a href="/login" class="btn-login">Member Login</a>
  </div>
</nav>

<main>
  <section class="about-hero">
    <img class="hero-photo" src="/event%20(9).jpg" alt="Rotaract Club of Lilongwe members at a club event" />
    <div class="hero-shade"></div>
    <div class="hero-inner">
      <div class="hero-copy">
        <div class="section-pill dark">ABOUT THE CLUB</div>
        <h1>ROTARACT CLUB<br /><span>OF LILONGWE</span></h1>
        <p>
          A community service organization chartered on February 13, 2015 by the Rotary Club of Lilongwe,
          built around fellowship, leadership, and practical service.
        </p>

      </div>

      <div class="hero-panel">
        <p>rooted the core belief of service above self</p>
      </div>
    </div>
  </section>
  
  <section class="overview-section">
    <div class="overview-inner">
      <div class="overview-copy">
        <div class="section-pill">WHO WE ARE</div>
        <h2>FELLOWSHIP<br /><span>IN ACTION</span></h2>
        <p>
          The Rotaract Club of Lilongwe brings together people who believe service should be practical,
          ethical, and grounded in friendship. As part of the Rotary family, the club creates space for
          members to serve communities, grow as leaders, and build professional relationships that matter.
        </p>
        <p>
          Club life is shaped by regular meetings, fellowships, club assemblies, professional and leadership
          trainings, and bonding sessions agreed upon by the board and members.
        </p>
      </div>
      
      <div class="highlight-grid" aria-label="Club highlights">
        {#each highlights as item}
        <article class="highlight-card">
          <div class="highlight-value">{item.value}</div>
          <h3>{item.label}</h3>
          <p>{item.text}</p>
        </article>
        {/each}
      </div>
    </div>
  </section>

  <section class="principles-section">
    <div class="principles-inner">
      <div class="principles-header">
        <div>
          <div class="section-pill dark">ROTARY VALUES</div>
          <h2>THE 4-WAY<br /><span>TEST</span></h2>
        </div>
        <p>The Four-Way Test guides the things Rotarians and Rotaractors think, say, and do.</p>
      </div>
      
      <div class="test-grid">
        {#each fourWayTest as test, index}
        <article class="test-card">
            <span>0{index + 1}</span>
            <p>{test}</p>
          </article>
          {/each}
        </div>

      <div class="objects-grid">
        {#each rotaryObjects as object}
          <article class="object-card">
            <Handshake class="object-icon" size={28} stroke-width={2.2} />
            <h3>{object.title}</h3>
            <p>{object.text}</p>
          </article>
          {/each}
        </div>
      </div>
  </section>
  
  <section class="focus-section">
    <div class="focus-inner">
      <div class="focus-header">
        <div class="section-pill">AREAS OF FOCUS</div>
        <h2>SEVEN WAYS<br /><span>WE SERVE</span></h2>
      </div>

      <div class="focus-grid">
        {#each focusAreas as area, index}
        <article class="focus-card">
          <div class="focus-icon">
            <svelte:component this={area.icon} size={24} stroke-width={2.2} />
          </div>
            <span>0{index + 1}</span>
            <h3>{area.title}</h3>
          </article>
        {/each}
      </div>
    </div>
  </section>
  
  <section class="leadership-section" id="leadership">
    <div class="leadership-inner">
      <div class="leadership-header">
        <div>
          <div class="section-pill">LEADERSHIP</div>
          <h2>THE PEOPLE<br /><span>STEERING THE CLUB</span></h2>
        </div>
        <p>
          The club is led by elected officers and committee directors who guide service, fellowship,
          administration, public image, and fundraising.
        </p>
      </div>
      
      <div class="current-grid">
        {#each currentLeadership as leader}
        <article class="leader-card">
          <div class="leader-term">{leader.term}</div>
          <h3>{leader.name}</h3>
          <p>{leader.role}</p>
        </article>
        {/each}
      </div>
      
      <div class="leadership-lists">
        <section class="board-panel" aria-labelledby="board-heading">
          <h3 id="board-heading">Board Members</h3>
          <div class="role-list">
            {#each boardMembers as [role, name]}
            <div class="role-row">
              <span>{role}</span>
              <strong>{name}</strong>
            </div>
            {/each}
          </div>
        </section>

        <section class="past-panel" aria-labelledby="past-heading">
          <h3 id="past-heading">Past Presidents</h3>
          <div class="past-list">
            {#each pastPresidents as [name, term]}
            <div class="past-row">
              <strong>{name}</strong>
              <span>{term}</span>
            </div>
            {/each}
          </div>
        </section>
      </div>
    </div>
  </section>
  
  <section class="meetings-section">
    <div class="meetings-inner">
      <div class="meeting-note">
        <Clock size={30} stroke-width={2.2} />
        <div>
          <div class="section-pill dark">CLUB MEETINGS</div>
          <h2>EVERY TWO WEEKS</h2>
          <p>
            Members gather every two weeks for regular meetings, with additional fellowships, club assemblies,
            trainings, and bonding sessions scheduled through the board and club membership.
          </p>
        </div>
      </div>
      <a href="/join" class="btn-white">Apply to join</a>
    </div>
  </section>
</main>
<section class="about-hero">
  <img class="hero-photo" src="/event%20(9).jpg" alt="Rotaract Club of Lilongwe members at a club event" />
  <div class="hero-shade"></div>
  <div class="hero-inner">
    <div class="hero-copy">

      <h1>ROTARACT CLUB<br /><span>OF LILONGWE</span></h1>
 
      <div class="hero-actions">
        <a href="#leadership" class="btn-primary">Meet the leadership <ArrowRight size={16} /></a>
        <a href="/join" class="btn-outline-white">Join the club</a>
      </div>
    </div>

    <div class="hero-panel">
      <img src={logo} alt="" />
      <p>Rooted in Lilongwe. Connected to Rotary's worldwide ideal of service.</p>
    </div>
  </div>
</section>

<footer>
  <div class="footer-inner">
    <div class="footer-brand">
      <div class="logo-wrap">
        <div class="image-logo"><img src={logo} alt="Rotaract Club of Lilongwe logo" /></div>
        <div>
          <div class="logo-tagline">UNITE FOR GOOD</div>
          <div class="logo-name">Rotaract Club of Lilongwe</div>
        </div>
      </div>
      <p class="footer-about">
        Chartered in 2015 and committed to building goodwill, friendship, and service in Lilongwe.
      </p>
    </div>
    <div class="footer-bottom">
      <span class="footer-copy">&copy; 2025 Rotaract Club of Lilongwe. All rights reserved.</span>
      <span class="footer-tagline">UNITE FOR GOOD</span>
    </div>
  </div>
</footer>

<style>
  .about-nav .logo-name {
    color: rgba(255, 255, 255, .85);
  }

  .about-nav.scrolled .logo-name {
    color: var(--near-black);
  }

  .about-hero {
    position: relative;
    min-height: 74vh;
    overflow: hidden;
    background: var(--near-black);
    display: flex;
    align-items: center;
    padding: 120px 5vw 72px;
  }

  .hero-photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .34;
  }

  .hero-shade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(26, 26, 26, .96) 0%, rgba(26, 26, 26, .72) 52%, rgba(26, 26, 26, .35) 100%),
      linear-gradient(0deg, rgba(26, 26, 26, .96) 0%, rgba(26, 26, 26, 0) 45%);
  }

  .hero-inner {
    position: relative;
    z-index: 1;
    width: min(1200px, 100%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) 340px;
    gap: 56px;
    align-items: end;
  }

  .hero-copy {
    max-width: 760px;
  }

  .section-pill {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    background: rgba(232, 23, 93, .1);
    color: var(--primary);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;
    padding: 5px 14px;
    border-radius: 100px;
    margin-bottom: 22px;
    text-transform: uppercase;
  }

  .section-pill.dark {
    background: rgba(232, 23, 93, .18);
    border: 1px solid rgba(232, 23, 93, .42);
  }

  h1,
  h2 {
    font-family: 'Anton', sans-serif;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  h1 {
    color: white;
    font-size: clamp(52px, 8vw, 104px);
    line-height: .9;
    margin-bottom: 28px;
  }

  h1 span,
  h2 span {
    color: var(--primary);
  }

  .hero-copy p {
    max-width: 650px;
    color: rgba(255, 255, 255, .76);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 16px;
    line-height: 1.75;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 36px;
  }

  .btn-primary,
  .btn-outline-white,
  .btn-white {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    padding: 13px 28px;
    border-radius: 100px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 800;
    text-decoration: none;
    transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
  }

  .btn-primary {
    background: var(--primary);
    color: white;
    box-shadow: 0 8px 32px rgba(232, 23, 93, .35);
  }

  .btn-outline-white {
    color: white;
    border: 2px solid rgba(255, 255, 255, .42);
  }

  .btn-white {
    background: white;
    color: var(--primary);
    box-shadow: 0 8px 32px rgba(0, 0, 0, .16);
  }

  .btn-primary:hover,
  .btn-outline-white:hover,
  .btn-white:hover {
    transform: translateY(-2px);
  }

  .btn-outline-white:hover {
    border-color: white;
  }

  .hero-panel {
    background: rgba(255, 255, 255, .08);
    border: 1px solid rgba(255, 255, 255, .16);
    border-radius: 4px;
    padding: 30px;
    color: white;
  }

  .hero-panel img {
    width: 92px;
    height: auto;
    margin-bottom: 28px;
  }

  .hero-panel p {
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: rgba(255, 255, 255, .72);
    line-height: 1.7;
    font-size: 14px;
  }

  .overview-section,
  .focus-section,
  .leadership-section {
    background: var(--cream);
    padding: 96px 5vw;
  }

  .overview-inner,
  .focus-inner,
  .leadership-inner,
  .principles-inner,
  .meetings-inner,
  .footer-inner {
    width: min(1200px, 100%);
    margin: 0 auto;
  }

  .overview-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 72px;
    align-items: start;
  }

  .overview-copy h2,
  .focus-header h2,
  .leadership-header h2,
  .principles-header h2,
  .meeting-note h2 {
    color: var(--near-black);
    font-size: clamp(40px, 6vw, 72px);
    line-height: .95;
    margin-bottom: 28px;
  }

  .overview-copy p,
  .leadership-header p,
  .principles-header p,
  .meeting-note p {
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: rgba(26, 26, 26, .68);
    font-size: 15px;
    line-height: 1.8;
    margin-bottom: 18px;
  }

  .highlight-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .highlight-card,
  .test-card,
  .object-card,
  .focus-card,
  .leader-card,
  .board-panel,
  .past-panel {
    border-radius: 4px;
  }

  .highlight-card {
    background: white;
    border: 1px solid rgba(0, 0, 0, .06);
    padding: 28px;
    min-height: 220px;
  }

  .highlight-value {
    font-family: 'Anton', sans-serif;
    color: var(--primary);
    font-size: 38px;
    line-height: 1;
    margin-bottom: 18px;
  }

  .highlight-card h3,
  .object-card h3,
  .focus-card h3,
  .leader-card h3,
  .board-panel h3,
  .past-panel h3 {
    font-family: 'Anton', sans-serif;
    color: var(--near-black);
    font-size: 22px;
    line-height: 1.1;
    margin-bottom: 10px;
  }

  .highlight-card p,
  .object-card p,
  .leader-card p {
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: rgba(26, 26, 26, .64);
    font-size: 13px;
    line-height: 1.65;
  }

  .principles-section {
    background: var(--near-black);
    padding: 96px 5vw;
  }

  .principles-header,
  .leadership-header {
    display: grid;
    grid-template-columns: 1fr minmax(260px, 440px);
    gap: 48px;
    align-items: end;
    margin-bottom: 48px;
  }

  .principles-header h2,
  .principles-header p {
    color: white;
  }

  .principles-header p {
    color: rgba(255, 255, 255, .6);
  }

  .test-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    margin-bottom: 26px;
  }

  .test-card {
    background: rgba(255, 255, 255, .05);
    border: 1px solid rgba(255, 255, 255, .09);
    padding: 26px;
    min-height: 190px;
  }

  .test-card span,
  .focus-card span {
    display: block;
    color: rgba(232, 23, 93, .7);
    font-family: 'Anton', sans-serif;
    font-size: 14px;
    letter-spacing: 2px;
    margin-bottom: 24px;
  }

  .test-card p {
    font-family: 'Anton', sans-serif;
    color: white;
    font-size: 26px;
    line-height: 1.15;
  }

  .objects-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }

  .object-card {
    background: var(--cream);
    padding: 26px;
    min-height: 220px;
  }

  :global(.object-icon) {
    color: var(--primary);
    margin-bottom: 22px;
  }

  .focus-header {
    text-align: center;
    margin-bottom: 52px;
  }

  .focus-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 14px;
  }

  .focus-card {
    background: white;
    border: 1px solid rgba(0, 0, 0, .06);
    min-height: 210px;
    padding: 24px;
  }

  .focus-icon {
    display: inline-flex;
    color: var(--primary);
    margin-bottom: 20px;
  }

  .focus-card h3 {
    font-size: 19px;
  }

  .leadership-section {
    background: white;
  }

  .current-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    margin-bottom: 26px;
  }

  .leader-card {
    background: var(--near-black);
    padding: 28px;
  }

  .leader-card h3 {
    color: white;
    font-size: 28px;
  }

  .leader-card p {
    color: rgba(255, 255, 255, .55);
    font-weight: 700;
  }

  .leader-term {
    display: inline-flex;
    color: var(--primary);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1px;
    margin-bottom: 22px;
  }

  .leadership-lists {
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: 26px;
  }

  .board-panel,
  .past-panel {
    background: var(--cream);
    padding: 30px;
    border: 1px solid rgba(0, 0, 0, .06);
  }

  .role-list,
  .past-list {
    display: grid;
    gap: 10px;
  }

  .role-row,
  .past-row {
    display: grid;
    gap: 6px;
    padding: 14px 0;
    border-bottom: 1px solid rgba(0, 0, 0, .08);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .role-row {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, .8fr);
    align-items: start;
  }

  .role-row:last-child,
  .past-row:last-child {
    border-bottom: 0;
  }

  .role-row span,
  .past-row span {
    color: rgba(26, 26, 26, .56);
    font-size: 13px;
    line-height: 1.5;
  }

  .role-row strong,
  .past-row strong {
    color: var(--near-black);
    font-size: 13px;
    line-height: 1.5;
  }

  .meetings-section {
    background: var(--primary);
    padding: 76px 5vw;
    color: white;
  }

  .meetings-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 48px;
  }

  .meeting-note {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    max-width: 760px;
  }

  .meeting-note h2,
  .meeting-note p {
    color: white;
  }

  .meeting-note p {
    color: rgba(255, 255, 255, .78);
    margin-bottom: 0;
  }

  footer {
    background: var(--near-black);
    padding: 60px 5vw 34px;
  }

  .footer-brand {
    max-width: 420px;
    margin-bottom: 44px;
  }

  .footer-brand .logo-wrap {
    margin-bottom: 18px;
  }

  .footer-brand .logo-name,
  footer .logo-name {
    color: rgba(255, 255, 255, .72);
  }

  .footer-about {
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: rgba(255, 255, 255, .5);
    font-size: 14px;
    line-height: 1.7;
  }

  .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, .08);
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    gap: 18px;
    flex-wrap: wrap;
  }

  .footer-copy {
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: rgba(255, 255, 255, .34);
    font-size: 12px;
  }

  .footer-tagline {
    font-family: 'Anton', sans-serif;
    color: var(--primary);
    letter-spacing: 2px;
    font-size: 14px;
  }

  @media (max-width: 1120px) {
    .hero-inner,
    .overview-inner,
    .principles-header,
    .leadership-header,
    .leadership-lists {
      grid-template-columns: 1fr;
    }

    .hero-panel {
      max-width: 460px;
    }

    .highlight-grid,
    .current-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .test-grid,
    .objects-grid,
    .focus-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 760px) {
    .about-hero {
      min-height: auto;
      padding: 108px 5vw 64px;
    }

    .hero-inner,
    .overview-inner,
    .principles-header,
    .leadership-header {
      gap: 34px;
    }

    .hero-actions,
    .meetings-inner,
    .meeting-note {
      align-items: stretch;
      flex-direction: column;
    }

    .btn-primary,
    .btn-outline-white,
    .btn-white {
      width: 100%;
    }

    .overview-section,
    .focus-section,
    .leadership-section,
    .principles-section {
      padding: 72px 5vw;
    }

    .highlight-grid,
    .test-grid,
    .objects-grid,
    .focus-grid,
    .current-grid {
      grid-template-columns: 1fr;
    }

    .role-row {
      grid-template-columns: 1fr;
    }

    .hero-panel {
      padding: 24px;
    }
  }
</style>
