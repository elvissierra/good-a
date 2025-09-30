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
      <ion-segment v-model="mood">
        <ion-segment-button v-for="n in 5" :key="'m'+n" :value="String(n)">{{ n }}</ion-segment-button>
      </ion-segment>
      <ion-segment v-model="energy">
        <ion-segment-button v-for="n in 5" :key="'e'+n" :value="String(n)">{{ n }}</ion-segment-button>
      </ion-segment>
      <ion-button color="goodgreen" expand="block" @click="saveCheckin">Save Check-in</ion-button>

      <h3 class="ion-margin-top">Pick a path</h3>
      <ion-grid>
        <ion-row>
          <ion-col size="6" v-for="c in cards" :key="c.type">
            <ion-card @click="quickLog(c.type)">
              <ion-card-header><ion-card-title>{{c.label}}</ion-card-title></ion-card-header>
              <ion-card-content>+10 min</ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { upsertCheckin, createActivity, enqueueOp, syncNow as repoSyncNow } from '@/services/repo'
import { clearSession } from '@/stores/sessions'
import { toastController } from '@ionic/vue'

async function presentToast(opts: { message: string; duration?: number; color?: string; position?: 'top'|'middle'|'bottom' }) {
  const t = await toastController.create({ duration: 1200, position: 'top', ...opts })
  await t.present()
}

const mood = ref('3')
const energy = ref('3')
const cards = [
  { type:'run', label:'Run' },
  { type:'workout', label:'Workout' },
  { type:'brain', label:'Brain Game' },
  { type:'creative', label:'Creative' },
]
function todayISO(){ return new Date().toISOString().slice(0,10) }

async function saveCheckin(){
  const payload = { date: todayISO(), mood: Number(mood.value), energy: Number(energy.value) }
  await upsertCheckin(payload)
  await enqueueOp('upsert_checkin', payload)
}

async function quickLog(type:string){
  const occurred_at = new Date().toISOString()
  await createActivity({ type, minutes: 10, occurred_at })
  await enqueueOp('create_activity', { type, minutes: 10, occurred_at })
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
  try {
    await repoSyncNow()
    await presentToast({ message: 'Synced ✓' })
  } catch (e:any) {
    await presentToast({ message: e?.message || 'Sync failed', color: 'danger' })
  }
}

const router = useRouter()
function logout() {
  clearSession()
  router.replace('/login')
}
</script>