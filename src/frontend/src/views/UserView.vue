<template>
  <div class="background">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">Loading...</div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">{{ success }}</div>

    <div class="main-layout">
      <div class="left-section">
        <!-- Profile Section -->
        <div class="left-top-container">
          <div class="visible-container">
            <button class="change-button" @click="isEditing = !isEditing">
              {{ isEditing ? 'Save' : 'Edit' }}
            </button>
            <div class="profile-section">
              <div class="profile">
                <img
                  class="profile-image"
                  :src="user?.profileImage || 'default-profile.png'"
                  alt="Profile Picture"
                />
                <input
                  v-if="isEditing"
                  type="file"
                  accept="image/*"
                  @change="handleProfileImageUpload"
                  class="profile-image-input"
                />
              </div>
              <div class="profile-info" v-if="!isEditing">
                <h1>{{ user?.lastName || 'No Last Name' }}</h1>
                <h2>{{ user?.firstName || 'No First Name' }}</h2>
              </div>
              <div v-else class="edit-form">
                <input
                  v-model="editedProfile.firstName"
                  placeholder="First Name"
                  class="edit-input"
                />
                <input
                  v-model="editedProfile.lastName"
                  placeholder="Last Name"
                  class="edit-input"
                />
                <input
                  v-model="editedProfile.email"
                  placeholder="Email"
                  class="edit-input"
                />
                <button @click="updateProfile" class="save-button">
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Family Section -->
        <div class="left-bottom-container">
          <div class="visible-container">
            <h1 class="left-bottom-header">My Family</h1>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Profile Pic</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Change Role</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="member in familyMembers" :key="member.userId">
                    <td>
                      <img
                        class="table-profile-pic"
                        :src="member.profilePic || 'default-profile.png'"
                        alt="Profile Pic"
                      />
                    </td>
                    <td>{{ member.name }}</td>
                    <td>{{ member.username }}</td>
                    <td>
                      <button class="table-button" @click="changeRole(member.userId)">Change Role</button>
                    </td>
                    <td>
                      <button class="table-button" @click="removeMember(member.userId)">Remove</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Section -->
      <div class="right-container">
        <div class="visible-container">
          <h1 class="left-bottom-header">All Users</h1>
          <div class="search-bar-container">
            <input
              type="text"
              class="search-bar"
              placeholder="Search users..."
              v-model="searchQuery"
            />
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Profile Pic</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Change Role</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user._id">
                  <td>
                    <img
                      class="table-profile-pic"
                      :src="user.profilePic || 'default-profile.png'"
                      alt="Profile Pic"
                    />
                  </td>
                  <td>{{ user.name }}</td>
                  <td>{{ user.username }}</td>
                  <td>
                    <button class="table-button">Change Role</button>
                  </td>
                  <td>
                    <button class="table-button">Remove</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getUserInfo,
  updateUserProfile,
  updateUserPassword,
  uploadProfileImage,
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMemberRole,
  removeFamilyMember,
  searchUsers
} from '@/api/user';

export default {
  name: 'UserView',
  data() {
    return {
      // User data
      user: null,
      profileImage: null,

      // Family data
      familyMembers: [],
      allUsers: [],

      // Search
      searchQuery: '',

      // Edit state
      isEditing: false,
      editedProfile: {
        username: '',
        email: '',
        firstName: '',
        lastName: ''
      },

      // Password change
      passwordData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },

      // UI state
      loading: false,
      error: null,
      success: null,

      // Role options
      roleOptions: [
        { value: 'admin', label: 'Admin' },
        { value: 'parent', label: 'Parent' },
        { value: 'child', label: 'Child' },
        { value: 'guest', label: 'Guest' }
      ]
    }
  },

  async mounted() {
    try {
      this.loading = true;
      console.log('[DEBUG] Initializing UserView');

      // Get user info
      const userData = await getUserInfo();
      this.user = userData;
      this.editedProfile = {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || ''
      };

      // Load initial data
      await Promise.all([
        this.loadFamilyMembers(),
        this.searchAllUsers()
      ]);
    } catch (error) {
      console.error('[DEBUG] Error initializing UserView:', error);
      this.error = 'Failed to load user profile. Please try again.';
    } finally {
      this.loading = false;
    }
  },

  watch: {
    searchQuery: {
      handler: 'searchAllUsers',
      debounce: 300
    },
    'user.familyId': {
      handler: 'loadFamilyMembers',
      immediate: true
    }
  },

  computed: {
    fullName() {
      if (!this.user) return '';
      return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim() || 'No name set';
    },

    userRole() {
      return this.user?.role || 'user';
    },

    isAdmin() {
      return this.userRole === 'admin';
    },

    canManageFamily() {
      return ['admin', 'parent'].includes(this.userRole);
    },

    filteredUsers() {
      if (!this.searchQuery) return this.allUsers;
      const query = this.searchQuery.toLowerCase();
      return this.allUsers.filter(user => 
        (user.firstName?.toLowerCase().includes(query)) ||
        (user.lastName?.toLowerCase().includes(query)) ||
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }
  },

  methods: {
    async searchAllUsers() {
      try {
        this.loading = true;
        const users = await searchUsers(this.searchQuery);
        this.allUsers = users;
      } catch (error) {
        console.error('[DEBUG] Error searching users:', error);
        this.error = 'Failed to search users. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async loadFamilyMembers() {
      try {
        this.loading = true;
        const familyId = this.user?.familyId;
        if (!familyId) {
          console.warn('[DEBUG] No family ID available');
          return;
        }
        const members = await getFamilyMembers(familyId);
        this.familyMembers = members;
      } catch (error) {
        console.error('[DEBUG] Error loading family members:', error);
        this.error = 'Failed to load family members. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async changeRole(userId) {
      try {
        this.loading = true;
        const newRole = prompt('Enter new role (admin/parent/child/guest):');
        if (!newRole) return;

        await updateFamilyMemberRole(userId, newRole);
        await this.loadFamilyMembers();
        this.success = 'Role updated successfully';
      } catch (error) {
        console.error('[DEBUG] Error changing role:', error);
        this.error = 'Failed to change role. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async removeMember(userId) {
      try {
        if (!confirm('Are you sure you want to remove this member?')) return;

        this.loading = true;
        await removeFamilyMember(userId);
        await this.loadFamilyMembers();
        this.success = 'Member removed successfully';
      } catch (error) {
        console.error('[DEBUG] Error removing member:', error);
        this.error = 'Failed to remove member. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async updateProfile() {
      try {
        this.loading = true;
        await updateUserProfile(this.editedProfile);
        this.user = await getUserInfo();
        this.isEditing = false;
        this.success = 'Profile updated successfully';
      } catch (error) {
        console.error('[DEBUG] Error updating profile:', error);
        this.error = 'Failed to update profile. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async updatePassword() {
      try {
        if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
          this.error = 'New passwords do not match';
          return;
        }

        this.loading = true;
        await updateUserPassword(this.passwordData);
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.success = 'Password updated successfully';
      } catch (error) {
        console.error('[DEBUG] Error updating password:', error);
        this.error = 'Failed to update password. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async handleProfileImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        this.loading = true;
        await uploadProfileImage(file);
        this.user = await getUserInfo();
        this.success = 'Profile image updated successfully';
      } catch (error) {
        console.error('[DEBUG] Error uploading profile image:', error);
        this.error = 'Failed to upload profile image. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  }
}

</script>

  <style scoped>
    .background {
      position: relative;
      margin-left: clamp(4rem, 8vw, 5rem);
      width: calc(100% - clamp(4rem, 8vw, 5rem));
      min-height: 100vh;
      background-color: var(--background-color);
      padding: clamp(1rem, 3vw, 2rem);
      overflow-x: hidden;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .loading-spinner {
      background: white;
      padding: clamp(1rem, 3vw, 1.25rem);
      border-radius: clamp(0.5rem, 2vw, 0.75rem);
      box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.1);
      font-size: clamp(0.875rem, 2.5vw, 1rem);
    }

    .error-message, .success-message {
      position: fixed;
      top: clamp(1rem, 3vw, 1.25rem);
      right: clamp(1rem, 3vw, 1.25rem);
      padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem);
      border-radius: clamp(0.25rem, 1vw, 0.5rem);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      font-size: clamp(0.875rem, 2.5vw, 1rem);
      max-width: min(90vw, 25rem);
    }

    .error-message {
      background: #ff4444;
      color: white;
    }

    .success-message {
      background: #44ff44;
      color: black;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .profile {
      position: relative;
      width: clamp(8rem, 20vw, 9.375rem);
      height: clamp(8rem, 20vw, 9.375rem);
      border-radius: 50%;
      overflow: hidden;
      margin-bottom: clamp(1rem, 3vw, 1.25rem);
      box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.1);
    }

    .profile-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .profile-image-input {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: clamp(0.5rem, 1.5vw, 0.75rem);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      text-align: center;
      cursor: pointer;
      font-size: clamp(0.75rem, 2vw, 0.875rem);
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: clamp(0.75rem, 2vw, 1rem);
      padding: clamp(1rem, 3vw, 1.25rem);
      background: white;
      border-radius: clamp(0.5rem, 2vw, 0.75rem);
      box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: min(100%, 30rem);
    }

    .edit-input {
      padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem);
      border: 1px solid #ddd;
      border-radius: clamp(0.25rem, 1vw, 0.5rem);
      font-size: clamp(0.875rem, 2.5vw, 1rem);
      width: 100%;
    }

    .edit-input:focus {
      border-color: #4CAF50;
      outline: none;
      box-shadow: 0 0 0 0.1875rem rgba(76, 175, 80, 0.1);
    }

    .save-button, .change-button {
      padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.25rem);
      color: white;
      border: none;
      border-radius: clamp(0.25rem, 1vw, 0.5rem);
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      font-size: clamp(0.875rem, 2.5vw, 1rem);
      min-height: 2.75rem;
    }

    .save-button {
      background: #4CAF50;
      width: 100%;
    }

    .save-button:hover {
      background: #45a049;
      transform: translateY(-1px);
    }

    .change-button {
      position: absolute;
      top: clamp(0.75rem, 2vw, 1rem);
      right: clamp(0.75rem, 2vw, 1rem);
      background: #2196F3;
      z-index: 2;
    }

    .change-button:hover {
      background: #1976D2;
      transform: translateY(-1px);
    }

    .main-layout {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: clamp(1rem, 3vw, 2rem);
      width: 100%;
      min-height: calc(100vh - clamp(2rem, 6vw, 4rem));
    }

    .left-section {
      display: grid;
      grid-template-rows: auto 1fr;
      gap: clamp(1rem, 3vw, 2rem);
    }

    .left-top-container, .left-bottom-container, .right-container {
      background-color: #fff;
      border-radius: clamp(1rem, 3vw, 1.5rem);
      box-shadow: 0 0.25rem 1.5rem rgba(0, 0, 0, 0.05);
      padding: clamp(1rem, 3vw, 1.5rem);
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .left-bottom-header {
      font-size: clamp(1.25rem, 4vw, 1.5rem);
      margin-bottom: clamp(1rem, 3vw, 1.5rem);
      color: var(--text-color);
      font-weight: 600;
    }

    .visible-container {
      display: flex;
      flex-direction: column;
      gap: clamp(1rem, 3vw, 1.5rem);
      width: 100%;
      height: 100%;
      position: relative;
    }

    .profile-section {
      display: flex;
      gap: clamp(1.5rem, 4vw, 2rem);
      align-items: center;
      flex-wrap: wrap;
      padding: clamp(1rem, 3vw, 1.5rem);
    }

    .profile-info {
      flex: 1;
      min-width: min(100%, 15rem);
    }

    .search-bar-container {
      width: 100%;
      margin-bottom: clamp(1rem, 3vw, 1.5rem);
    }

    .search-bar {
      width: 100%;
      padding: clamp(0.75rem, 2vw, 1rem);
      border: 1px solid #e2e8f0;
      border-radius: clamp(0.5rem, 2vw, 0.75rem);
      font-size: clamp(0.875rem, 2.5vw, 1rem);
      background-color: white;
    }

    .search-bar:focus {
      outline: none;
      border-color: #4fd1c5;
      box-shadow: 0 0 0 0.1875rem rgba(79, 209, 197, 0.1);
    }

    .table-container {
      width: 100%;
      overflow-x: auto;
      border-radius: clamp(0.5rem, 2vw, 0.75rem);
      background: white;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 600px;
    }

    th, td {
      padding: clamp(0.75rem, 2vw, 1rem);
      text-align: left;
      font-size: clamp(0.875rem, 2.5vw, 1rem);
      border-bottom: 1px solid #e2e8f0;
    }

    th {
      font-weight: 600;
      background-color: #f8fafc;
      color: #475569;
    }

    .table-profile-pic {
      width: clamp(2.5rem, 8vw, 3rem);
      height: clamp(2.5rem, 8vw, 3rem);
      border-radius: 50%;
      object-fit: cover;
    }

    .table-button {
      padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem);
      border: none;
      border-radius: clamp(0.25rem, 1vw, 0.5rem);
      background-color: #4fd1c5;
      color: white;
      cursor: pointer;
      font-size: clamp(0.75rem, 2vw, 0.875rem);
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .table-button:hover {
      background-color: #38b2ac;
      transform: translateY(-1px);
    }

    @media (max-width: 1024px) {
      .main-layout {
        grid-template-columns: 1fr;
      }

      .left-section {
        gap: clamp(0.75rem, 2vw, 1rem);
      }
    }

    @media (max-width: 768px) {
      .background {
        margin-left: 0;
        width: 100%;
        padding: 0.75rem;
      }

      .profile-section {
        padding: 0.75rem;
      }

      .table-button {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
      }
    }

    @media (max-width: 480px) {
      .visible-container {
        gap: 0.75rem;
      }

      th, td {
        padding: 0.5rem;
        font-size: 0.875rem;
      }

      .table-profile-pic {
        width: 2rem;
        height: 2rem;
      }
    }


    .profile-info h1 {
      font-size: clamp(1.5rem, 5vw, 2rem);
      color: var(--text-color);
      margin-bottom: clamp(0.5rem, 2vw, 0.75rem);
      font-weight: 600;
    }

    .profile-info h2 {
      font-size: clamp(1.25rem, 4vw, 1.5rem);
      color: var(--text-color);
      opacity: 0.8;
      font-weight: 500;
    }

    .profile {
      width: clamp(8rem, 20vw, 12.5rem);
      height: clamp(8rem, 20vw, 12.5rem);
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.1);
    }

    .profile-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .family-table-container, .user-table-container {
      width: 100%;
      height: 100%;
      padding: clamp(0.75rem, 2vw, 1rem);
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      background: white;
      border-radius: clamp(0.5rem, 2vw, 0.75rem);
      box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.05);
    }

    .family-table-container {
      margin-top: clamp(2rem, 5vw, 2.5rem);
    }

    .user-table-container {
      margin-top: clamp(1rem, 3vw, 1.5rem);
    }

    .family-table, .user-table {
      width: 100%;
      min-width: 600px;
      border-collapse: collapse;
      text-align: left;
    }

    .family-table th, .family-table td, .user-table th, .user-table td {
      padding: clamp(0.75rem, 2vw, 1rem);
      border: 1px solid #e2e8f0;
      text-align: left;
      font-size: clamp(0.875rem, 2.5vw, 1rem);
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      .family-table-container, .user-table-container {
        padding: 0.5rem;
        margin: 0.75rem -0.5rem;
        border-radius: 0;
      }

      .family-table th, .family-table td,
      .user-table th, .user-table td {
        padding: 0.75rem;
        font-size: 0.875rem;
      }
    }

    @media (max-width: 480px) {
      .family-table th, .family-table td,
      .user-table th, .user-table td {
        padding: 0.5rem;
      }
    }

    .table-profile-pic {
      width: clamp(2.5rem, 8vw, 3.125rem);
      height: clamp(2.5rem, 8vw, 3.125rem);
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 480px) {
      .table-profile-pic {
        width: 2rem;
        height: 2rem;
      }
    }

    .table-button {
      padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem);
      border: none;
      border-radius: clamp(0.25rem, 1vw, 0.5rem);
      background-color: #4fd1c5;
      color: #fff;
      cursor: pointer;
      font-size: clamp(0.75rem, 2vw, 0.875rem);
      font-weight: 500;
      transition: all 0.2s ease;
      white-space: nowrap;
      min-height: 2.25rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .table-button:hover {
      background-color: #38b2ac;
      transform: translateY(-1px);
      box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
      .table-button {
        padding: 0.5rem 0.75rem;
        min-height: 2rem;
      }
    }

    .search-bar-container {
      margin: clamp(0.75rem, 2vw, 1rem);
      width: 100%;
    }

    .search-bar {
      width: 100%;
      padding: clamp(0.75rem, 2vw, 1rem);
      border: 1px solid #e2e8f0;
      background-color: white;
      border-radius: clamp(0.75rem, 2vw, 1rem);
      font-size: clamp(0.875rem, 2.5vw, 1rem);
      transition: all 0.2s ease;
    }

    .search-bar:focus {
      outline: none;
      border-color: #4fd1c5;
      box-shadow: 0 0 0 0.1875rem rgba(79, 209, 197, 0.1);
    }

    @media (max-width: 768px) {
      .search-bar-container {
        margin: 0.75rem;
      }

      .search-bar {
        padding: 0.75rem;
      }
    }

    .right-header {
      font-size: clamp(1.25rem, 4vw, 1.5rem);
      color: var(--text-color);
      margin-bottom: clamp(1rem, 3vw, 1.5rem);
      padding: clamp(0.75rem, 2vw, 1rem);
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .right-header {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
      }
    }
  </style>
