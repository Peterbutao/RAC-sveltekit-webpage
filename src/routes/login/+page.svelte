<script>
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import logo from "$lib/assets/logo.png";
  import { getRacNumberFromUser } from '$lib/auth/rac.js';

  /** @type {import('./$types').PageData} */
  export let data;

  /** @type {import('./$types').ActionData} */
  export let form;

  // ── Design tokens (mirror main site) ──────────────────────────────────────
  const PRIMARY      = '#E8175D';
  const DARK_MAGENTA = '#8B1045';
  const NEAR_BLACK   = '#1A1A1A';
  const DUES_COLOR = { clear: '#2A9D8F', partial: PRIMARY, overdue: '#c0392b' };

  // ── View state ─────────────────────────────────────────────────────────────
  $: view = data.session ? 'dashboard' : 'login';
  let authMode = 'login'; // 'login' | 'reset'
  let racNumber = '';
  let password = '';
  let greeting = '';

  $: loginError = form?.message && !form?.success ? form.message : data.authError ?? '';
  $: successMessage = form?.success ? form.message : '';

  $: memberRacId = getRacNumberFromUser(data.user);
  $: memberFullName = data.memberData?.full_name ?? data.user?.user_metadata?.full_name ?? 'Member';
  $: displayName = memberFullName;
  $: avatarInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  function formatMemberSince(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }

  function percent(part, total) {
    if (!total || total <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((part / total) * 100)));
  }

  function formatLabel(value, fallback = 'N/A') {
    if (!value) return fallback;
    return String(value)
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  // ── Member data from database and sheets ───────────────────────────────────
  $: dashboard = data.dashboardData ?? {};
  $: MEMBER = {
    name:        memberFullName,
    memberId:    data.memberData?.rac_number ?? memberRacId ?? 'N/A',
    role:        dashboard.role ?? 'Member',
    avatar:      avatarInitials,
    memberSince: formatMemberSince(data.memberData?.created_at),
    status:      data.memberData?.status ?? 'active',
    dues:        dashboard.dues,
    committees:  dashboard.committees ?? [],
    skills:      dashboard.skills ?? [],
    attendance:  dashboard.attendance,
    volunteer:   dashboard.volunteer,
    points:      dashboard.points,
  };

  $: DASHBOARD_EVENTS = dashboard.events ?? [];
  $: ANNOUNCEMENTS = dashboard.announcements ?? [];
  $: ACTIVITY = dashboard.activity ?? [];

  // ── Computed ───────────────────────────────────────────────────────────────
  $: duesOwed     = MEMBER.dues ? Math.max(0, MEMBER.dues.annual - MEMBER.dues.paid) : 0;
  $: duesPct      = MEMBER.dues ? percent(MEMBER.dues.paid, MEMBER.dues.annual) : 0;
  $: attendPct    = MEMBER.attendance ? percent(MEMBER.attendance.attended, MEMBER.attendance.total) : 0;
  $: volunteerPct = MEMBER.volunteer ? percent(MEMBER.volunteer.hours, MEMBER.volunteer.target) : 0;
  $: duesStatusColor = MEMBER.dues ? (DUES_COLOR[MEMBER.dues.status] ?? PRIMARY) : PRIMARY;

  let scrolled = false;
  onMount(() => {
    const hour = new Date().getHours();
    greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const h = () => { scrolled = window.scrollY > 60; };
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  });

  $: if (form?.mode) authMode = form.mode;
</script>

<svelte:head>
  <title>Member Portal — Rotaract Club of Lilongwe</title>
</svelte:head>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- NAVBAR                                                                      -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<nav class="navbar auth-navbar" class:scrolled>
  <div class="navbar-inner">
    <div class="logo-wrap">
      <div class="logo-gear">
        <a href="/" class="logo-image" style="width: 40px;">
          <img src="{logo}" alt="logo" style="width: 100%;">
        </a>
      </div>
      <div>
        <div class="logo-tagline">UNITE FOR GOOD</div>
        <div class="logo-name">Rotaract Club of Lilongwe</div>
      </div>
    </div>
    {#if view === 'dashboard'}
      <div class="nav-member-chip">
        <a href="/profile" class="nav-profile">👤 Profile</a>
        <form method="POST" action="?/logout" use:enhance>
          <button type="submit" class="nav-logout">Sign out</button>
        </form>
      </div>
    {:else}
      <a href="/" class="nav-back">← Back to site</a>
    {/if}
  </div>
</nav>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- LOGIN PAGE                                                                  -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
{#if view === 'login'}
<main class="login-page">
  <!-- Background decoration -->
  <div class="login-blob-1"></div>
  <div class="login-blob-2"></div>

  <div class="login-split">
    <!-- Left panel -->
    <div class="login-brand">
      <div class="brand-inner">
        <!-- <h1 class="brand-headline">YOUR IMPACT<br/><span class="brand-pink">STARTS HERE.</span></h1> -->
      </div>
    </div>

    <!-- Right panel — form -->
    <div class="login-form-panel">
      <div class="login-card">
        <div class="login-card-header">
          <h2 class="login-title">
            {#if authMode === 'reset'}Reset password{:else}Member Login{/if}
          </h2>
          <p class="login-subtitle">
            {#if authMode === 'reset'}
              Enter your RAC member number to request a password reset.
            {:else}
              Sign in with your RAC member number and password.
            {/if}
          </p>
        </div>

        {#if authMode === 'login'}
        <form class="login-fields" method="POST" action="?/login" use:enhance>
          <div class="field-group">
            <label class="field-label" for="rac_number">RAC member number</label>
            <input
              id="rac_number"
              name="rac_number"
              class="field-input field-input-mono"
              type="text"
              placeholder="RAC Number"
              bind:value={racNumber}
              autocapitalize="characters"
              autocomplete="username"
              required
            />
          </div>

          <div class="field-group">
            <div class="field-label-row">
              <label class="field-label" for="password">Password</label>
              <button type="button" class="forgot-link" on:click={() => authMode = 'reset'}>Forgot password?</button>
            </div>
            <input
              id="password"
              name="password"
              class="field-input"
              type="password"
              placeholder="••••••••"
              bind:value={password}
              required
            />
          </div>

          {#if loginError}
            <div class="login-error">{loginError}</div>
          {/if}

          {#if successMessage}
            <div class="login-success">{successMessage}</div>
          {/if}

          <button class="btn-signin" type="submit">
            Sign In →
          </button>

        </form>
        {:else}
        <form class="login-fields" method="POST" action="?/resetPassword" use:enhance>
          <div class="field-group">
            <label class="field-label" for="reset-rac">RAC member number</label>
            <input id="reset-rac" name="rac_number" class="field-input field-input-mono" type="text" placeholder="RAC001026" autocapitalize="characters" required />
            <p class="field-hint">A reset link is sent if your account exists. Otherwise contact the club secretary.</p>
          </div>
          {#if loginError}<div class="login-error">{loginError}</div>{/if}
          {#if successMessage}<div class="login-success">{successMessage}</div>{/if}
          <button class="btn-signin" type="submit">Send Reset Link →</button>
          <button type="button" class="btn-secondary" on:click={() => authMode = 'login'}>Back to sign in</button>
        </form>
        {/if}

        {#if authMode === 'login'}
        <div class="login-footer-text">
          Not a member yet?
          <a href="/join" class="login-join-link">Apply to Join</a>
        </div>
        {/if}
      </div>
    </div>
  </div>
</main>
{/if}

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- DASHBOARD                                                                   -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
{#if view === 'dashboard'}
<main class="dashboard">

  <!-- ── Welcome strip ──────────────────────────────────────────────── -->
  <section class="welcome-strip">
    <div class="welcome-inner">
      <div class="welcome-left">
        <div class="welcome-avatar">{avatarInitials}</div>
        <div>
          <p class="welcome-greeting">{greeting}, <strong>{displayName.split(' ')[0]}</strong> &#128075;</p>
          <p class="welcome-sub">{MEMBER.role} - {MEMBER.memberId}</p>
        </div>
      </div>
      <div class="welcome-points-chip">
        <span class="points-val">{MEMBER.points ?? '--'}</span>
        <span class="points-label">Member Points</span>
      </div>    
    </div>
  </section>

  <div class="dash-body">

    <!-- ── KPI row ────────────────────────────────────────────────────── -->
    <div class="kpi-row">

      <!-- Dues card -->
      <div class="kpi-card dues-card">
        <div class="kpi-top">
          <div class="kpi-icon" style="background:rgba(232,23,93,.1);color:{PRIMARY}">💳</div>
          <div>
            <p class="kpi-label">Membership Dues</p>
            <p class="kpi-value" style="color:{duesStatusColor}">
              {#if MEMBER.dues}
                {MEMBER.dues.currency} {duesOwed.toLocaleString()} <span class="kpi-sub-label">outstanding</span>
              {:else}
                Not recorded
              {/if}
            </p>
          </div>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:{duesPct}%;background:{duesStatusColor}"></div>
        </div>
        <div class="kpi-footer-row">
          <span class="kpi-footer-text">
            {#if MEMBER.dues}
              {duesPct}% paid - {MEMBER.dues.currency} {MEMBER.dues.paid.toLocaleString()} of {MEMBER.dues.annual.toLocaleString()}
            {:else}
              No dues balance available
            {/if}
          </span>
          <span class="kpi-footer-text" style="color:{duesStatusColor}">{MEMBER.dues ? `Due ${MEMBER.dues.nextDue}` : 'Dues data has not been published yet'}</span>
        </div>
        {#if MEMBER.dues}
          <button class="btn-pay">Pay Now →</button>
        {/if}
      </div>

      <!-- Attendance -->
      <div class="kpi-card">
        <div class="kpi-top">
          <div class="kpi-icon" style="background:rgba(42,157,143,.1);color:#2A9D8F">📋</div>
          <div>
            <p class="kpi-label">Meeting Attendance</p>
            <p class="kpi-value" style="color:#2A9D8F">
              {#if MEMBER.attendance}
                {MEMBER.attendance.attended}/{MEMBER.attendance.total}
              {:else}
                Not recorded
              {/if}
            </p>
          </div>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:{attendPct}%;background:#2A9D8F"></div>
        </div>
        <p class="kpi-footer-text">
          {#if MEMBER.attendance}
            {attendPct}% attendance rate this year
          {:else}
            Attendance data has not been published yet
          {/if}
        </p>
      </div>

      <!-- Volunteer hours -->
      <div class="kpi-card">
        <div class="kpi-top">
          <div class="kpi-icon" style="background:rgba(139,16,69,.1);color:{DARK_MAGENTA}">⏱</div>
          <div>
            <p class="kpi-label">Volunteer Hours</p>
            <p class="kpi-value" style="color:{DARK_MAGENTA}">
              {#if MEMBER.volunteer}
                {MEMBER.volunteer.hours} hrs
              {:else}
                Not recorded
              {/if}
            </p>
          </div>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:{volunteerPct}%;background:{DARK_MAGENTA}"></div>
        </div>
        <p class="kpi-footer-text">
          {#if MEMBER.volunteer}
            {volunteerPct}% of {MEMBER.volunteer.target}hr annual goal
          {:else}
            Volunteer hours have not been published yet
          {/if}
        </p>
      </div>

      <!-- Member since -->
      <div class="kpi-card kpi-card-mini">
        <div class="kpi-icon-lg">🎓</div>
        <p class="kpi-label" style="margin-top:8px">Member Since</p>
        <p class="kpi-value" style="color:{NEAR_BLACK};font-size:18px">{MEMBER.memberSince}</p>
        <div class="member-badge-chip">{formatLabel(MEMBER.status, 'Member')}</div>
      </div>

    </div>

    <!-- ── Main grid ──────────────────────────────────────────────────── -->
    <div class="dash-grid">

      <!-- Left column -->
      <div class="dash-col-left">

        <!-- Committees -->
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">My Committees</h3>
            <span class="dash-card-count">{MEMBER.committees.length} active</span>
          </div>
          <div class="committees-list">
            {#if MEMBER.committees.length}
              {#each MEMBER.committees as { name, role, icon, color }}
                <div class="committee-row">
                  <div class="committee-icon" style="background:{color}18;color:{color}">{icon}</div>
                  <div class="committee-info">
                    <p class="committee-name">{name}</p>
                    <p class="committee-role" style="color:{color}">{role}</p>
                  </div>
                  <span class="committee-link">Assigned</span>
                </div>
              {/each}
            {:else}
              <div class="empty-state">Committee assignments are not available yet.</div>
            {/if}
          </div>
        </div>

        <!-- Skills -->
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">Skills Profile</h3>
            <span class="dash-card-count">{MEMBER.skills.length} listed</span>
          </div>
          <div class="skills-list">
            {#if MEMBER.skills.length}
              {#each MEMBER.skills as { label, level }}
                <div class="skill-row">
                  <div class="skill-label-row">
                    <span class="skill-label">{label}</span>
                    <span class="skill-pct">{typeof level === 'number' ? `${level}%` : 'From application'}</span>
                  </div>
                  {#if typeof level === 'number'}
                    <div class="progress-track">
                      <div class="progress-fill" style="width:{level}%;background:{level >= 80 ? PRIMARY : level >= 60 ? DARK_MAGENTA : '#999'}"></div>
                    </div>
                  {/if}
                </div>
              {/each}
            {:else}
              <div class="empty-state">No skills were found for this member yet.</div>
            {/if}
          </div>
        </div>

      </div>

      <!-- Right column -->
      <div class="dash-col-right">

        <!-- Announcements -->
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">Announcements</h3>
            <span class="notif-dot"></span>
          </div>
          <div class="announcements-list">
            {#if ANNOUNCEMENTS.length}
              {#each ANNOUNCEMENTS as { title, body, time, icon, urgent }}
                <div class="announcement-row" class:urgent>
                  <div class="ann-icon">{icon}</div>
                  <div class="ann-body">
                    <p class="ann-title">{title}</p>
                    <p class="ann-text">{body}</p>
                    <p class="ann-time">{time}</p>
                  </div>
                </div>
              {/each}
            {:else}
              <div class="empty-state">No club announcements are available right now.</div>
            {/if}
          </div>
        </div>

        <!-- Upcoming events -->
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">Upcoming Events</h3>
            <a href="/" class="dash-card-link">View all</a>
          </div>
          <div class="events-list">
            {#if DASHBOARD_EVENTS.length}
              {#each DASHBOARD_EVENTS as { name, date, location, type, rsvp }}
                <div class="event-row">
                  <div class="event-type-dot" style="background:{type === 'flagship' ? PRIMARY : type === 'ceremony' ? DARK_MAGENTA : type === 'summit' ? '#F7A13A' : '#2A9D8F'}"></div>
                  <div class="event-info">
                    <p class="event-name">{name}</p>
                    <p class="event-meta-text">{date}{location ? ` - ${location}` : ''}</p>
                  </div>
                  {#if rsvp}
                    <span class="rsvp-chip">RSVP'd</span>
                  {:else}
                    <span class="event-tag-chip">{type}</span>
                  {/if}
                </div>
              {/each}
            {:else}
              <div class="empty-state">No upcoming events were found in the events sheet.</div>
            {/if}
          </div>
        </div>

        <!-- Recent activity -->
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">Recent Activity</h3>
          </div>
          <div class="activity-list">
            {#if ACTIVITY.length}
              {#each ACTIVITY as { label, date, meta }}
                <div class="activity-row">
                  <div class="activity-dot"></div>
                  <div class="activity-info">
                    <p class="activity-label">{label}</p>
                    <p class="activity-date">{meta || 'Project update'}</p>
                  </div>
                  <span class="activity-pts">{date}</span>
                </div>
              {/each}
            {:else}
              <div class="empty-state">No recent project updates were found in the projects sheet.</div>
            {/if}
          </div>
        </div>

      </div>
    </div>
  </div>

</main>
{/if}

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- STYLES                                                                      -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<style>
  /* ── Reset & tokens ──────────────────────────────────────────────── */

  /* ── Navbar ──────────────────────────────────────────────────────── */
  /* ── Login page ──────────────────────────────────────────────────── */
  .login-page {
    min-height: 100vh; background: white;
    position: relative; overflow: hidden;
  }
  .login-blob-1 {
    position: absolute; right: -15vw; top: -15vw;
    width: 45vw; height: 45vw; border-radius: 50%;
    background: var(--primary); opacity: .06;
    pointer-events: none;
  }
  .login-blob-2 {
    position: absolute; left: 30vw; bottom: -10vw;
    width: 25vw; height: 25vw; border-radius: 50%;
    border: 3px solid var(--primary); opacity: .08;
    pointer-events: none;
  }

  .login-split {
    display: flex; min-height: 100vh;
  }

  /* Brand panel */
  .login-brand {
    flex: 1; background:#e8175dc1;
    background-image: url("https://iksjnarreymddybgpmte.supabase.co/storage/v1/object/public/RAC/RAC/bg.jpg");
    background-size: cover;
    background-position: bottom;
    background-blend-mode: multiply;
    display: flex; align-items: start; justify-content: center;
    position: relative; overflow: hidden;
  }
  .login-brand::before {
    content: ''; position: absolute; right: -20%; top: 10%;
    width: 60%; height: 60%; border-radius: 50%;
    background: var(--primary); opacity: .06;
  }
  .brand-inner { max-width: 420px; position: relative; z-index: 1; }
  .brand-badge {
    display: inline-block;
    background: rgba(232,23,93,.15); border: 1px solid rgba(232,23,93,.35);
    color: var(--primary); font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 2px;
    border-radius: 100px; 
  }
  .brand-headline {   
    font-family: 'Anton', sans-serif;
    font-size: clamp(40px, 5vw, 68px); color: white;
    line-height: .95; letter-spacing: -1px;
  }
  .brand-pink { color: var(--primary); }
  .brand-sub {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px;
    color: rgba(255,255,255,.55); line-height: 1.75; margin-bottom: 48px;
  }


  /* Form panel */
  .login-form-panel {
    flex: 0 0 480px;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    background: white;
  }
  .login-card { width: 100%; max-width: 360px; }
  .login-card-header { margin-bottom: 36px; }
  .login-title {
    font-family: 'Anton', sans-serif; font-size: 32px; color: var(--near-black);
    letter-spacing: -.5px; margin-bottom: 8px;
  }
  .login-subtitle {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: #999;
  }

  .login-fields { display: flex; flex-direction: column; gap: 20px; }
  .field-group  { display: flex; flex-direction: column; gap: 8px; }
  .field-label-row { display: flex; justify-content: space-between; align-items: center; }
  .field-label {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px;
    font-weight: 700; color: var(--near-black); letter-spacing: .2px;
  }
  .forgot-link {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px;
    color: var(--primary); text-decoration: none; font-weight: 600;
  }
  .forgot-link:hover { text-decoration: underline; }
  .field-input {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px;
    border: 1.5px solid #E8E8E8; border-radius: 12px;
    padding: 13px 16px; color: var(--near-black); outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .field-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(232,23,93,.1);
  }
  .field-input::placeholder { color: #C0C0C0; }
  .field-input-mono {
    font-family: ui-monospace, 'Cascadia Code', monospace;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .field-hint {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 11px;
    color: #999;
    line-height: 1.5;
    margin-top: 4px;
  }

  .login-error {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px;
    color: #c0392b; background: #fdf0f0; border: 1px solid #f5c6cb;
    padding: 10px 14px; border-radius: 10px; font-weight: 600;
  }
  .login-success {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px;
    color: #1e6f5c; background: #edf8f4; border: 1px solid #b8e6d8;
    padding: 10px 14px; border-radius: 10px; font-weight: 600;
  }
  .btn-secondary {
    width: 100%; background: transparent; color: var(--near-black);
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700;
    padding: 12px; border: 1.5px solid #E8E8E8; border-radius: 12px; cursor: pointer;
    transition: border-color .2s, color .2s;
  }
  .btn-secondary:hover { border-color: var(--primary); color: var(--primary); }
  button.forgot-link, button.login-join-link {
    background: none; border: none; padding: 0; cursor: pointer;
    font-family: inherit; font-size: inherit;
  }

  .btn-signin {
    width: 100%; background: var(--primary); color: white;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 800;
    padding: 15px; border: none; border-radius: 12px; cursor: pointer;
    letter-spacing: .3px; transition: transform .2s, box-shadow .2s;
    box-shadow: 0 6px 24px rgba(232,23,93,.3);
  }
  .btn-signin:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(232,23,93,.4); }

  .login-hint {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px;
    color: #bbb; text-align: center;
  }
  .hint-label { font-weight: 700; color: #ccc; }

  .login-footer-text {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px;
    color: #999; text-align: center; margin-top: 32px;
  }
  .login-join-link { color: var(--primary); font-weight: 700; text-decoration: none; }
  .login-join-link:hover { text-decoration: underline; }

  @media (max-width: 860px) {
    .login-split { flex-direction: column; }
    .login-brand { padding: 100px 8vw 60px; }
    .login-form-panel { flex: none; padding: 48px 8vw 80px; }
  }

  /* ── Dashboard ───────────────────────────────────────────────────── */
  .dashboard { padding-top: 64px; min-height: 100vh; background: #F4F4F6; }

  /* Welcome strip */
  .welcome-strip {
    background: var(--near-black); padding: 28px 5vw;
  }
  .welcome-inner {
    max-width: 1280px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
  }
  .welcome-left { display: flex; align-items: center; gap: 16px; }
  .welcome-avatar {
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--primary); color: white;
    font-size: 16px; font-weight: 800; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .welcome-greeting {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px;
    color: white; font-weight: 500;
  }
  .welcome-greeting strong { font-weight: 800; }
  .welcome-sub {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px;
    color: rgba(255,255,255,.45); margin-top: 2px;
  }
  .welcome-points-chip {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
    padding: 10px 20px; border-radius: 10px;
  }
  .points-icon  { font-size: 18px; }
  .points-val   { font-family: 'Anton', sans-serif; font-size: 22px; color: #F7A13A; }
  .points-label { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; color: rgba(255,255,255,.5); font-weight: 600; }

  /* Body */
  .dash-body {
    max-width: 1280px; margin: 0 auto;
    padding: 28px 5vw 60px;
  }

  /* KPI row */
  .kpi-row {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr .7fr;
    gap: 16px; margin-bottom: 24px;
  }
  @media (max-width: 1100px) { .kpi-row { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 600px)  { .kpi-row { grid-template-columns: 1fr;     } }

  .kpi-card {
    background: white; border-radius: 20px; padding: 22px 24px;
    box-shadow: 0 1px 6px rgba(0,0,0,.06);
  }
  .kpi-card-mini { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .kpi-icon-lg  { font-size: 36px; }

  .kpi-top { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
  .kpi-icon {
    width: 42px; height: 42px; border-radius: 12px;
    font-size: 20px; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .kpi-label {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px;
    font-weight: 700; color: #999; letter-spacing: .8px; text-transform: uppercase; margin-bottom: 4px;
  }
  .kpi-value {
    font-family: 'Anton', sans-serif; font-size: 24px; line-height: 1;
  }
  .kpi-sub-label {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 500; color: #999;
  }

  .progress-track {
    height: 6px; background: #F0F0F0; border-radius: 100px; margin-bottom: 10px; overflow: hidden;
  }
  .progress-fill { height: 100%; border-radius: 100px; transition: width .6s ease; }

  .kpi-footer-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px; margin-bottom: 16px; }
  .kpi-footer-text {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; color: #aaa; font-weight: 600;
  }

  .btn-pay {
    width: 100%; background: var(--primary); color: white;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 800;
    padding: 11px; border: none; border-radius: 10px; cursor: pointer;
    letter-spacing: .3px; transition: opacity .2s;
  }
  .btn-pay:hover { opacity: .88; }

  .member-badge-chip {
    margin-top: 10px; background: rgba(42,157,143,.12); color: #2A9D8F;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 800;
    padding: 4px 14px; border-radius: 100px; letter-spacing: 1px;
  }

  /* Main grid */
  .dash-grid {
    display: grid; grid-template-columns: 1fr 1.15fr; gap: 20px;
  }
  @media (max-width: 960px) { .dash-grid { grid-template-columns: 1fr; } }

  .dash-col-left, .dash-col-right { display: flex; flex-direction: column; gap: 20px; }

  /* Generic dash card */
  .dash-card {
    background: white; border-radius: 20px; padding: 24px;
    box-shadow: 0 1px 6px rgba(0,0,0,.06);
  }
  .dash-card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
  }
  .dash-card-title {
    font-family: 'Anton', sans-serif; font-size: 18px; color: var(--near-black); letter-spacing: .3px;
  }
  .dash-card-count {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px;
    background: #F0F0F0; color: #777; font-weight: 700;
    padding: 3px 10px; border-radius: 100px;
  }
  .dash-card-link {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px;
    color: var(--primary); font-weight: 700; text-decoration: none;
  }
  .dash-card-link:hover { text-decoration: underline; }
  .empty-state {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    line-height: 1.6;
    color: #888;
    background: #FAFAFA;
    border: 1px solid #F0F0F0;
    border-radius: 14px;
    padding: 14px;
  }

  /* Committees */
  .committees-list { display: flex; flex-direction: column; gap: 12px; }
  .committee-row {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 14px; border-radius: 14px; background: #FAFAFA;
    border: 1px solid #F0F0F0; transition: border-color .2s;
  }
  .committee-row:hover { border-color: rgba(232,23,93,.2); }
  .committee-icon {
    width: 40px; height: 40px; border-radius: 12px;
    font-size: 18px; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .committee-info { flex: 1; }
  .committee-name { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700; color: var(--near-black); }
  .committee-role { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 600; margin-top: 1px; }
  .committee-link {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 700;
    color: #ccc; text-decoration: none; transition: color .2s; white-space: nowrap;
  }
  .committee-link:hover { color: var(--primary); }

  /* Skills */
  .skills-list { display: flex; flex-direction: column; gap: 14px; }
  .skill-row { display: flex; flex-direction: column; gap: 6px; }
  .skill-label-row { display: flex; justify-content: space-between; }
  .skill-label { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600; color: var(--near-black); }
  .skill-pct   { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #aaa; font-weight: 600; }

  /* Announcements */
  .notif-dot {
    width: 9px; height: 9px; border-radius: 50%; background: var(--primary);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50%      { opacity: .5; transform: scale(1.3); }
  }
  .announcements-list { display: flex; flex-direction: column; gap: 14px; }
  .announcement-row {
    display: flex; gap: 14px; padding: 14px; border-radius: 14px;
    background: #FAFAFA; border: 1px solid #F0F0F0; transition: border-color .2s;
  }
  .announcement-row.urgent {
    background: rgba(232,23,93,.04); border-color: rgba(232,23,93,.18);
  }
  .ann-icon { font-size: 22px; flex-shrink: 0; line-height: 1.4; }
  .ann-body { flex: 1; }
  .ann-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 800; color: var(--near-black); margin-bottom: 4px; }
  .ann-text  { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #777; line-height: 1.6; margin-bottom: 6px; }
  .ann-time  { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; color: #bbb; font-weight: 600; }

  /* Events list */
  .events-list { display: flex; flex-direction: column; gap: 12px; }
  .event-row {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 14px; border-radius: 14px; background: #FAFAFA;
    border: 1px solid #F0F0F0;
  }
  .event-type-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .event-info { flex: 1; }
  .event-name { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700; color: var(--near-black); margin-bottom: 3px; }
  .event-meta-text { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; color: #aaa; font-weight: 500; }
  .rsvp-chip {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 800;
    background: rgba(42,157,143,.12); color: #2A9D8F;
    padding: 4px 10px; border-radius: 100px; letter-spacing: .5px; white-space: nowrap;
  }
  .event-tag-chip {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 800;
    background: rgba(232,23,93,.08); color: var(--primary);
    padding: 4px 10px; border-radius: 100px; white-space: nowrap;
  }
  /* Activity */
  .activity-list { display: flex; flex-direction: column; }
  .activity-row {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 0; border-bottom: 1px solid #F4F4F4;
  }
  .activity-row:last-child { border-bottom: none; }
  .activity-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--primary); flex-shrink: 0; margin-top: 5px;
  }
  .activity-info { flex: 1; }
  .activity-label { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600; color: var(--near-black); }
  .activity-date  { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; color: #aaa; margin-top: 2px; }
  .activity-pts {
    font-family: 'Anton', sans-serif; font-size: 14px; color: #2A9D8F;
    white-space: nowrap;
  }
</style>
