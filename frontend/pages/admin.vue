<template>
  <div class="admin-page">
    <h1 class="admin-title">Settings</h1>

    <!-- Tabs -->
    <div class="admin-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="admin-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Password Tab (all users) -->
    <div v-if="activeTab === 'password'" class="admin-section">
      <h3>Change Password</h3>
      <form class="settings-form" @submit.prevent="handlePasswordChange">
        <div class="field">
          <label for="pw-current">Current Password</label>
          <input id="pw-current" v-model="pwCurrent" type="password" autocomplete="current-password" required />
        </div>
        <div class="field">
          <label for="pw-new">New Password</label>
          <input id="pw-new" v-model="pwNew" type="password" autocomplete="new-password" required minlength="6" />
        </div>
        <div class="field">
          <label for="pw-confirm">Confirm New Password</label>
          <input id="pw-confirm" v-model="pwConfirm" type="password" autocomplete="new-password" required />
        </div>
        <div v-if="pwError" class="form-error">{{ pwError }}</div>
        <div v-if="pwSuccess" class="form-success">{{ pwSuccess }}</div>
        <div>
          <SButton variant="primary" native-type="submit" :loading="pwLoading">Change Password</SButton>
        </div>
      </form>
    </div>

    <!-- Users Tab -->
    <div v-if="activeTab === 'users'" class="admin-section">
      <div class="section-header">
        <h3>Users</h3>
        <SButton variant="primary" size="sm" @click="showAddUser = true">+ Add User</SButton>
      </div>

      <table class="admin-table" v-if="users.length > 0">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.username }}</td>
            <td><span class="role-badge" :class="u.role">{{ u.role }}</span></td>
            <td class="date-cell">{{ formatDate(u.created_at) }}</td>
            <td class="actions-cell">
              <SButton size="sm" variant="ghost" @click="editUser(u)">Edit</SButton>
              <SButton size="sm" variant="danger" @click="deleteUser(u)" :disabled="u.id === auth.user?.id">Delete</SButton>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty-text">No users found.</p>

      <!-- Add/Edit User Modal -->
      <div v-if="showAddUser || editingUser" class="modal-overlay" @click.self="closeUserModal">
        <div class="modal">
          <h3>{{ editingUser ? 'Edit User' : 'Add User' }}</h3>
          <div class="field">
            <label>Username</label>
            <input v-model="userForm.username" type="text" placeholder="Username" />
          </div>
          <div class="field">
            <label>Password {{ editingUser ? '(leave blank to keep)' : '' }}</label>
            <input v-model="userForm.password" type="password" placeholder="Password" />
          </div>
          <div class="field">
            <label>Role</label>
            <select v-model="userForm.role">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div v-if="userFormError" class="form-error">{{ userFormError }}</div>
          <div class="modal-actions">
            <SButton variant="ghost" @click="closeUserModal">Cancel</SButton>
            <SButton variant="primary" @click="saveUser" :loading="savingUser">
              {{ editingUser ? 'Save Changes' : 'Create User' }}
            </SButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Libraries Tab -->
    <div v-if="activeTab === 'libraries'" class="admin-section">
      <div class="section-header">
        <h3>Library Folders</h3>
        <SButton variant="primary" size="sm" @click="showAddFolder = true">+ Add Folder</SButton>
      </div>

      <table class="admin-table" v-if="folders.length > 0">
        <thead>
          <tr>
            <th>Label</th>
            <th>Path</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in folders" :key="f.id">
            <td>{{ f.label || f.path }}</td>
            <td class="path-cell">{{ f.path }}</td>
            <td><span class="type-badge" :class="f.type">{{ f.type }}</span></td>
            <td><span :class="f.active ? 'status-active' : 'status-inactive'">{{ f.active ? 'Active' : 'Inactive' }}</span></td>
            <td class="actions-cell">
              <SButton size="sm" variant="ghost" @click="editFolder(f)">Edit</SButton>
              <SButton size="sm" variant="danger" @click="deleteFolder(f)">Delete</SButton>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty-text">No library folders configured. Add comic directories to start scanning.</p>

      <!-- Add/Edit Folder Modal -->
      <div v-if="showAddFolder || editingFolder" class="modal-overlay" @click.self="closeFolderModal">
        <div class="modal">
          <h3>{{ editingFolder ? 'Edit Folder' : 'Add Folder' }}</h3>
          <div class="field">
            <label>Label</label>
            <input v-model="folderForm.label" type="text" placeholder="e.g., Main Library" />
          </div>
          <div class="field">
            <label>Type</label>
            <select v-model="folderForm.type">
              <option value="local">Local</option>
              <option value="smb">SMB / Samba</option>
              <option value="webdav">WebDAV</option>
            </select>
          </div>

          <template v-if="folderForm.type === 'local'">
            <div class="field">
              <label>Path</label>
              <input v-model="folderForm.path" type="text" placeholder="/path/to/comics" />
            </div>
          </template>

          <template v-if="folderForm.type === 'smb'">
            <div class="field">
              <label>Host</label>
              <input v-model="folderForm.smb_host" type="text" placeholder="192.168.1.100" />
            </div>
            <div class="field">
              <label>Share</label>
              <input v-model="folderForm.smb_share" type="text" placeholder="comics" />
            </div>
            <div class="field">
              <label>Username</label>
              <input v-model="folderForm.smb_username" type="text" placeholder="username" />
            </div>
            <div class="field">
              <label>Password</label>
              <input v-model="folderForm.smb_password" type="password" placeholder="password" />
            </div>
            <div class="field">
              <label>Domain (optional)</label>
              <input v-model="folderForm.smb_domain" type="text" placeholder="WORKGROUP" />
            </div>
          </template>

          <div class="field">
            <label>
              <input v-model="folderForm.active" type="checkbox" checked />
              Active
            </label>
          </div>

          <div v-if="folderFormError" class="form-error">{{ folderFormError }}</div>
          <div class="modal-actions">
            <SButton variant="ghost" @click="closeFolderModal">Cancel</SButton>
            <SButton variant="primary" @click="saveFolder" :loading="savingFolder">
              {{ editingFolder ? 'Save' : 'Add Folder' }}
            </SButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Tab -->
    <div v-if="activeTab === 'settings'" class="admin-section">
      <h3>General Settings</h3>
      <div class="settings-form">
        <div class="field">
          <label>Comic Vine API Key</label>
          <input v-model="settingsForm.comic_vine_api_key" type="text" placeholder="Enter API key" />
        </div>
        <div class="field">
          <label>Cache TTL (seconds)</label>
          <input v-model="settingsForm.cache_ttl" type="number" placeholder="3600" />
        </div>
        <div v-if="settingsError" class="form-error">{{ settingsError }}</div>
        <SButton variant="primary" @click="saveSettings" :loading="savingSettings">Save Settings</SButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";
import { useToast } from "~/composables/useToast";

const { apiFetch } = useApi();
const auth = useAuth();
const toast = useToast();

// ── Tabs (Password for all, admin tabs for admins only)
const tabs = computed(() => {
  const items: { id: string; label: string }[] = [
    { id: "password", label: "Password" },
  ];
  if (auth.isAdmin.value) {
    items.push({ id: "users", label: "Users" });
    items.push({ id: "libraries", label: "Libraries" });
    items.push({ id: "settings", label: "Comic Vine" });
  }
  return items;
});
const activeTab = ref(auth.isAdmin.value ? "users" : "password");

// ── Password change (all users)
const pwCurrent = ref("");
const pwNew = ref("");
const pwConfirm = ref("");
const pwError = ref("");
const pwSuccess = ref("");
const pwLoading = ref(false);

async function handlePasswordChange() {
  pwError.value = "";
  pwSuccess.value = "";
  if (pwNew.value !== pwConfirm.value) { pwError.value = "New passwords do not match"; return; }
  if (pwNew.value.length < 6) { pwError.value = "Password must be at least 6 characters"; return; }
  pwLoading.value = true;
  try {
    await apiFetch("/api/auth/password", {
      method: "PATCH",
      body: { currentPassword: pwCurrent.value, newPassword: pwNew.value },
    });
    pwSuccess.value = "Password changed successfully";
    pwCurrent.value = ""; pwNew.value = ""; pwConfirm.value = "";
  } catch (err: any) {
    pwError.value = err?.data?.statusMessage || err?.statusMessage || "Failed to change password";
  } finally {
    pwLoading.value = false;
  }
}

// ── Users
const users = ref<any[]>([]);
const showAddUser = ref(false);
const editingUser = ref<any>(null);
const userForm = ref({ username: "", password: "", role: "user" });
const userFormError = ref("");
const savingUser = ref(false);

async function fetchUsers() {
  try {
    const data = await apiFetch<any>("/api/users");
    users.value = data.users;
  } catch { /* ignore */ }
}

function editUser(u: any) {
  editingUser.value = u;
  userForm.value = { username: u.username, password: "", role: u.role };
  showAddUser.value = false;
}

function closeUserModal() {
  showAddUser.value = false;
  editingUser.value = null;
  userForm.value = { username: "", password: "", role: "user" };
  userFormError.value = "";
}

async function saveUser() {
  savingUser.value = true;
  userFormError.value = "";

  try {
    if (editingUser.value) {
      const body: any = { username: userForm.value.username, role: userForm.value.role };
      if (userForm.value.password) body.password = userForm.value.password;
      try {
        await apiFetch(`/api/users/${editingUser.value.id}`, {
          method: "PATCH",
          body,
        });
      } catch (err: any) {
        userFormError.value = err?.data?.statusMessage || err?.statusMessage;
        toast.error(err?.data?.statusMessage || "Failed to save user");
        savingUser.value = false;
        return;
      }
    } else {
      try {
        await apiFetch("/api/users", {
          method: "POST",
          body: userForm.value,
        });
      } catch (err: any) {
        userFormError.value = err?.data?.statusMessage || err?.statusMessage;
        toast.error(err?.data?.statusMessage || "Failed to create user");
        savingUser.value = false;
        return;
      }
    }
    closeUserModal();
    toast.success(editingUser.value ? "User updated" : "User created");
    await fetchUsers();
  } catch { /* ignore */ }
  savingUser.value = false;
}

async function deleteUser(u: any) {
  if (!confirm(`Delete user "${u.username}"?`)) return;
  try {
    await apiFetch(`/api/users/${u.id}`, { method: "DELETE" });
    toast.success(`User "${u.username}" deleted`);
    await fetchUsers();
  } catch { /* ignore */ }
}

// ── Libraries
const folders = ref<any[]>([]);
const showAddFolder = ref(false);
const editingFolder = ref<any>(null);
const folderForm = ref({
  path: "", label: "", type: "local",
  smb_host: "", smb_share: "", smb_username: "", smb_password: "", smb_domain: "",
  active: true,
});
const folderFormError = ref("");
const savingFolder = ref(false);

async function fetchFolders() {
  try {
    const data = await apiFetch<any>("/api/library");
    folders.value = data.folders;
  } catch { /* ignore */ }
}

function editFolder(f: any) {
  editingFolder.value = f;
  folderForm.value = {
    path: f.path, label: f.label, type: f.type,
    smb_host: f.smb_host, smb_share: f.smb_share,
    smb_username: f.smb_username, smb_password: f.smb_password, smb_domain: f.smb_domain,
    active: !!f.active,
  };
  showAddFolder.value = false;
}

function closeFolderModal() {
  showAddFolder.value = false;
  editingFolder.value = null;
  folderForm.value = { path: "", label: "", type: "local", smb_host: "", smb_share: "", smb_username: "", smb_password: "", smb_domain: "", active: true };
  folderFormError.value = "";
}

async function saveFolder() {
  savingFolder.value = true;
  folderFormError.value = "";
  try {
    if (editingFolder.value) {
      try {
        await apiFetch(`/api/library/${editingFolder.value.id}`, {
          method: "PATCH",
          body: { ...folderForm.value, active: folderForm.value.active ? 1 : 0 },
        });
      } catch (err: any) {
        folderFormError.value = err?.data?.statusMessage || err?.statusMessage;
        toast.error(err?.data?.statusMessage || "Failed to save folder");
        savingFolder.value = false;
        return;
      }
    } else {
      try {
        await apiFetch("/api/library", {
          method: "POST",
          body: folderForm.value,
        });
      } catch (err: any) {
        folderFormError.value = err?.data?.statusMessage || err?.statusMessage;
        toast.error(err?.data?.statusMessage || "Failed to add folder");
        savingFolder.value = false;
        return;
      }
    }
    closeFolderModal();
    toast.success(editingFolder.value ? "Folder updated" : "Folder added");
    await fetchFolders();
  } catch { /* ignore */ }
  savingFolder.value = false;
}

async function deleteFolder(f: any) {
  if (!confirm(`Delete folder "${f.label || f.path}"?`)) return;
  try {
    await apiFetch(`/api/library/${f.id}`, { method: "DELETE" });
    toast.success(`Folder "${f.label || f.path}" deleted`);
    await fetchFolders();
  } catch { /* ignore */ }
}

// ── Settings
const settingsForm = ref({ comic_vine_api_key: "", cache_ttl: "3600" });
const settingsError = ref("");
const savingSettings = ref(false);

async function fetchSettings() {
  try {
    const data = await apiFetch<any>("/api/settings");
    settingsForm.value.comic_vine_api_key = data.settings.comic_vine_api_key || "";
    settingsForm.value.cache_ttl = data.settings.cache_ttl || "3600";
  } catch { /* ignore */ }
}

async function saveSettings() {
  savingSettings.value = true;
  settingsError.value = "";
  try {
    await apiFetch("/api/settings", {
      method: "PUT",
      body: settingsForm.value,
    });
    toast.success("Settings saved");
  } catch (err: any) {
    settingsError.value = err?.data?.statusMessage || err?.statusMessage;
  }
  savingSettings.value = false;
}

// ── Helpers
function formatDate(d: string): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString();
}

// ── Init
onMounted(async () => {
  await Promise.all([fetchUsers(), fetchFolders(), fetchSettings()]);
});
</script>

<style scoped>
.admin-page {
  flex: 1;
  padding: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.admin-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

/* ── Tabs ── */
.admin-tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  background: var(--color-bg-card);
  border-radius: var(--radius-sm);
  padding: 0.25rem;
}

.admin-tab {
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: all var(--transition);
}
.admin-tab:hover { color: var(--color-text); }
.admin-tab.active {
  background: var(--color-primary);
  color: white;
}

/* ── Sections ── */
.admin-section { display: flex; flex-direction: column; gap: 1rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; }
.section-header h3 { font-size: 1.1rem; font-weight: 600; }

/* ── Table ── */
.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.admin-table th {
  text-align: left;
  padding: 0.625rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-dim);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}
.admin-table td {
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--color-border);
}
.admin-table tr:last-child td { border-bottom: none; }

.date-cell { color: var(--color-text-muted); font-size: 0.8125rem; }
.path-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.actions-cell { display: flex; gap: 0.25rem; }

.role-badge, .type-badge {
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}
.role-badge.admin, .type-badge.smb { background: var(--color-primary-bg); color: var(--color-primary); }
.role-badge.user, .type-badge.local { background: rgba(139, 143, 163, 0.15); color: var(--color-text-muted); }
.type-badge.webdav { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }

.status-active { color: var(--color-success); font-weight: 500; font-size: 0.8125rem; }
.status-inactive { color: var(--color-text-dim); font-size: 0.8125rem; }
.empty-text { color: var(--color-text-muted); font-size: 0.875rem; padding: 2rem 0; text-align: center; }

/* ── Modals ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.modal {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.modal h3 { font-size: 1.1rem; font-weight: 600; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }
.field label { font-size: 0.8125rem; font-weight: 500; color: var(--color-text-muted); }
.field input, .field select {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text);
}
.form-error { font-size: 0.8125rem; color: var(--color-danger); }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem; }

/* ── Settings form ── */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
}
</style>
