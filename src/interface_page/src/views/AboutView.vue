<template>
  <div class="text-center mt-5">
    <h1>Über uns</h1>
<div class="container my-5">
    <section class="card mb-4" data-aos="fade-up">
        <h2>Was ist HomeSphere?</h2>
        <p class="text-muted">HomeSphere ist die perfekte Lösung für Familien, die ihren Alltag einfacher und organisierter gestalten möchten. Mit unserer Plattform hast du alles an einem Ort – von der Verwaltung deiner Familienmitglieder bis hin zu praktischen Tools wie ToDo-Listen, Einkaufslisten und mehr.</p>
    </section>
    <div class="card mb-4" data-aos="fade-up">
        <h2>Was kannst du auf HomeSphere tun?</h2>
        <ul class="list-group list-group-flush">
            <li class="list-group-item"><strong>Familien anlegen und verwalten:</strong> Erstelle Profile für alle Familienmitglieder und behalte so stets den Überblick über ihre Aktivitäten, Aufgaben und Termine.</li>
            <li class="list-group-item"><strong>ToDo-Listen erstellen:</strong> Verwalte Aufgaben und achte darauf, dass alle wichtigen Dinge erledigt werden – sei es für den Haushalt, die Schule oder persönliche Projekte.</li>
            <li class="list-group-item"><strong>Einkaufslisten erstellen:</strong> Plane deine Einkäufe mit Leichtigkeit. Erstelle Listen für den nächsten Supermarktbesuch oder für spezielle Einkäufe und teile sie mit anderen Familienmitgliedern.</li>
            <li class="list-group-item"><strong>Termine und Erinnerungen:</strong> Verwalte alle wichtigen Termine und setze Erinnerungen, damit keine Geburtstagsfeier, Arzttermin oder andere Veranstaltungen mehr vergessen werden.</li>
            <li class="list-group-item"><strong>Und noch vieles mehr:</strong> HomeSphere wächst mit dir und deiner Familie. Wir arbeiten kontinuierlich daran, neue Funktionen hinzuzufügen, die dir helfen, deinen Alltag noch besser zu organisieren.</li>
        </ul>
  </div>
        <div class="card mb-4" data-aos="zoom-in">
        <h2>Warum HomeSphere?</h2>
        <p class="text-muted">HomeSphere wurde mit dem Ziel entwickelt, den Familienalltag zu vereinfachen und zu organisieren. Unser Fokus liegt auf einer einfachen Bedienung, sodass du mehr Zeit für die wichtigen Dinge im Leben hast. Mit HomeSphere kannst du sicher sein, dass du immer den Überblick behältst, egal wie hektisch der Alltag wird.</p>
      </div>
      <div class="card mb-4" data-aos="zoom-in">
        <h2>Wir sind für dich da!</h2>
        <p class="text-muted">Unsere Plattform bietet dir die Flexibilität, die du brauchst, um dein Familienmanagement so einfach wie möglich zu gestalten. Trete noch heute der HomeSphere-Community bei und mach deinen Alltag einfacher und stressfreier!</p>
      </div>
</div>
  </div>
</template>
<style scoped>
h2 {
  color: var(--primary-color)
}

li {
  background-color: var(--background--color);
  text-align: left;
}
</style>
<script>
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init({
      duration: 1200, // Geschwindigkeit der Animation (ms)
      once: false, // Animation nur einmal abspielen
    });
  export default {
    name: 'About',
    mounted() {
      
    },
    updated() {
    this.$nextTick(() => {
      AOS.refreshHard(); // Stärkere Aktualisierung für dynamische Inhalte
    });
    }
  };
</script>