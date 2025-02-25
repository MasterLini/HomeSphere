<template>
  <div class="dashboard">
    <!-- Top Navigation -->
    <header class="header">
      <div class="logo">
        <h1>Profile Hub</h1>
      </div>
      <div class="tabs">
        <button :class="{ active: activeTab==='profile' }" @click="activeTab = 'profile'">
          <span class="icon">👤</span> Profile
        </button>
        <button :class="{ active: activeTab==='family' }" @click="activeTab = 'family'">
          <span class="icon">👪</span> Family
        </button>
      </div>
    </header>

    <!-- Toast Notification -->
    <div v-if="toastMessage" class="toast">
      {{ toastMessage }}
    </div>

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Profile Section -->
      <section v-if="activeTab === 'profile'" class="section-container">
        <div class="section-header">
          <h2>Your Profile</h2>
        </div>
        <div v-if="profileError" class="error-message">{{ profileError }}</div>

        <!-- View Mode -->
        <div v-if="!isEditing" class="profile-view card">
          <div class="profile-info">
            <div class="profile-image">
              <img :src="profile.profileImage === 'default-profile.png' ? iconUrl : profile.profileImage" alt="Profile Image" />

            </div>
            <div class="profile-details">
              <h3>{{ profile.firstName }} {{ profile.lastName }}</h3>
              <p class="username">@{{ profile.username }}</p>
              <p class="email">{{ profile.email }}</p>
              <button class="btn primary" @click="startEditing">Edit Profile</button>
            </div>
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="profile-edit card">
          <form @submit.prevent="saveProfile">
            <div class="form-grid">
              <div class="form-group">
                <label>Username</label>
                <input v-model="profile.username" type="text" required />
              </div>
              <div class="form-group">
                <label>First Name</label>
                <input v-model="profile.firstName" type="text" required />
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input v-model="profile.lastName" type="text" required />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input v-model="profile.email" type="email" required />
              </div>
              <div class="form-group full-width">
                <label>Profile Image URL</label>
                <input v-model="profile.profileImage" type="text" />
              </div>
            </div>
            <div class="action-buttons">
              <button type="submit" class="btn primary" :disabled="profileLoading">
                {{ profileLoading ? "Saving..." : "Save Changes" }}
              </button>
              <button type="button" class="btn secondary" @click="cancelEditing">Cancel</button>
            </div>
          </form>
        </div>
      </section>

      <!-- Family Section -->
      <section v-else class="section-container">
        <div class="section-header">
          <h2>Family Management</h2>
        </div>
        <div v-if="familyError" class="error-message">{{ familyError }}</div>

        <!-- If the user is not in a family -->
        <div v-if="!user.family" class="no-family">
          <div class="info-card">
            <div class="icon-container">
              <span class="large-icon">👨‍👩‍👧‍👦</span>
            </div>
            <p>You are not currently part of a family. Create a new family or join an existing one.</p>
          </div>

          <div class="option-cards">
            <div class="card">
              <h3>Create Family</h3>
              <form @submit.prevent="createFamily">
                <div class="form-group">
                  <label>Family Name</label>
                  <input v-model="newFamilyName" type="text" required placeholder="Enter family name" />
                </div>
                <button type="submit" class="btn primary full-width" :disabled="familyLoading">
                  {{ familyLoading ? "Creating..." : "Create Family" }}
                </button>
              </form>
            </div>

            <div class="card">
              <h3>Join Family</h3>
              <form @submit.prevent="joinFamily">
                <div class="form-group">
                  <label>Join Code</label>
                  <input v-model="joinCode" type="text" required placeholder="Enter join code" />
                </div>
                <button type="submit" class="btn primary full-width" :disabled="familyLoading">
                  {{ familyLoading ? "Joining..." : "Join Family" }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- If the user is in a family -->
        <div v-else class="in-family">
          <div class="family-info card">
            <div class="family-header">
              <h3>Your Family: {{ user.family.name }}</h3>
              <div class="join-code">
                <span>Join Code:</span>
                <code>{{ user.family.joinCode }}</code>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>Family Members</h3>
            </div>
            <div class="members-list">
              <table>
                <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="member in familyMembers" :key="member.userId">
                  <td>{{ member.username }}</td>
                  <td>
                      <span :class="['badge', member.role === 'admin' ? 'admin' : 'member']">
                        {{ member.role }}
                      </span>
                  </td>
                  <td class="actions">
                    <button v-if="canManage && member.userId !== user._id && member.role==='member'" @click="promote(member.userId)" class="btn small">
                      Promote
                    </button>
                    <button v-if="canManage && member.userId !== user._id && member.role==='admin'" @click="demote(member.userId)" class="btn small">
                      Demote
                    </button>
                    <button v-if="canManage && member.userId !== user._id" @click="removeMember(member.userId)" class="btn small danger">
                      Remove
                    </button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>Invite New Member</h3>
            </div>
            <form @submit.prevent="inviteMember" class="invite-form">
              <div class="form-group">
                <label>Email</label>
                <div class="input-with-button">
                  <input v-model="inviteEmail" type="email" required placeholder="Enter email address" />
                  <button type="submit" class="btn primary" :disabled="familyLoading">
                    {{ familyLoading ? "Sending..." : "Send" }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { getUserInfo, editProfile } from "@/api/auth";
import { createFamily, joinFamily, inviteToFamily, promoteMember, demoteMember, getFamilyMembers, removeFamilyMember } from "@/api/family";

export default {
  name: "Dashboard",
  data() {
    return {
      activeTab: "profile",
      user: {},
      profile: {},
      isEditing: false,
      profileLoading: false,
      profileError: "",
      // Family-related state
      newFamilyName: "",
      joinCode: "",
      inviteEmail: "",
      familyMembers: [],
      familyLoading: false,
      familyError: "",
      toastMessage: ""
    };
  },
  computed: {
    canManage() {
      if (!this.familyMembers.length) return false;
      const current = this.familyMembers.find(m => m.userId === this.user._id);
      return current && current.role === "admin";
    },
    iconUrl(){
      return require("@/assets/default.jpg");
    }
  },
  methods: {
    async loadUser() {
      try {
        const res = await getUserInfo();
        this.user = res.data.user;
        this.profile = { ...this.user };
        if (this.user.family) {
          const resFam = await getFamilyMembers(this.user.family);
          this.familyMembers = resFam.data;
        } else {
          this.familyMembers = [];
        }
      } catch (error) {
        console.error("Error loading user:", error);
        this.showToast("Failed to load user information.");
      }
    },
    startEditing() {
      this.isEditing = true;
      this.profile = { ...this.user };
    },
    async saveProfile() {
      this.profileError = "";
      this.profileLoading = true;
      try {
        const res = await editProfile(this.profile);
        this.user = res.data.user;
        this.isEditing = false;
        this.showToast("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
        this.profileError = error.response?.data?.message || "Failed to update profile.";
      } finally {
        this.profileLoading = false;
      }
    },
    cancelEditing() {
      this.isEditing = false;
    },
    async createFamily() {
      this.familyError = "";
      this.familyLoading = true;
      try {
        await createFamily({ name: this.newFamilyName });
        this.showToast("Family created successfully!");
        await this.loadUser();
      } catch (error) {
        console.error("Error creating family:", error);
        this.familyError = error.response?.data?.message || "Failed to create family.";
      } finally {
        this.familyLoading = false;
      }
    },
    async joinFamily() {
      this.familyError = "";
      this.familyLoading = true;
      try {
        await joinFamily(this.joinCode);
        this.showToast("Joined family successfully!");
        await this.loadUser();
      } catch (error) {
        console.error("Error joining family:", error);
        this.familyError = error.response?.data?.message || "Failed to join family.";
      } finally {
        this.familyLoading = false;
      }
    },
    async inviteMember() {
      this.familyError = "";
      this.familyLoading = true;
      try {
        await inviteToFamily(this.inviteEmail);
        this.showToast("Invitation sent successfully!");
        this.inviteEmail = "";
      } catch (error) {
        console.error("Error inviting member:", error);
        this.familyError = error.response?.data?.message || "Failed to invite member.";
      } finally {
        this.familyLoading = false;
      }
    },
    async promote(memberId) {
      this.familyError = "";
      this.familyLoading = true;
      try {
        await promoteMember(memberId);
        this.showToast("Member promoted to admin.");
        await this.loadUser();
      } catch (error) {
        console.error("Error promoting member:", error);
        this.familyError = error.response?.data?.message || "Failed to promote member.";
      } finally {
        this.familyLoading = false;
      }
    },
    async demote(memberId) {
      this.familyError = "";
      this.familyLoading = true;
      try {
        await demoteMember(memberId);
        this.showToast("Member demoted.");
        await this.loadUser();
      } catch (error) {
        console.error("Error demoting member:", error);
        this.familyError = error.response?.data?.message || "Failed to demote member.";
      } finally {
        this.familyLoading = false;
      }
    },
    async removeMember(memberId) {
      this.familyError = "";
      this.familyLoading = true;
      try {
        await removeFamilyMember(memberId);
        this.showToast("Member removed successfully.");
        await this.loadUser();
      } catch (error) {
        console.error("Error removing member:", error);
        this.familyError = error.response?.data?.message || "Failed to remove member.";
      } finally {
        this.familyLoading = false;
      }
    },
    showToast(message) {
      this.toastMessage = message;
      setTimeout(() => {
        this.toastMessage = "";
      }, 3000);
    }
  },
  mounted() {
    this.loadUser();
  }
};
</script>

<style scoped>
:root {
  --primary-color: #3498db;
  --secondary-color: #2c3e50;
  --accent-color: #ecf0f1;
  --danger-color: #e74c3c;
  --success-color: #2ecc71;
  --text-color: #333333;
  --light-text: #777777;
  --border-color: #e0e0e0;
  --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --animation-speed: 0.3s;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-color);
  background-color: #f9f9f9;
}

/* Layout */
.dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  color: white;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.tabs {
  display: flex;
  gap: 0.5rem;
}

.tabs button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: gray;
  font-size: 1rem;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all var(--animation-speed);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tabs button.active {
  background: white;
  color: var(--primary-color);
  font-weight: 600;
}

.tabs button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.2);
}

.icon {
  font-size: 1.2rem;
}

/* Toast notification */
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: var(--secondary-color);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s forwards;
  z-index: 9999;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Main content */
.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.section-container {
  background: transparent;
  width: 100%;
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--secondary-color);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 0.5rem;
  display: inline-block;
}

/* Cards */
.card {
  background: white;
  border-radius: 10px;
  box-shadow: var(--card-shadow);
  padding: 1.5rem;
  margin-bottom: 2rem;
  transition: box-shadow 0.3s;
}

.card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.card-header h3 {
  color: var(--secondary-color);
  margin: 0;
}

/* Profile view */
.profile-info {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.profile-image {
  flex-shrink: 0;
}

.profile-image img {
  min-width: 100px;
  min-height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-color);
}

.profile-details {
  flex: 1;
}

.profile-details h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
}

.username {
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.email {
  color: var(--light-text);
  margin-bottom: 1.5rem;
}

/* Form styling */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group.full-width {
  grid-column: span 2;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--secondary-color);
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color var(--animation-speed);
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

input::placeholder {
  color: #aaa;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--animation-speed);
}

.btn.primary {
  background: var(--primary-color);
  color: white;
}

.btn.primary:hover {
  background: #2980b9;
}

.btn.secondary {
  background: #e0e0e0;
  color: var(--text-color);
}

.btn.secondary:hover {
  background: #d0d0d0;
}

.btn.danger {
  background: var(--danger-color);
  color: white;
}

.btn.danger:hover {
  background: #c0392b;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn.full-width {
  width: 100%;
}

.btn.small {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

/* Error message */
.error-message {
  background: #FFECEC;
  color: var(--danger-color);
  padding: 1rem;
  border-left: 4px solid var(--danger-color);
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

/* Family section */
.option-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.info-card {
  background: #f1f7fa;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-left: 4px solid var(--primary-color);
}

.icon-container {
  background: var(--primary-color);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.large-icon {
  font-size: 30px;
}

.family-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.join-code {
  background: #f1f7fa;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.join-code code {
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  border: 1px solid var(--border-color);
  color: var(--primary-color);
}

/* Table styling */
.members-list {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  font-weight: 600;
  color: var(--secondary-color);
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f7fbff;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge.admin {
  background-color: #e3f2fd;
  color: #1976d2;
}

.badge.member {
  background-color: #f5f5f5;
  color: #616161;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

/* Input with button */
.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.input-with-button input {
  flex: 1;
}

.invite-form .form-group {
  margin-bottom: 0;
}

/* Responsive styles */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full-width {
    grid-column: span 1;
  }

  .option-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .profile-info {
    flex-direction: column;
    text-align: center;
  }

  .family-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
}
</style>