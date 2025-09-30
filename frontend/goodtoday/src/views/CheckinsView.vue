<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Check-ins</ion-title>
        <ion-buttons slot="end">
          <ion-badge :color="online ? 'goodgreen' : 'medium'" class="ion-margin-end">{{ online ? 'Online' : 'Offline' }}</ion-badge>
          <ion-button color="goodorange" fill="outline" size="small" @click="syncNow">Sync now</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row class="ion-text-bold ion-padding-bottom">
          <ion-col size="4"><a href="#" @click.prevent="setSort('date')">Date <small>{{ sortLabel('date') }}</small></a></ion-col>
          <ion-col size="2"><a href="#" @click.prevent="setSort('mood')">Mood <small>{{ sortLabel('mood') }}</small></a></ion-col>
          <ion-col size="2"><a href="#" @click.prevent="setSort('energy')">Energy <small>{{ sortLabel('energy') }}</small></a></ion-col>
          <ion-col size="4">Note</ion-col>
        </ion-row>

        <ion-row v-if="loading">
          <ion-col size="12">
            <ion-skeleton-text animated style="width: 100%; height: 16px;" />
            <ion-skeleton-text animated style="width: 95%; height: 16px;" />
            <ion-skeleton-text animated style="width: 90%; height: 16px;" />
          </ion-col>
        </ion-row>

        <ion-row v-for="c in sortedCheckins" :key="c.id || c.date" class="ion-padding-vertical">
          <ion-col size="4">{{ c.date }}</ion-col>
          <ion-col size="2">{{ c.mood }}</ion-col>
          <ion-col size="2">{{ c.energy }}</ion-col>
          <ion-col size="4">{{ c.note || '\u2014' }}</ion-col>
        </ion-row>

        <ion-row v-if="!loading && sortedCheckins.length === 0">
          <ion-col size="12" class="ion-text-center ion-padding">No check-ins yet.</ion-col>
        </ion-row>
      </ion-grid>

      <ion-text color="danger" v-if="error">{{ error }}</ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { fetchCheckins, type Checkin } from '@/api/checkins'
import { syncNow as repoSyncNow } from '@/services/repo'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonButton, IonText, IonBadge, IonSkeletonText, IonButtons, toastController } from '@ionic/vue'

const checkins = ref<Checkin[]>([])
const error = ref('')
const loading = ref(false)

const sortKey = ref<'date'|'mood'|'energy'>('date')
const sortDir = ref<'asc'|'desc'>('desc')

function setSort(key: 'date'|'mood'|'energy') {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = key === 'date' ? 'desc' : 'asc'
  }
}

function sortLabel(key: 'date'|'mood'|'energy') {
  if (sortKey.value !== key) return ''
  return sortDir.value === 'asc' ? '↑' : '↓'
}

const sortedCheckins = computed(() => {
  const arr = [...checkins.value]
  arr.sort((a, b) => {
    const k = sortKey.value
    const dir = sortDir.value === 'asc' ? 1 : -1
    const av = (a as any)[k]
    const bv = (b as any)[k]
    if (k === 'date') return (av > bv ? 1 : av < bv ? -1 : 0) * dir
    return ((Number(av) || 0) - (Number(bv) || 0)) * dir
  })
  return arr
})

async function load() {
  error.value = ''
  loading.value = true
  try {
    checkins.value = await fetchCheckins()
  } catch (e:any) {
    error.value = e?.response?.data?.detail || e?.message || 'Failed to load check-ins'
  } finally {
    loading.value = false
  }
}

const online = ref<boolean>(navigator.onLine)
function handleOnline() { online.value = true }
function handleOffline() { online.value = false }

onMounted(() => {
  load()
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})

async function presentToast(opts: { message: string; duration?: number; color?: string; position?: 'top'|'middle'|'bottom' }) {
  const t = await toastController.create({ duration: 1200, position: 'top', ...opts })
  await t.present()
}


async function syncNow() {
  try {
    await repoSyncNow()
    await load()
    await presentToast({ message: 'Synced ✓', duration: 1200, position: 'top' })
  } catch (e:any) {
    await presentToast({ message: e?.message || 'Sync failed', duration: 1500, color: 'danger', position: 'top' })
  }
}
</script>