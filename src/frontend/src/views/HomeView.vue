<template>
  <div class="container mt-5">
    <div class="text-center">
      <h1 class="display-4">Willkommen bei HomeSphere</h1>
      <p class="lead">Die smarte Lösung für Ihre Hausverwaltung</p>
      <p class="text-muted">{{ joke }}</p>
    </div>

    <div class="row mt-5">
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="card shadow-sm">
          <div class="col-md-4 text-center">
            <div class="feature-icon bg-primary bg-opacity-10 mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle" 
                 style="width: 80px; height: 80px; font-size: 2.5rem;">
              &#128220;
            </div>
          </div>
          <h3 class="h4 mb-3">ToDo-Listen</h3>
          <p class="text-muted">Verwalten Sie Ihre Aufgaben und behalten Sie den Überblick.</p>
          <button class="btn btn-primary">Mehr erfahren</button>
        </div>
      </div>

      <div class="col-lg-4 col-md-6 mb-4">
        <div class="card shadow-sm">
          <div class="col-md-4 text-center">
            <div class="feature-icon bg-primary bg-opacity-10 mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle" 
                 style="width: 80px; height: 80px; font-size: 2.5rem;">
              &#128722;
            </div>
          </div>
          <h3 class="h4 mb-3">Einkaufslisten</h3>
          <p class="text-muted">Erstellen Sie Einkaufslisten und teilen Sie sie mit Ihrer Familie.</p>
          <button class="btn btn-primary">Mehr erfahren</button>
        </div>
      </div>

      <div class="col-lg-4 col-md-6 mb-4">
        <div class="card shadow-sm">
          <div class="col-md-4 text-center">
            <div class="feature-icon bg-primary bg-opacity-10 mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle" 
                 style="width: 80px; height: 80px; font-size: 2.5rem;">
              👪
            </div>
          </div>
          <h3 class="h4 mb-3">Familienverwaltung</h3>
          <p class="text-muted">Koordinieren Sie Termine und Aufgaben für Ihre Familie.</p>
          <button class="btn btn-primary">Mehr erfahren</button>
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
    };
  },
  mounted() {
    this.getJoke();
  },
  methods: {
    async getJoke() {
      try {
        const response = await axios.get("https://witzapi.de/api/joke/");
        this.joke = response.data[0].text;
      } catch (error) {
        console.error("Fehler beim Abrufen des Witzes:", error);
      }
    },
  },
};
</script>

<style scoped>
h3 {
  white-space: nowrap;
}
.container {
  max-width: 900px;
}
.card {
  border-radius: 10px;
  transition: transform 0.3s;
}
.card:hover {
  transform: translateY(-5px);
}

.icon {
  font-size: 1rem;
  display: inline-block;
  background-color: rgb(113, 218, 219);
  border-radius: 10px;
  padding: 1rem;
}
</style>
