<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Sign in</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-input v-model="email" type="email" label="Email" label-placement="floating" autocomplete="username" />
      </ion-item>
      <ion-item class="ion-margin-top">
        <ion-input v-model="password" type="password" label="Password" label-placement="floating" autocomplete="current-password" />
      </ion-item>
      <ion-button expand="block" class="ion-margin-top" :disabled="loading" @click="onLogin">{{ loading ? 'Signing in…' : 'Sign in' }}</ion-button>
      <ion-text color="danger" v-if="error" class="ion-margin-top">{{ error }}</ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/api/auth'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText } from '@ionic/vue'

const email = ref('test@example.com')
const password = ref('secret')
const loading = ref(false)
const error = ref('')

const route = useRoute()
const router = useRouter()

async function onLogin() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    const next = (route.query.next as string) || '/home'
    router.replace(next)
  } catch (e:any) {
    error.value = e?.response?.data?.detail || e?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
