<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	/** @type {import('./$types').PageData} */
	export let data;

	let selectedApp = null;
	let showAssignModal = false;
	let showRejectModal = false;
	let password = '';
	let rejectReason = '';
	let isSubmitting = false;
	let activeTab = 'pending';
	let isSyncing = false;
	let syncStatus = null;

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

	function handleSuccess() {
		closeModals();
		window.location.reload();
	}

	function handleSyncSubmit() {
		isSyncing = true;
		syncStatus = null;

		return async ({ result }) => {
			isSyncing = false;
			syncStatus = {
				type: result.type === 'success' ? 'success' : 'error',
				message: result.data?.message || result.data?.error || 'Unable to sync members to Google Sheets.'
			};

			if (result.type === 'success') {
				activeTab = 'members';
				await invalidateAll();
			}
		};
	}
</script>

<div class="admin-container">
	<div class="header">
		<h1>Admin Dashboard</h1>
		<p>Manage membership applications, approve members, and sync DB_APPROVED.</p>
	</div>

	{#if data.applicationCount > 0}
		<div class="notification-banner">
			<div class="notification-content">
				<div class="notification-text">
					<p class="notification-title">
						{data.applicationCount}
						{data.applicationCount === 1 ? 'person' : 'people'}
						{data.applicationCount === 1 ? 'has' : 'have'} applied for membership
					</p>
					<p class="notification-subtitle">Review applications and assign RAC numbers from the pending tab.</p>
				</div>
			</div>
		</div>
	{/if}

	<div class="tabbar" role="tablist" aria-label="Admin sections">
		<button
			type="button"
			class:active={activeTab === 'pending'}
			role="tab"
			aria-selected={activeTab === 'pending'}
			on:click={() => (activeTab = 'pending')}
		>
			Pending Applications <span>{data.applicationCount}</span>
		</button>
		<button
			type="button"
			class:active={activeTab === 'members'}
			role="tab"
			aria-selected={activeTab === 'members'}
			on:click={() => (activeTab = 'members')}
		>
			Members <span>{data.approvedMemberCount}</span>
		</button>
	</div>

	{#if activeTab === 'pending'}
		<div class="tab-panel" role="tabpanel" aria-label="Pending applications">
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
									<span class="field-label">Email</span>
									<p>{app.email}</p>
								</div>
								<div class="field">
									<span class="field-label">Phone</span>
									<p>{app.phone}</p>
								</div>
								<div class="field">
									<span class="field-label">Age</span>
									<p>{app.age}</p>
								</div>
								<div class="field">
									<span class="field-label">Occupation</span>
									<p>{app.occupation}</p>
								</div>
								<div class="field">
									<span class="field-label">Motivation</span>
									<p>{app.motivation}</p>
								</div>
								{#if app.skills}
									<div class="field">
										<span class="field-label">Skills</span>
										<p>{app.skills}</p>
									</div>
								{/if}
								<div class="field">
									<span class="field-label">Applied</span>
									<p>{new Date(app.submitted_at).toLocaleDateString()}</p>
								</div>
							</div>

							<div class="card-footer">
								<button class="btn btn-primary" on:click={() => openAssignModal(app)}>
									Assign RAC Number
								</button>
								<button class="btn btn-danger" on:click={() => openRejectModal(app)}>
									Reject
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<div class="tab-panel" role="tabpanel" aria-label="Members from DB_APPROVED">
			<div class="members-toolbar">
				<div>
					<h2>Approved Members</h2>
					<p>Loaded from the DB_APPROVED sheet in Google Sheets.</p>
				</div>
				<form method="POST" action="?/syncMembers" use:enhance={handleSyncSubmit}>
					<button type="submit" class="btn btn-secondary sync-btn" disabled={isSyncing}>
						{isSyncing ? 'Syncing...' : 'Sync to Google Sheet'}
					</button>
				</form>
			</div>

			{#if syncStatus}
				<div class="form-alert" class:success={syncStatus.type === 'success'} class:error={syncStatus.type === 'error'}>
					{syncStatus.message}
				</div>
			{/if}

			{#if data.approvedMembers.length === 0}
				<div class="empty-state">
					<p>No approved members found in DB_APPROVED.</p>
				</div>
			{:else}
				<div class="members-table-wrap">
					<table class="members-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>RAC Number</th>
								<th>Occupation</th>
								<th>Age</th>
								<th>Phone</th>
							</tr>
						</thead>
						<tbody>
							{#each data.approvedMembers as member, index (`${member.rac_number}-${index}`)}
								<tr>
									<td>{member.name || member.full_name || '-'}</td>
									<td>{member.rac_number || '-'}</td>
									<td>{member.occupation || '-'}</td>
									<td>{member.age || '-'}</td>
									<td>{member.phone_number || member.phone || '-'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if showAssignModal && selectedApp}
	<div class="modal-overlay">
		<button type="button" class="modal-backdrop" aria-label="Close dialog" on:click={closeModals}></button>
		<div class="modal" role="dialog" aria-modal="true" aria-labelledby="assign-title">
			<div class="modal-header">
				<h2 id="assign-title">Assign RAC Number</h2>
				<button class="close-btn" on:click={closeModals}>x</button>
			</div>

			<form
				method="POST"
				action="?/assignRac"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ result }) => {
						isSubmitting = false;
						if (result.type === 'success') {
							handleSuccess();
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

{#if showRejectModal && selectedApp}
	<div class="modal-overlay">
		<button type="button" class="modal-backdrop" aria-label="Close dialog" on:click={closeModals}></button>
		<div class="modal" role="dialog" aria-modal="true" aria-labelledby="reject-title">
			<div class="modal-header">
				<h2 id="reject-title">Reject Application</h2>
				<button class="close-btn" on:click={closeModals}>x</button>
			</div>

			<form
				method="POST"
				action="?/rejectApplication"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ result }) => {
						isSubmitting = false;
						if (result.type === 'success') {
							handleSuccess();
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
		margin-bottom: 28px;
		border-bottom: 2px solid #e8175d;
		padding-bottom: 20px;
	}

	.header h1,
	.members-toolbar h2 {
		margin: 0 0 10px 0;
		color: #1a1a1a;
	}

	.header h1 {
		font-size: 32px;
	}

	.header p,
	.members-toolbar p {
		margin: 0;
		color: #666;
	}

	.notification-banner {
		background: #e8175d;
		color: white;
		padding: 18px 20px;
		border-radius: 8px;
		margin-bottom: 22px;
		box-shadow: 0 4px 12px rgba(232, 23, 93, 0.2);
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

	.tabbar {
		display: flex;
		gap: 8px;
		border-bottom: 1px solid #ddd;
		margin-bottom: 24px;
		overflow-x: auto;
	}

	.tabbar button {
		background: transparent;
		border: 0;
		border-bottom: 3px solid transparent;
		color: #666;
		cursor: pointer;
		font: inherit;
		font-weight: 700;
		padding: 12px 14px;
		white-space: nowrap;
	}

	.tabbar button.active {
		border-color: #e8175d;
		color: #1a1a1a;
	}

	.tabbar span {
		background: #f1f1f1;
		border-radius: 999px;
		color: #333;
		display: inline-block;
		font-size: 12px;
		margin-left: 8px;
		min-width: 24px;
		padding: 3px 8px;
		text-align: center;
	}

	.tab-panel {
		min-height: 280px;
	}

	.members-toolbar {
		align-items: center;
		display: flex;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 16px;
	}

	.form-alert {
		border-radius: 6px;
		font-weight: 600;
		margin-bottom: 16px;
		padding: 12px 14px;
	}

	.form-alert.success {
		background: #e8f6ef;
		color: #17623a;
	}

	.form-alert.error {
		background: #fde8eb;
		color: #9f2030;
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
		gap: 12px;
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

	.field-label {
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
		align-items: center;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		display: inline-flex;
		font-size: 14px;
		font-weight: 600;
		gap: 8px;
		justify-content: center;
		padding: 10px 15px;
		transition: all 0.2s ease;
	}

	.card-footer .btn {
		flex: 1;
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
	}

	.btn-danger {
		background: #dc3545;
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background: #c82333;
	}

	.btn-secondary {
		background: #6c757d;
		color: white;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #5a6268;
	}

	.sync-btn {
		min-width: 168px;
	}

	.members-table-wrap {
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow-x: auto;
	}

	.members-table {
		border-collapse: collapse;
		min-width: 760px;
		width: 100%;
	}

	.members-table th,
	.members-table td {
		border-bottom: 1px solid #eee;
		padding: 13px 14px;
		text-align: left;
		vertical-align: top;
	}

	.members-table th {
		background: #f9f9f9;
		color: #1a1a1a;
		font-size: 12px;
		text-transform: uppercase;
	}

	.members-table tr:last-child td {
		border-bottom: 0;
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

	.modal-backdrop {
		background: transparent;
		border: 0;
		bottom: 0;
		cursor: default;
		left: 0;
		position: absolute;
		right: 0;
		top: 0;
	}

	.modal {
		background: white;
		border-radius: 8px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		z-index: 1;
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
		font-size: 24px;
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

		.members-toolbar {
			align-items: stretch;
			flex-direction: column;
		}

		.sync-btn {
			width: 100%;
		}

		.modal {
			max-width: 100%;
		}

		.notification-title {
			font-size: 15px;
		}

		.notification-subtitle {
			font-size: 12px;
		}
	}
</style>
