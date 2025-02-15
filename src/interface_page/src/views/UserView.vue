<template>
  <div class="background">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">Loading...</div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">{{ success }}</div>

    <!-- Left Top Container -->
    <div class="left-top-container">
      <div class="visible-container">
        <button class="change-button" @click="isEditing = !isEditing">
          {{ isEditing ? 'Save' : 'Edit' }}
        </button>
        <div class="lefttop-left">
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
        </div>
        <div class="lefttop-right" v-if="!isEditing">
          <h1>{{ user?.lastName || 'No Last Name' }}</h1>
          <h2>{{ user?.firstName || 'No First Name' }}</h2>
        </div>
        <div v-else class="lefttop-right edit-form">
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

    <!-- Left Bottom Container -->
    <div class="left-bottom-container">
      <div class="visible-container">
        <h1 class="left-bottom-header">My Family</h1>
        <div class="family-table-container">
          <table class="family-table">
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

    <!-- Right Container -->
    <div class="right-container">
      <div class="visible-container">
        <h1 class="right-header">All Users</h1>
        <div class="search-bar-container">
          <input
            type="text"
            class="search-bar"
            placeholder="Search users..."
            v-model="searchQuery"
          />
        </div>
        <div class="user-table-container">
          <table class="user-table">
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
      position: absolute;
      left: 80px;
      top: 0;
      width: calc(100% - 80px);
      height: 100%;
      background-color: var(--background-color);
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
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .error-message, .success-message {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: 4px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
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
      width: 150px;
      height: 150px;
      border-radius: 50%;
      overflow: hidden;
      margin-bottom: 20px;
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
      padding: 8px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      text-align: center;
      cursor: pointer;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .edit-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .edit-input:focus {
      border-color: #4CAF50;
      outline: none;
    }

    .save-button {
      padding: 10px 20px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.3s;
    }

    .save-button:hover {
      background: #45a049;
    }

    .change-button {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 8px 16px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.3s;
    }

    .change-button:hover {
      background: #1976D2;
    }

    .left-top-container, .left-bottom-container, .right-container {
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .left-top-container {
      top: 0;
      left: 0;
      width: 50%;
      height: 50%;
    }

    .left-bottom-container {
      bottom: 0;
      left: 0;
      width: 50%;
      height: 50%;
    }

    .right-container {
      top: 0;
      right: 0;
      width: 50%;
      height: 100%;
    }

    .left-bottom-header {
      position: absolute;
      top: 10px;
      left: 10px;
    }

    .visible-container {
      position: relative;
      width: 80%;
      height: 80%;
      background-color: #fff;
      border-radius: 24px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
      z-index: 1;
    }

    .lefttop-left, .lefttop-right {
      position: absolute;
      height: 100%;
    }

    .lefttop-left {
      left: 0;
      width: 50%;
      display: flex;
      align-items: center;
      margin-left: 30px;
    }

    .lefttop-right {
    position: absolute;
    right: 0;
    top: 0;
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    margin-right: 30px;
  }

  .lefttop-right::before {
    content: "";
    position: absolute;
    top: 100px; /* Adjust top offset */
    left: -10px;
    height: calc(100% - 200px); /* Adjust height */
    border: 1px solid red; /* Border styling */
    pointer-events: none; /* Ensure it doesn't block clicks on the container */
  }


    .change-button {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 30px;
      background-color: var(--primary-color);
      border-radius: 24px;
      z-index: 1;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.3s ease;
    }

    .change-button:hover {
      background-color: var(--secondary-color);
      transform: scale(1.05);
    }

    .profile {
      width: 200px;
      height: 200px;
      background-color: rgb(197, 45, 45);
      border-radius: 50%;
      overflow: hidden;
    }

    .profile-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .family-table-container, .user-table-container {
      width: calc(100% - 30px);
      height: calc(100% - 80px);
      margin: 15px;
      overflow-y: auto;
    }

    .family-table-container {
      margin-top: 70px;
    }

    .user-table-container {
      margin-top: 30px;
    }

    .family-table, .user-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }


    .family-table th, .family-table td, .user-table th, .user-table td {
      padding: 10px;
      border: 1px solid #ddd;
      text-align: center;
      width: 20%;
    }

    .table-profile-pic {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
    }

    .table-button {
      padding: 5px 10px;
      border: none;
      border-radius: 5px;
      background-color: var(--primary-color);
      color: #fff;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .table-button:hover {
      background-color: var(--secondary-color);
    }

    .search-bar-container {
      margin: 15px;
      text-align: center;
    }

    .search-bar {
      width: 80%;
      margin-top: 50px;
      border: 1px solid #241a1a;
      background-color: rgb(241, 241, 241);
      border-radius: 24px;
      font-size: 16px;
    }

    .right-header {
      position: absolute;
      top: 10px;
      left: 10px;
    }
  </style>
