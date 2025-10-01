<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Today</ion-title>
        <ion-buttons slot="end">
          <ion-badge :color="online ? 'goodgreen' : 'medium'" class="ion-margin-end">{{ online ? 'Online' : 'Offline' }}</ion-badge>
          <ion-button color="goodorange" fill="outline" size="small" @click="syncNow">Sync now</ion-button>
          <ion-button color="medium" @click="logout">Logout</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h2>Today has been good, how about you?</h2>
      <ion-segment v-model="mood" class="mood-segment" aria-label="Select mood">
        <ion-segment-button v-for="m in moods" :key="m.value" :value="m.value" :aria-label="m.label">
          <ion-icon :icon="m.icon" />
        </ion-segment-button>
      </ion-segment>
      <ion-segment v-model="energy">
        <ion-segment-button v-for="n in 5" :key="'e'+n" :value="String(n)">{{ n }}</ion-segment-button>
      </ion-segment>
      <ion-button color="goodgreen" expand="block" @click="saveCheckin">Save Check-in</ion-button>

      <h3 class="ion-margin-top">Pick a path</h3>
      <ion-grid>
        <ion-row>
          <ion-col size="6" v-for="c in cards" :key="c.type">
            <ion-card @click="quickLog(c.type)" role="button" tabindex="0" @keyup.enter="quickLog(c.type)" class="quick-card" :aria-label="`Quick log ${c.label}`">
              <ion-card-header>
                <ion-icon :icon="c.icon" size="large" />
                <ion-card-title>{{ c.label }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>+10 min</ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
      <ion-loading :is-open="syncing" message="Syncing..." spinner="dots" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { upsertCheckin, createActivity, enqueueOp, syncNow as repoSyncNow } from '@/services/repo'
import { clearSession } from '@/stores/sessions'
import { toastController } from '@ionic/vue'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBadge, IonButton, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonSegment, IonSegmentButton, IonIcon, IonLoading } from '@ionic/vue'

import { walkOutline, barbellOutline, gameControllerOutline, colorPaletteOutline, sadOutline, alertOutline, removeOutline, happyOutline, sunnyOutline } from 'ionicons/icons'

async function presentToast(opts: { message: string; duration?: number; color?: string; position?: 'top'|'middle'|'bottom' }) {
  const t = await toastController.create({ duration: 1200, position: 'top', ...opts })
  await t.present()
}

const moods = [
  { value: '1', label: 'Very low', icon: sadOutline },
  { value: '2', label: 'Low', icon: alertOutline },
  { value: '3', label: 'Neutral', icon: removeOutline },
  { value: '4', label: 'Good', icon: happyOutline },
  { value: '5', label: 'Great', icon: sunnyOutline },
]
const mood = ref('3')
const energy = ref('3')
const cards = [
  { type: 'run', label: 'Run', icon: walkOutline },
  { type: 'workout', label: 'Workout', icon: barbellOutline },
  { type: 'brain', label: 'Brain Game', icon: gameControllerOutline },
  { type: 'creative', label: 'Creative', icon: colorPaletteOutline },
]
const syncing = ref(false)
function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function saveCheckin(){
  try {
    const payload = { date: todayISO(), mood: Number(mood.value), energy: Number(energy.value) }
    await upsertCheckin(payload)
    await enqueueOp('upsert_checkin', payload)
    await presentToast({ message: 'Check-in saved ✓' })
  } catch (e:any) {
    await presentToast({ message: e?.message || 'Failed to save check-in', color: 'danger' })
  }
}

async function quickLog(type:string){
  try {
    const occurred_at = new Date().toISOString()
    await createActivity({ type, minutes: 10, occurred_at })
    await enqueueOp('create_activity', { type, minutes: 10, occurred_at })
    await presentToast({ message: 'Logged +10 min ✓' })
  } catch (e:any) {
    await presentToast({ message: e?.message || 'Failed to log activity', color: 'danger' })
  }
}

const online = ref<boolean>(navigator.onLine)
function handleOnline() { online.value = true }
function handleOffline() { online.value = false }

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})


async function syncNow() {
  syncing.value = true
  try {
    await repoSyncNow()
    await presentToast({ message: 'Synced ✓' })
  } catch (e:any) {
    await presentToast({ message: e?.message || 'Sync failed', color: 'danger' })
  } finally {
    syncing.value = false
  }
}

const router = useRouter()
function logout() {
  clearSession()
  router.replace('/login')
}
</script>

<style scoped>
.quick-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.quick-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}
.mood-segment ion-segment-button {
  --padding-start: 8px;
  --padding-end: 8px;
}
ion-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>