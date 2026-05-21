<script>
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { Check, AlertCircle, Loader } from 'lucide-svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	let phone = '';
	let occupation = '';
	let skills = '';
	let isLoading = false;
	let successMessage = '';
	let errorMessage = '';
	let formErrors = {};

	onMount(() => {
		if (data.profile) {
			phone = data.profile.phone || '';
			occupation = data.profile.occupation || '';
			skills = data.profile.skills || '';
		}
	});

	function handleSubmit() {
		isLoading = true;
		successMessage = '';
		errorMessage = '';
		formErrors = {};
	}

	const enhanceUpdate = async ({ result }) => {
		isLoading = false;

		if (result.type === 'failure') {
			if (result.data?.errors) {
				formErrors = result.data.errors;
			}
			errorMessage = result.data?.message || 'Failed to update profile';
		} else if (result.type === 'success') {
			successMessage = 'Profile updated successfully!';
			// Clear message after 3 seconds
			setTimeout(() => {
				successMessage = '';
			}, 3000);
		}
	};
</script>

<svelte:head>
	<title>My Profile - Rotaract Lilongwe</title>
</svelte:head>

{#if data.error}
	<div class="profile-container">
		<div class="error-box">
			<AlertCircle size={32} />
			<h1>Unable to Load Profile</h1>
			<p>{data.error}</p>
			<p class="help-text">Please contact an administrator if you believe this is an error.</p>
		</div>
	</div>
{:else if !data.profile}
	<div class="profile-container">
		<div class="loading-box">
			<Loader size={32} class="spin-slow" />
			<p>Loading your profile...</p>
		</div>
	</div>
{:else}
	<div class="profile-container">
		<div class="profile-header">
			<h1>My Profile</h1>
			<p class="subtitle">Update your member information</p>
		</div>

		<div class="profile-content">
		<!-- Read-only Information -->
		<div class="info-section">
			<h2>Account Information</h2>
			<div class="info-grid">
				<div class="info-field">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label>RAC Number</label>
					<div class="info-value">{data.profile.rac_number}</div>
				</div>
				<div class="info-field">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label>Full Name</label>
					<div class="info-value">{data.profile.full_name}</div>
				</div>
				<div class="info-field">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label>Email</label>
					<div class="info-value">{data.profile.email}</div>
				</div>
				<div class="info-field">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label>Status</label>
					<div class="info-value status-badge" class:active={data.profile.status === 'active'}>
						{data.profile.status.charAt(0).toUpperCase() + data.profile.status.slice(1)}
					</div>
				</div>
			</div>
		</div>

		<!-- Editable Profile Form -->
		<div class="edit-section">
			<h2>Edit Your Information</h2>

			{#if successMessage}
				<div class="message-box success">
					<Check size={20} />
					<p>{successMessage}</p>
				</div>
			{/if}

			{#if errorMessage}
				<div class="message-box error">
					<AlertCircle size={20} />
					<p>{errorMessage}</p>
				</div>
			{/if}

			<form method="POST" action="?/updateProfile" use:enhance={enhanceUpdate} on:submit={handleSubmit}>
				<div class="form-group">
					<label for="phone">Phone Number (Optional)</label>
					<input
						type="tel"
						id="phone"
						name="phone"
						bind:value={phone}
						placeholder="+265 1 234 5678"
						maxlength="20"
						class:error={formErrors.phone}
					/>
					{#if formErrors.phone}
						<span class="field-error">{formErrors.phone}</span>
					{/if}
				</div>

				<div class="form-group">
					<label for="occupation">Occupation (Optional)</label>
					<input
						type="text"
						id="occupation"
						name="occupation"
						bind:value={occupation}
						placeholder="e.g., Software Engineer, Teacher, Doctor"
						maxlength="100"
						class:error={formErrors.occupation}
					/>
					{#if formErrors.occupation}
						<span class="field-error">{formErrors.occupation}</span>
					{/if}
				</div>

				<div class="form-group">
					<label for="skills">Skills (Optional)</label>
					<textarea
						id="skills"
						name="skills"
						bind:value={skills}
						placeholder="e.g., Leadership, Project Management, Web Development&#10;Separate multiple skills with commas"
						maxlength="500"
						rows="4"
						class:error={formErrors.skills}
					/>
					{#if formErrors.skills}
						<span class="field-error">{formErrors.skills}</span>
					{/if}
					<div class="char-count">
						{skills.length} / 500 characters
					</div>
				</div>

				<button type="submit" class="submit-btn" disabled={isLoading}>
					{#if isLoading}
						<Loader size={18} class="spin-slow" />
						Saving...
					{:else}
						<Check size={18} />
						Save Changes
					{/if}
				</button>
			</form>
		</div>

		<div class="info-section help-section">
			<h3>Privacy & Security</h3>
			<p>
				Only you can edit your profile information. Your data is secured with industry-standard encryption
				and governed by our privacy policies.
			</p>
		</div>
	</div>
</div>
{/if}

<style>
	.profile-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 80px 20px 40px;
		background: var(--cream);
	}

	.profile-header {
		text-align: center;
		margin-bottom: 40px;
	}

	.profile-header h1 {
		font-size: 32px;
		color: var(--near-black);
		margin-bottom: 8px;
		font-weight: 700;
	}

	.subtitle {
		font-size: 16px;
		color: #666;
	}

	.profile-content {
		display: flex;
		flex-direction: column;
		gap: 30px;
	}

	/* Info Section */
	.info-section {
		background: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.info-section h2 {
		font-size: 20px;
		color: var(--near-black);
		margin-bottom: 20px;
		font-weight: 600;
	}

	.info-section h3 {
		font-size: 16px;
		color: var(--near-black);
		margin-bottom: 12px;
		font-weight: 600;
	}

	.info-section p {
		color: #666;
		line-height: 1.6;
		font-size: 14px;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 20px;
	}

	.info-field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.info-field label {
		font-size: 12px;
		font-weight: 600;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.info-value {
		font-size: 16px;
		color: var(--near-black);
		font-weight: 500;
	}

	.status-badge {
		display: inline-block;
		padding: 4px 12px;
		background: #f0f0f0;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		width: fit-content;
	}

	.status-badge.active {
		background: #e8f5e9;
		color: #2e7d32;
	}

	/* Edit Section */
	.edit-section {
		background: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.edit-section h2 {
		font-size: 20px;
		color: var(--near-black);
		margin-bottom: 20px;
		font-weight: 600;
	}

	/* Message Boxes */
	.message-box {
		display: flex;
		gap: 12px;
		padding: 16px;
		border-radius: 8px;
		margin-bottom: 20px;
		font-size: 14px;
		align-items: flex-start;
	}

	.message-box.success {
		background: #e8f5e9;
		color: #2e7d32;
		border-left: 4px solid #2e7d32;
	}

	.message-box.error {
		background: #ffebee;
		color: #c62828;
		border-left: 4px solid #c62828;
	}

	.message-box p {
		margin: 0;
		flex: 1;
	}

	/* Form Styles */
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 20px;
	}

	label {
		font-size: 14px;
		font-weight: 600;
		color: var(--near-black);
	}

	input,
	textarea {
		padding: 12px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 14px;
		background: white;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(232, 23, 93, 0.1);
	}

	input.error,
	textarea.error {
		border-color: #c62828;
		box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.1);
	}

	textarea {
		resize: vertical;
		font-family: 'Plus Jakarta Sans', sans-serif;
	}

	.field-error {
		font-size: 12px;
		color: #c62828;
		margin-top: 4px;
	}

	.char-count {
		font-size: 12px;
		color: #999;
		text-align: right;
		margin-top: 4px;
	}

	/* Submit Button */
	.submit-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 12px 24px;
		background: var(--primary);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s ease, transform 0.1s ease;
		margin-top: 10px;
	}

	.submit-btn:hover:not(:disabled) {
		background: #c91452;
		transform: translateY(-2px);
	}

	.submit-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.submit-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	/* Help Section */
	.help-section {
		background: #f9f9f9;
		border-left: 4px solid var(--primary);
	}

	/* Loading & Error Boxes */
	.loading-box,
	.error-box {
		background: white;
		border-radius: 12px;
		padding: 40px 24px;
		text-align: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.error-box {
		border: 2px solid #ffebee;
	}

	.error-box h1 {
		font-size: 24px;
		color: var(--near-black);
		margin: 0;
	}

	.error-box p {
		margin: 0;
		color: #666;
		font-size: 14px;
	}

	.help-text {
		margin-top: 8px;
		color: #999;
		font-size: 13px !important;
	}

	.spin-slow {
		animation: slow-spin 2s linear infinite;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.profile-container {
			padding: 60px 16px 30px;
		}

		.profile-header h1 {
			font-size: 24px;
		}

		.info-grid {
			grid-template-columns: 1fr;
		}

		.info-section,
		.edit-section {
			padding: 16px;
		}
	}
</style>
