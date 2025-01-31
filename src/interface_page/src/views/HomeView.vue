<template>
  <div class="home-view">
    <div class="page-header">
      <h1>Welcome to HomeSphere</h1>
      <p class="subtitle">{{ this.joke }}</p>
    </div>
    
    <div class="content-grid">
      <div class="card quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button class="action-btn">
            <span class="icon">📝</span>
            New ToDo
          </button>
          <button class="action-btn">
            <span class="icon">📅</span>
            Schedule
          </button>
          <button class="action-btn">
            <span class="icon">🏠</span>
            Home Status
          </button>
          <button class="action-btn">
            <span class="icon">👥</span>
            Family
          </button>
        </div>
      </div>

      <div class="card recent-activity">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          <div class="activity-item">
            <span class="activity-icon">✨</span>
            <div class="activity-content">
              <h3>New ToDo Added</h3>
              <p>Buy groceries for the week</p>
              <span class="activity-time">2 hours ago</span>
            </div>
          </div>
          <div class="activity-item">
            <span class="activity-icon">🎉</span>
            <div class="activity-content">
              <h3>Task Completed</h3>
              <p>Clean the living room</p>
              <span class="activity-time">Yesterday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'HomeView',

  data() {
    return {
      joke: "",
    }
  },
  mounted() {
    this.getJoke()
  },
  methods: {
    async getJoke() {
      try {
        const response = await axios.get("https://witzapi.de/api/joke/");
        this.joke = response.data[0].text;
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
      }
    
    }
  }
  
}
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.subtitle {
  color: var(--text-color);
  opacity: 0.8;
  font-size: 1.1em;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.quick-actions {
  background: linear-gradient(135deg, #fff 0%, #f0f9f6 100%);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background-color: white;
  border-radius: 16px;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--shadow-color);
}

.action-btn .icon {
  font-size: 1.5em;
  margin-bottom: 0.5rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--background-color);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.activity-item:hover {
  transform: translateX(4px);
  background-color: #e6f4f1;
}

.activity-icon {
  font-size: 1.5em;
  background-color: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.activity-content {
  flex: 1;
}

.activity-content h3 {
  margin: 0;
  font-size: 1.1em;
  font-weight: 600;
}

.activity-content p {
  margin: 0.25rem 0;
  color: var(--text-color);
  opacity: 0.8;
}

.activity-time {
  font-size: 0.9em;
  color: var(--text-color);
  opacity: 0.6;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
