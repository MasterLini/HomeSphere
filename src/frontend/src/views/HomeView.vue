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
          <button class="btn btn-primary" popovertarget="todoPopover">Mehr erfahren</button>
          <div id="todoPopover" popover class="centered-popover">
            <h5>ToDo-Liste Details</h5>
            <p>Mit unseren ToDo-Listen können Sie Ihre täglichen Aufgaben effizient organisieren. Fügen Sie einen Titel, eine detaillierte Beschreibung und ein Erledigungsdatum hinzu, um den Überblick zu behalten.</p>
          </div>
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
          <button class="btn btn-primary" popovertarget="shoppingPopover">Mehr erfahren</button>
          <div id="shoppingPopover" popover class="centered-popover">
            <h5>Einkaufsliste Details</h5>
            <p>Erstellen Sie detaillierte Einkaufslisten mit Produktnamen, Mengenangaben und passenden Einheiten. Teilen Sie Ihre Listen und planen Sie gemeinsam.</p>
          </div>
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
          <p class="text-muted">Verwalten Sie Ihre Familie und koordinieren Sie gemeinsam Aufgaben.</p>
          <button class="btn btn-primary" popovertarget="familyPopover">Mehr erfahren</button>
          <div id="familyPopover" popover class="centered-popover">
            <h5>Familienverwaltung Details</h5>
            <p>Verwalten Sie Ihre Familie einfach und zentral. Koordinieren Sie gemeinsame Aufgaben und behalten Sie stets den Überblick.</p>
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

#todoPopover, #shoppingPopover, #familyPopover {
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.centered-popover {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}
</style>
