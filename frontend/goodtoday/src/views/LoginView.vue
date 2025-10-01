<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Sign in</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="login-wrap">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Welcome back</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-input v-model="email" type="email" label="Email" label-placement="floating" autocomplete="username" />
            </ion-item>
            <ion-item class="ion-margin-top">
              <ion-input :type="showPassword ? 'text' : 'password'" v-model="password" label="Password" label-placement="floating" autocomplete="current-password" />
            </ion-item>
            <ion-button fill="clear" size="small" class="ion-margin-top" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide password' : 'Show password' }}
            </ion-button>
            <ion-button expand="block" class="ion-margin-top" :disabled="loading" @click="onLogin">{{ loading ? 'Signing in…' : 'Sign in' }}</ion-button>
            <ion-text color="danger" v-if="error" class="ion-margin-top">{{ error }}</ion-text>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/api/auth'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/vue'

const email = ref('test@example.com')
const password = ref('secret')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

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

<style scoped>
.login-wrap {
  max-width: 420px;
  margin: 0 auto;
  padding-top: 10vh;
}
</style>
