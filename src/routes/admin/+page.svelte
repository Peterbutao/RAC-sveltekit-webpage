<script>
	import { enhance } from '$app/forms';

	/** @type {import('./$types').PageData} */
	export let data;

	let selectedApp = null;
	let showAssignModal = false;
	let showRejectModal = false;
	let password = '';
	let rejectReason = '';
	let isSubmitting = false;

	function openAssignModal(app) {
		selectedApp = app;
		showAssignModal = true;
		password = '';
	}

	function openRejectModal(app) {
		selectedApp = app;
		showRejectModal = true;
		rejectReason = '';
	}

	function closeModals() {
		showAssignModal = false;
		showRejectModal = false;
		selectedApp = null;
		password = '';
		rejectReason = '';
		isSubmitting = false;
	}

	function handleSuccess(message) {
		closeModals();
		// Reload data
		window.location.reload();
	}
</script>

<div class="admin-container">
	<div class="header">
		<h1>Admin Dashboard</h1>
		<p>Manage membership applications and assign RAC numbers</p>
	</div>

	{#if data.applicationCount > 0}
		<div class="notification-banner">
			<div class="notification-content">
				<span class="notification-icon">📋</span>
				<div class="notification-text">
					<p class="notification-title">
						{data.applicationCount} 
						{data.applicationCount === 1 ? 'person' : 'people'} 
						{data.applicationCount === 1 ? 'has' : 'have'} applied for membership
					</p>
					<p class="notification-subtitle">Review and assign RAC numbers below</p>
				</div>
			</div>
		</div>
	{/if}

	<div class="toolbar">
		<form method="POST" action="?/syncMembers" use:enhance>
			<button type="submit" class="btn btn-secondary" title="Sync members to Google Sheet DB_APPROVED">
				📊 Sync to Google Sheet
			</button>
		</form>
	</div>

	{#if data.applications.length === 0}
		<div class="empty-state">
			<p>No pending applications</p>
		</div>
	{:else}
		<div class="applications-grid">
			{#each data.applications as app (app.id)}
				<div class="application-card">
					<div class="card-header">
						<h3>{app.full_name}</h3>
						<span class="status-badge pending">Pending</span>
					</div>

					<div class="card-body">
						<div class="field">
							<label>Email</label>
							<p>{app.email}</p>
						</div>
						<div class="field">
							<label>Phone</label>
							<p>{app.phone}</p>
						</div>
						<div class="field">
							<label>Age</label>
							<p>{app.age}</p>
						</div>
						<div class="field">
							<label>Occupation</label>
							<p>{app.occupation}</p>
						</div>
						<div class="field">
							<label>Motivation</label>
							<p>{app.motivation}</p>
						</div>
						{#if app.skills}
							<div class="field">
								<label>Skills</label>
								<p>{app.skills}</p>
							</div>
						{/if}
						<div class="field">
							<label>Applied</label>
							<p>{new Date(app.submitted_at).toLocaleDateString()}</p>
						</div>
					</div>

					<div class="card-footer">
						<button
							class="btn btn-primary"
							on:click={() => openAssignModal(app)}
						>
							Assign RAC Number
						</button>
						<button
							class="btn btn-danger"
							on:click={() => openRejectModal(app)}
						>
							Reject
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Assign RAC Modal -->
{#if showAssignModal && selectedApp}
	<div class="modal-overlay" on:click={closeModals}>
		<div class="modal" on:click={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>Assign RAC Number</h2>
				<button class="close-btn" on:click={closeModals}>×</button>
			</div>

			<form
				method="POST"
				action="?/assignRac"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ result }) => {
						isSubmitting = false;
						if (result.type === 'success') {
							handleSuccess(result.data.message);
						}
					};
				}}
				class="modal-body"
			>
				<input type="hidden" name="application_id" value={selectedApp.id} />

				<div class="form-group">
					<label for="rac_number">RAC Number</label>
					<input
						type="text"
						id="rac_number"
						name="rac_number"
						value={data.nextRacNumber}
						readonly
						class="form-control"
					/>
					<small>Next available: {data.nextRacNumber}</small>
				</div>

				<div class="form-group">
					<label for="password">Temporary Password</label>
					<input
						type="password"
						id="password"
						name="password"
						bind:value={password}
						placeholder="Enter temporary password"
						required
						class="form-control"
					/>
					<small>User will be prompted to change this on first login</small>
				</div>

				<div class="form-group">
					<p><strong>Applicant:</strong> {selectedApp.full_name}</p>
					<p><strong>Email:</strong> {selectedApp.email}</p>
				</div>

				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" on:click={closeModals}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
						{isSubmitting ? 'Assigning...' : 'Assign RAC Number'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Reject Application Modal -->
{#if showRejectModal && selectedApp}
	<div class="modal-overlay" on:click={closeModals}>
		<div class="modal" on:click={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>Reject Application</h2>
				<button class="close-btn" on:click={closeModals}>×</button>
			</div>

			<form
				method="POST"
				action="?/rejectApplication"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ result }) => {
						isSubmitting = false;
						if (result.type === 'success') {
							handleSuccess(result.data.message);
						}
					};
				}}
				class="modal-body"
			>
				<input type="hidden" name="application_id" value={selectedApp.id} />

				<div class="form-group">
					<label for="reason">Reason for Rejection (Optional)</label>
					<textarea
						id="reason"
						name="reason"
						bind:value={rejectReason}
						placeholder="Provide a reason (will be sent to applicant)"
						class="form-control"
						rows="4"
					></textarea>
				</div>

				<div class="form-group">
					<p><strong>Applicant:</strong> {selectedApp.full_name}</p>
					<p><strong>Email:</strong> {selectedApp.email}</p>
				</div>

				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" on:click={closeModals}>
						Cancel
					</button>
					<button type="submit" class="btn btn-danger" disabled={isSubmitting}>
						{isSubmitting ? 'Rejecting...' : 'Reject Application'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.admin-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}

	.header {
		margin-bottom: 40px;
		border-bottom: 2px solid #e8175d;
		padding-bottom: 20px;
	}

	.header h1 {
		margin: 0 0 10px 0;
		color: #1a1a1a;
		font-size: 32px;
	}

	.header p {
		margin: 0;
		color: #666;
	}

	.notification-banner {
		background: linear-gradient(135deg, #e8175d 0%, #a8115e 100%);
		color: white;
		padding: 20px;
		border-radius: 8px;
		margin-bottom: 30px;
		box-shadow: 0 4px 12px rgba(232, 23, 93, 0.2);
	}

	.notification-content {
		display: flex;
		align-items: flex-start;
		gap: 15px;
	}

	.notification-icon {
		font-size: 28px;
		flex-shrink: 0;
		line-height: 1;
	}

	.notification-text {
		flex: 1;
	}

	.notification-title {
		margin: 0 0 5px 0;
		font-size: 16px;
		font-weight: 600;
	}

	.notification-subtitle {
		margin: 0;
		font-size: 13px;
		opacity: 0.9;
	}

	.toolbar {
		display: flex;
		gap: 10px;
		margin-bottom: 30px;
	}

	.toolbar form {
		display: inline;
	}

	.btn {
		padding: 10px 16px;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}

	.btn-secondary {
		background-color: #f0f0f0;
		color: #333;
		border: 1px solid #ddd;
	}

	.btn-secondary:hover {
		background-color: #e0e0e0;
		border-color: #999;
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
		color: #999;
		font-size: 18px;
	}

	.applications-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
		gap: 20px;
	}

	.application-card {
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
	}

	.card-header {
		background: #f9f9f9;
		padding: 20px;
		border-bottom: 1px solid #eee;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.card-header h3 {
		margin: 0;
		color: #1a1a1a;
		font-size: 18px;
	}

	.status-badge {
		padding: 6px 12px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: bold;
	}

	.status-badge.pending {
		background: #fff3cd;
		color: #856404;
	}

	.card-body {
		padding: 20px;
		flex: 1;
	}

	.field {
		margin-bottom: 15px;
	}

	.field label {
		display: block;
		font-weight: bold;
		color: #e8175d;
		margin-bottom: 5px;
		font-size: 12px;
		text-transform: uppercase;
	}

	.field p {
		margin: 0;
		color: #333;
		word-break: break-word;
	}

	.card-footer {
		padding: 15px 20px;
		border-top: 1px solid #eee;
		display: flex;
		gap: 10px;
	}

	.btn {
		flex: 1;
		padding: 10px 15px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
		font-size: 14px;
		transition: all 0.3s ease;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background: #e8175d;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #a8115e;
		transform: translateY(-2px);
	}

	.btn-danger {
		background: #dc3545;
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background: #c82333;
		transform: translateY(-2px);
	}

	.btn-secondary {
		background: #6c757d;
		color: white;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #5a6268;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.modal {
		background: white;
		border-radius: 8px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		padding: 20px;
		border-bottom: 2px solid #e8175d;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-header h2 {
		margin: 0;
		color: #1a1a1a;
		font-size: 22px;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 28px;
		cursor: pointer;
		color: #666;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover {
		color: #e8175d;
	}

	.modal-body {
		padding: 20px;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-group label {
		display: block;
		margin-bottom: 8px;
		font-weight: 600;
		color: #1a1a1a;
	}

	.form-control {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
		font-family: inherit;
	}

	.form-control:focus {
		outline: none;
		border-color: #e8175d;
		box-shadow: 0 0 0 3px rgba(232, 23, 93, 0.1);
	}

	.form-control[readonly] {
		background: #f9f9f9;
		color: #666;
	}

	.form-group small {
		display: block;
		margin-top: 5px;
		color: #999;
		font-size: 12px;
	}

	.form-group p {
		margin: 8px 0;
		color: #333;
	}

	.modal-footer {
		padding: 15px 20px;
		border-top: 1px solid #eee;
		display: flex;
		gap: 10px;
		justify-content: flex-end;
	}

	@media (max-width: 768px) {
		.applications-grid {
			grid-template-columns: 1fr;
		}

		.modal {
			max-width: 100%;
		}

		.notification-content {
			flex-direction: column;
			gap: 10px;
		}

		.notification-icon {
			font-size: 24px;
		}

		.notification-title {
			font-size: 15px;
		}

		.notification-subtitle {
			font-size: 12px;
		}
	}
</style>
