<template>
  <div class="background">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">Loading...</div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">{{ success }}</div>

    <!-- If user is not in a family, show a section to create one -->
    <div v-if="!user?.family" class="create-family-section">
      <h2>You are not part of a family yet</h2>
      <input v-model="newFamilyName" placeholder="Enter family name" />
      <button @click="createFamily">Create Family</button>
    </div>

    <!-- Else, display the regular layout -->
    <div v-else class="main-layout">
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
                  <td>{{ member.firstName }} {{ member.lastName }}</td>
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
                <td>{{ user.firstName }} {{ user.lastName }}</td>
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
  searchUsers
} from '@/api/auth';
import {
  getFamilyMembers,
  promoteMember,
  demoteMember,
  removeFamilyMember,
  createFamily
} from '@/api/family';

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

      // For creating a family if not in one
      newFamilyName: '',

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
      success: null
    }
  },

  async mounted() {
    try {
      this.loading = true;
      console.log('[DEBUG] Initializing UserView');

      // Fetch user info from the backend
      const response = await getUserInfo();
      this.user = response.data.user;
      this.editedProfile = {
        username: this.user.username,
        email: this.user.email,
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || ''
      };

      // If the user already belongs to a family, load its members
      if (this.user.family) {
        await this.loadFamilyMembers();
      }
      // Load list of all users
      await this.searchAllUsers();
    } catch (error) {
      console.error('[DEBUG] Error initializing UserView:', error);
      this.error = 'Failed to load user profile. Please try again.';
    } finally {
      this.loading = false;
    }
  },

  watch: {
    searchQuery: {
      handler: 'searchAllUsers'
    },
    'user.family': {
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
        const response = await searchUsers(this.searchQuery);
        this.allUsers = response.data;
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
        const familyId = this.user?.family;
        if (!familyId) {
          console.warn('[DEBUG] No family ID available');
          return;
        }
        const response = await getFamilyMembers(familyId);
        this.familyMembers = response.data;
      } catch (error) {
        console.error('[DEBUG] Error loading family members:', error);
        this.error = 'Failed to load family members. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async createFamily() {
      try {
        if (!this.newFamilyName) {
          this.error = "Please provide a family name.";
          return;
        }
        this.loading = true;
        await createFamily({ name: this.newFamilyName });
        this.success = "Family created successfully.";
        // Refresh user info so that user.family gets updated
        const response = await getUserInfo();
        this.user = response.data.user;
        // Load family members for the newly created family
        await this.loadFamilyMembers();
      } catch (error) {
        console.error('[DEBUG] Error creating family:', error);
        this.error = 'Failed to create family. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async changeRole(userId) {
      try {
        this.loading = true;
        const newRole = prompt('Enter new role (admin/member):');
        if (!newRole || (newRole !== 'admin' && newRole !== 'member')) {
          alert('Invalid role. Please enter either "admin" or "member".');
          return;
        }
        if (newRole === 'admin') {
          await promoteMember(userId);
        } else {
          await demoteMember(userId);
        }
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
        const response = await getUserInfo();
        this.user = response.data.user;
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
        const response = await getUserInfo();
        this.user = response.data.user;
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
/* (Your existing styles remain unchanged) */
.create-family-section {
  background: #fff;
  border-radius: 1rem;
  padding: 1rem;
  margin: 1rem auto;
  max-width: 30rem;
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.1);
  text-align: center;
}
.create-family-section input {
  width: 80%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}
.create-family-section button {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}
</style>
