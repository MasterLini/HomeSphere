<template>
  <div class="background">
    <!-- Left Top Container -->
    <div class="left-top-container">
      <div class="visible-container">
        <button class="change-button">Bearbeiten</button>
        <div class="lefttop-left">
          <div class="profile">
            <img
              class="profile-image"
              src="https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-980x653.jpg"
              alt="Profile Picture"
            />
          </div>
        </div>
        <div class="lefttop-right">
          <h1>Mustermann</h1>
          <h2>Max</h2>
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
export default {
  data() {
    return {
      familyMembers: [], // For family members table
      allUsers: [], // For all users table
      searchQuery: '', // For search bar
    }
  },

  computed: {
    filteredUsers() {
      return this.allUsers.filter(user => {
        const searchLower = this.searchQuery.toLowerCase()
        return user.username.toLowerCase().includes(searchLower) ||
               user.name.toLowerCase().includes(searchLower)
      })
    }
  },

  methods: {
    async fetchUsers() {
      try {
        const response = await fetch('http://localhost:3000/users')
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        this.allUsers = await response.json()
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    },

    async fetchFamilyMembers() {
      try {
        // Assuming we have the family ID stored somewhere
        const familyId = localStorage.getItem('familyId') 
        if (!familyId) return

        const response = await fetch(`http://localhost:3000/family/${familyId}/members`)
        if (!response.ok) {
          throw new Error('Failed to fetch family members')
        }
        this.familyMembers = await response.json()
      } catch (error) {
        console.error('Error fetching family members:', error)
      }
    },

    async changeRole(userId) {
      // TODO: Implement role change functionality
      console.log('Change role for user:', userId)
    },

    async removeMember(userId) {
      // TODO: Implement member removal functionality  
      console.log('Remove member:', userId)
    }
  },

  mounted() {
    this.fetchUsers()
    this.fetchFamilyMembers()
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
