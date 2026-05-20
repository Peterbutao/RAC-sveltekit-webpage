<script>
  import { page } from '$app/stores';
  import logo from '$lib/assets/logo.png';
  import { AlertTriangle, Home, RefreshCcw, SearchX, ServerCrash } from 'lucide-svelte';

  const ERROR_CONTENT = {
    404: {
      eyebrow: 'Page not found',
      title: 'THIS PAGE TOOK A DETOUR',
      message: 'The page you are looking for may have moved, expired, or never existed.',
      icon: SearchX
    },
    500: {
      eyebrow: 'Server error',
      title: 'SOMETHING WENT OFFLINE',
      message: 'We could not load this page right now. Please try again in a moment.',
      icon: ServerCrash
    }
  };

  $: status = $page.status ?? 500;
  $: fallbackContent = {
    eyebrow: 'Unexpected error',
    title: 'WE HIT A ROADBLOCK',
    message: 'This request could not be completed. Please return home or try again.',
    icon: AlertTriangle
  };
  $: content = ERROR_CONTENT[status] ?? fallbackContent;
  $: Icon = content.icon;
  $: canRetry = status >= 500;
</script>

<svelte:head>
  <title>{status} | Rotaract Club of Lilongwe</title>
  <meta
    name="description"
    content="Error page for the Rotaract Club of Lilongwe website."
  />
</svelte:head>

<main class="error-page">
  <nav class="error-nav" aria-label="Site">
    <a href="/" class="brand" aria-label="Rotaract Club of Lilongwe home">
      <img src={logo} alt="" />
      <span>
        <strong>Rotaract Club</strong>
        <small>of Lilongwe</small>
      </span>
    </a>
  </nav>

  <section class="error-hero" aria-labelledby="error-heading">
    <div class="status-mark" aria-hidden="true">
      <svelte:component this={Icon} size={42} strokeWidth={1.8} />
    </div>

    <p class="eyebrow">{content.eyebrow} / {status}</p>
    <h1 id="error-heading">{content.title}</h1>
    <p class="message">{content.message}</p>

    <div class="actions">
      <a href="/" class="btn btn-primary">
        <Home size={18} strokeWidth={2.4} />
        Back home
      </a>

      {#if canRetry}
        <button class="btn btn-secondary" type="button" on:click={() => window.location.reload()}>
          <RefreshCcw size={18} strokeWidth={2.4} />
          Try again
        </button>
      {:else}
        <a href="/join" class="btn btn-secondary">Join us</a>
      {/if}
    </div>
  </section>
</main>

<style>
  .error-page {
    min-height: 100vh;
    background:
      linear-gradient(135deg, rgba(26, 26, 26, 0.96), rgba(26, 26, 26, 0.88)),
      url('/logo.png') center / cover;
    color: white;
    display: flex;
    flex-direction: column;
    padding: 28px 5vw 56px;
  }

  .error-nav {
    width: min(1120px, 100%);
    margin: 0 auto;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    color: white;
    text-decoration: none;
  }

  .brand img {
    width: 48px;
    height: 48px;
    object-fit: contain;
  }

  .brand span {
    display: grid;
    line-height: 1.1;
  }

  .brand strong {
    font-size: 13px;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .brand small {
    color: rgba(255, 255, 255, 0.62);
    font-size: 12px;
    font-weight: 700;
  }

  .error-hero {
    width: min(860px, 100%);
    margin: auto;
    padding: 88px 0 40px;
  }

  .status-mark {
    width: 78px;
    height: 78px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(232, 23, 93, 0.42);
    border-radius: 4px;
    background: rgba(232, 23, 93, 0.14);
    color: var(--primary);
    margin-bottom: 28px;
  }

  .eyebrow {
    color: var(--orange);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
    margin: 0 0 18px;
    text-transform: uppercase;
  }

  h1 {
    color: white;
    font-family: 'Anton', sans-serif;
    font-size: clamp(54px, 11vw, 118px);
    font-weight: 400;
    letter-spacing: 0;
    line-height: 0.92;
    margin: 0;
    max-width: 820px;
  }

  .message {
    color: rgba(255, 255, 255, 0.72);
    font-size: 17px;
    font-weight: 600;
    line-height: 1.75;
    margin: 28px 0 0;
    max-width: 560px;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 40px;
  }

  .btn {
    min-height: 50px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    font: 800 14px/1 'Plus Jakarta Sans', sans-serif;
    padding: 0 28px;
    text-decoration: none;
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      background 0.2s ease;
  }

  .btn:hover {
    transform: translateY(-2px);
  }

  .btn-primary {
    background: var(--primary);
    color: white;
    box-shadow: 0 8px 32px rgba(232, 23, 93, 0.34);
  }

  .btn-secondary {
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.34);
    color: white;
  }

  .btn-secondary:hover {
    border-color: rgba(255, 255, 255, 0.78);
  }

  @media (max-width: 640px) {
    .error-page {
      padding: 22px 22px 40px;
    }

    .error-hero {
      padding-top: 72px;
    }

    .brand img {
      width: 42px;
      height: 42px;
    }

    .status-mark {
      width: 66px;
      height: 66px;
      margin-bottom: 24px;
    }

    .message {
      font-size: 15px;
    }

    .actions,
    .btn {
      width: 100%;
    }
  }
</style>
