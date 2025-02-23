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
  padding: clamp(1rem, 4vw, 2rem);
}

.page-header {
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
  text-align: center;
}

.page-header h1 {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-color);
  opacity: 0.8;
  font-size: clamp(1rem, 3vw, 1.1rem);
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: clamp(1rem, 4vw, 2rem);
  margin-top: clamp(1rem, 4vw, 2rem);
}

.quick-actions {
  background: linear-gradient(135deg, #fff 0%, #f0f9f6 100%);
  padding: clamp(1rem, 3vw, 1.5rem);
  border-radius: clamp(0.75rem, 2vw, 1rem);
}

.quick-actions h2 {
  font-size: clamp(1.25rem, 4vw, 1.5rem);
  margin-bottom: 1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
  gap: clamp(0.75rem, 2vw, 1rem);
  margin-top: clamp(0.75rem, 2vw, 1rem);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 3vw, 1.5rem);
  background-color: white;
  border-radius: clamp(0.75rem, 2vw, 1rem);
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px var(--shadow-color);
  min-height: 3rem;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--shadow-color);
}

.action-btn .icon {
  font-size: clamp(1.25rem, 4vw, 1.5rem);
  margin-bottom: 0.5rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1rem);
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.75rem, 2vw, 1rem);
  padding: clamp(0.75rem, 2vw, 1rem);
  background-color: var(--background-color);
  border-radius: clamp(0.5rem, 2vw, 0.75rem);
  transition: all 0.3s ease;
}

.activity-item:hover {
  transform: translateX(4px);
  background-color: #e6f4f1;
}

.activity-icon {
  font-size: clamp(1.25rem, 4vw, 1.5rem);
  background-color: white;
  padding: clamp(0.375rem, 1.5vw, 0.5rem);
  border-radius: clamp(0.5rem, 2vw, 0.75rem);
  box-shadow: 0 2px 4px var(--shadow-color);
}

.activity-content {
  flex: 1;
}

.activity-content h3 {
  margin: 0;
  font-size: clamp(1rem, 3vw, 1.1rem);
  font-weight: 600;
}

.activity-content p {
  margin: 0.25rem 0;
  color: var(--text-color);
  opacity: 0.8;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
}

.activity-time {
  font-size: clamp(0.75rem, 2vw, 0.9rem);
  color: var(--text-color);
  opacity: 0.6;
}

@media (max-width: 768px) {
  .home-view {
    padding: 1rem;
  }

  .content-grid {
    gap: 1rem;
  }

  .activity-item {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .action-btn {
    padding: 0.75rem;
  }

  .activity-icon {
    padding: 0.375rem;
  }

  .activity-item {
    gap: 0.75rem;
  }
}
</style>
