<script>
  import { enhance } from '$app/forms';
  import logo from "$lib/assets/logo.png";

  /** @type {import('./$types').PageData} */
  export let data;

  /** @type {import('./$types').ActionData} */
  export let form;

  $: errorMessage = form?.message && !form?.success ? form.message : '';
  $: successMessage = form?.success ? form.message : '';
</script>

<svelte:head>
  <title>Apply to Join — Rotaract Club of Lilongwe</title>
</svelte:head>

<!-- NAVBAR -->
<nav class="navbar auth-navbar">
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
    <a href="/login" class="nav-back">← Back to login</a>
  </div>
</nav>

<!-- JOIN APPLICATION PAGE -->
<main class="join-page">
  <!-- Background decoration -->
  <div class="join-blob-1"></div>
  <div class="join-blob-2"></div>

  <div class="join-split">
    <!-- Left panel -->


    <!-- Right panel — form -->
    <div class="join-form-panel">
      <div class="join-card">
        <div class="join-card-header">
          <h2 class="join-title">Apply for Membership</h2>
          <p class="join-subtitle">Fill in your details below to start your application.</p>
        </div>

        {#if !successMessage}
        <form class="join-fields" method="POST" action="?/apply" use:enhance>
          <div class="field-group">
            <label class="field-label" for="full_name">Full Name *</label>
            <input
              id="full_name"
              name="full_name"
              class="field-input"
              type="text"
              placeholder="John Doe"
              required
            />
          </div>

          <div class="field-row">
            <div class="field-group">
              <label class="field-label" for="email">Email Address *</label>
              <input
                id="email"
                name="email"
                class="field-input"
                type="email"
                placeholder="john@example.com"
                required
              />
            </div>
            <div class="field-group">
              <label class="field-label" for="phone">Phone Number *</label>
              <input
                id="phone"
                name="phone"
                class="field-input"
                type="tel"
                placeholder="+265 999 123 456"
                required
              />
            </div>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label class="field-label" for="age">Age *</label>
              <input
                id="age"
                name="age"
                class="field-input"
                type="number"
                placeholder="18+"
                min="18"
                required
              />
            </div>
            <div class="field-group">
              <label class="field-label" for="occupation">Occupation *</label>
              <input
                id="occupation"
                name="occupation"
                class="field-input"
                type="text"
                placeholder="e.g., Engineer, Teacher"
                required
              />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label" for="motivation">Why do you want to join? *</label>
            <textarea
              id="motivation"
              name="motivation"
              class="field-input field-textarea"
              placeholder="Tell us about your motivation to join Rotaract..."
              required
            ></textarea>
          </div>

          <div class="field-group">
            <label class="field-label" for="skills">Skills & Interests (Optional)</label>
            <textarea
              id="skills"
              name="skills"
              class="field-input field-textarea"
              placeholder="e.g., Event planning, fundraising, graphic design..."
            ></textarea>
          </div>

          {#if errorMessage}
            <div class="join-error">{errorMessage}</div>
          {/if}

          <button class="btn-submit" type="submit">Submit Application →</button>
        </form>
        {:else}
        <div class="success-container">
          <div class="success-icon">✓</div>
          <h3 class="success-title">Application Submitted!</h3>
          <p class="success-message">{successMessage}</p>
          <a href="/" class="btn-back">Back to Home</a>
        </div>
        {/if}

        <div class="join-footer-text">
          Already a member? <a href="/login" class="join-login-link">Sign in here</a>
        </div>
      </div>
    </div>

    <div class="join-brand">
      <div class="brand-inner">
        <h1 class="brand-headline">BECOME A<br/><span class="brand-pink">CHANGEMAKER</span></h1>
        <p class="brand-sub">
          Join a community of young professionals dedicated to service, leadership, and professional development. Make a difference in Lilongwe and beyond.
        </p>
        
        <div class="benefits-list">
          <div class="benefit-item">
            <span class="benefit-icon">🌍</span>
            <div>
              <p class="benefit-title">Community Service</p>
              <p class="benefit-desc">Impact local communities through meaningful projects</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">💼</span>
            <div>
              <p class="benefit-title">Professional Growth</p>
              <p class="benefit-desc">Develop leadership and career skills</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">🤝</span>
            <div>
              <p class="benefit-title">Network</p>
              <p class="benefit-desc">Connect with like-minded young professionals</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</main>

<style>
  /* Reset & tokens */

  /* Navbar */
  /* Join page */
  .join-page {
    min-height: 100vh; background: white;
    position: relative; overflow: hidden;
  }
  .join-blob-1 {
    position: absolute; right: -15vw; top: -15vw;
    width: 45vw; height: 45vw; border-radius: 50%;
    background: var(--primary); opacity: .06;
    pointer-events: none;
  }
  .join-blob-2 {
    position: absolute; left: 30vw; bottom: -10vw;
    width: 25vw; height: 25vw; border-radius: 50%;
    border: 3px solid var(--primary); opacity: .08;
    pointer-events: none;
  }

  .join-split {
    display: flex; min-height: 100vh;
  }

  /* Brand panel */
  .join-brand {
    flex: 1; background: var(--near-black);
    display: flex; align-items: center; justify-content: center;
    padding: 80px 5vw 80px 6vw;
    position: relative; overflow: hidden;
  }
  .join-brand::before {
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
    padding: 5px 14px; border-radius: 100px; margin-bottom: 32px;
  }
  .brand-headline {
    font-family: 'Anton', sans-serif;
    font-size: clamp(40px, 5vw, 68px); color: white;
    line-height: .95; margin-bottom: 24px; letter-spacing: -1px;
  }
  .brand-pink { color: var(--primary); }
  .brand-sub {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px;
    color: rgba(255,255,255,.55); line-height: 1.75; margin-bottom: 48px;
  }

  .benefits-list { display: flex; flex-direction: column; gap: 24px; }
  .benefit-item { display: flex; align-items: flex-start; gap: 16px; }
  .benefit-icon {
    font-size: 24px; flex-shrink: 0;
    width: 48px; height: 48px; border-radius: 12px;
    background: rgba(232,23,93,.1); color: var(--primary);
    display: flex; align-items: center; justify-content: center;
  }
  .benefit-title {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px;
    font-weight: 700; color: white; margin-bottom: 4px;
  }
  .benefit-desc {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px;
    color: rgba(255,255,255,.5); line-height: 1.5;
  }

  /* Form panel */
  .join-form-panel {
    flex: 0 0 520px;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    background: white;
  }
  .join-card { width: 100%; max-width: 400px; }
  .join-card-header { margin-bottom: 36px; }
  .join-title {
    font-family: 'Anton', sans-serif; font-size: 32px; color: var(--near-black);
    letter-spacing: -.5px; margin-bottom: 8px;
  }
  .join-subtitle {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: #999;
  }

  .join-fields { display: flex; flex-direction: column; gap: 20px; }
  .field-row { display: flex; gap: 16px; }
  .field-row .field-group { flex: 1; }
  .field-group { display: flex; flex-direction: column; gap: 8px; }
  .field-label {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px;
    font-weight: 700; color: var(--near-black); letter-spacing: .2px;
  }
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
  .field-textarea {
    min-height: 100px; resize: vertical;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .join-error {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px;
    color: #c0392b; background: #fdf0f0; border: 1px solid #f5c6cb;
    padding: 10px 14px; border-radius: 10px; font-weight: 600;
  }

  .btn-submit {
    width: 100%; background: var(--primary); color: white;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 800;
    padding: 15px; border: none; border-radius: 12px; cursor: pointer;
    letter-spacing: .3px; transition: transform .2s, box-shadow .2s;
    box-shadow: 0 6px 24px rgba(232,23,93,.3);
  }
  .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(232,23,93,.4); }

  .success-container {
    text-align: center; padding: 40px 20px;
  }
  .success-icon {
    width: 80px; height: 80px; border-radius: 50%;
    background: #2A9D8F; color: white;
    font-size: 40px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px;
  }
  .success-title {
    font-family: 'Anton', sans-serif; font-size: 28px;
    color: var(--near-black); margin-bottom: 12px;
  }
  .success-message {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px;
    color: #666; line-height: 1.6; margin-bottom: 32px;
  }
  .btn-back {
    display: inline-block; background: var(--near-black); color: white;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700;
    padding: 12px 24px; border-radius: 12px; text-decoration: none;
    transition: background .2s;
  }
  .btn-back:hover { background: var(--primary); }

  .join-footer-text {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px;
    color: #999; text-align: center; margin-top: 32px;
  }
  .join-login-link { color: var(--primary); font-weight: 700; text-decoration: none; }
  .join-login-link:hover { text-decoration: underline; }

  @media (max-width: 960px) {
    .join-split { flex-direction: column; }
    .join-brand { padding: 100px 8vw 60px; }
    .join-form-panel { flex: none; padding: 48px 8vw 80px; }
    .field-row { flex-direction: column; gap: 20px; }
  }
</style>
