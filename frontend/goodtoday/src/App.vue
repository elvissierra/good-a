<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { IonApp, IonRouterOutlet, toastController } from '@ionic/vue';

function handleOnline() {
  toastController.create({ message: 'You are back online. Syncing will resume.', duration: 1400, position: 'top' }).then(t => t.present())
}
function handleOffline() {
  toastController.create({ message: 'You are offline. Changes will sync later.', duration: 1600, position: 'top', color: 'medium' }).then(t => t.present())
}

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})
onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style>
/* Calming off‑white/yellowish background applied app-wide */
ion-app {
  --ion-background-color: #FFF8E6; /* soft warm off‑white */
  --ion-toolbar-background: #FFF8E6;
  --ion-text-color: #1f2937; /* slate-800 for strong contrast on warm bg */
}
/* Ensure global text picks up the darker color */
ion-content, ion-header, ion-footer, ion-title, ion-text, body {
  color: var(--ion-text-color);
}
/* Toolbar text color */
ion-toolbar {
  --background: var(--ion-toolbar-background);
  --color: var(--ion-text-color);
}
/* Cards stay white for readability */
ion-card {
  --background: #ffffff;
  color: var(--ion-text-color);
}
/* Links with accessible contrast and visible affordance */
a {
  color: #1d4ed8; /* accessible blue on #FFF8E6 */
  text-decoration: underline;
}
/* Segments: ensure label contrast in checked and unchecked states */
ion-segment-button {
  --color: #374151;           /* slate-700 */
  --color-checked: #111827;   /* slate-900 */
  --indicator-color: var(--ion-color-goodorange, #ff8c42);
}
</style>
