<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Check-ins</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-button expand="block" @click="load">Reload</ion-button>
      <ion-list class="ion-margin-top">
        <ion-item v-for="c in checkins" :key="c.id || c.date">
          <ion-label>
            <h2>{{ c.date }}</h2>
            <p>Mood {{ c.mood }} • Energy {{ c.energy }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
      <ion-text color="danger" v-if="error">{{ error }}</ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchCheckins, type Checkin } from '@/api/checkins'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonText } from '@ionic/vue'

const checkins = ref<Checkin[]>([])
const error = ref('')

async function load() {
  error.value = ''
  try {
    checkins.value = await fetchCheckins()
  } catch (e:any) {
    error.value = e?.response?.data?.detail || e?.message || 'Failed to load check-ins'
  }
}

onMounted(load)
</script>
