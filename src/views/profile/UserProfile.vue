<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';
import { User, Camera, Lock, Loader2, Save } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const authStore = useAuthStore();
const profileStore = useProfileStore();

const isUpdatingProfile = ref(false);
const isChangingPassword = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string | null>(null);

// Formulario de datos personales
const profileForm = reactive({
  name: '',
  email: '',
  phone: '',
  photo: null as File | null
});

// Formulario de contraseña
const passwordForm = reactive({
  current_password: '',
  password: '',
  password_confirmation: ''
});

onMounted(() => {
  // Cargar datos del usuario actual
  if (authStore.user) {
    profileForm.name = authStore.user.name;
    profileForm.email = authStore.user.email;
    profileForm.phone = authStore.user.phone || '';
    imagePreview.value = authStore.user.photo_url || null;
  }
});

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    profileForm.photo = file;
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = e => imagePreview.value = e.target?.result as string;
    reader.readAsDataURL(file);
  }
};

const handleUpdateProfile = async () => {
  isUpdatingProfile.value = true;
  try {
    const formData = new FormData();
    formData.append('name', profileForm.name);
    formData.append('email', profileForm.email);
    if (profileForm.phone) formData.append('phone', profileForm.phone);
    if (profileForm.photo) formData.append('photo', profileForm.photo);

    await profileStore.updateProfile(formData);
    toast.success('Perfil actualizado correctamente');
    
    // Limpiar el archivo seleccionado
    profileForm.photo = null;
  } catch (error: any) {
    console.error(error);
    toast.error('Error al actualizar perfil', {
      description: error.response?.data?.message || 'Verifica los datos'
    });
  } finally {
    isUpdatingProfile.value = false;
  }
};

const handleChangePassword = async () => {
  // Validar que las contraseñas coincidan
  if (passwordForm.password !== passwordForm.password_confirmation) {
    toast.error('Las contraseñas no coinciden');
    return;
  }

  if (passwordForm.password.length < 8) {
    toast.error('La contraseña debe tener al menos 8 caracteres');
    return;
  }

  isChangingPassword.value = true;
  try {
    await profileStore.changePassword({
      current_password: passwordForm.current_password,
      password: passwordForm.password,
      password_confirmation: passwordForm.password_confirmation
    });
    
    toast.success('Contraseña actualizada correctamente');
    
    // Limpiar formulario
    passwordForm.current_password = '';
    passwordForm.password = '';
    passwordForm.password_confirmation = '';
  } catch (error: any) {
    console.error(error);
    toast.error('Error al cambiar contraseña', {
      description: error.response?.data?.message || 'Verifica la contraseña actual'
    });
  } finally {
    isChangingPassword.value = false;
  }
};
</script>

<template>
  <!-- Estado de carga -->
  <div v-if="!authStore.user" class="flex justify-center items-center h-64">
    <div class="text-muted-foreground">Cargando perfil...</div>
  </div>

  <!-- Contenido del perfil -->
  <div v-else class="space-y-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-foreground">Mi Perfil</h1>
      <p class="text-muted-foreground">Administra tu información personal y seguridad</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Tarjeta 1: Información Personal -->
      <div class="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User class="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-foreground">Información Personal</h2>
            <p class="text-sm text-muted-foreground">Actualiza tus datos personales</p>
          </div>
        </div>

        <form @submit.prevent="handleUpdateProfile" class="space-y-5">
          <!-- Foto de perfil -->
          <div class="flex flex-col items-center mb-6">
            <div 
              class="relative w-32 h-32 rounded-full overflow-hidden border-4 border-border hover:border-primary transition-colors cursor-pointer group"
              @click="fileInput?.click()"
            >
              <img 
                v-if="imagePreview" 
                :src="imagePreview" 
                class="w-full h-full object-cover"
                alt="Profile photo"
              />
              <div 
                v-else 
                class="w-full h-full bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground"
              >
                {{ authStore.user?.name.charAt(0).toUpperCase() }}
              </div>
              
              <!-- Overlay al hover -->
              <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera class="w-8 h-8 text-white" />
              </div>
            </div>
            
            <input 
              ref="fileInput" 
              type="file" 
              class="hidden" 
              accept="image/*" 
              @change="handleImageSelect" 
            />
            
            <p class="text-xs text-muted-foreground mt-2">Click para cambiar foto</p>
          </div>

          <!-- Nombre -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Nombre Completo</label>
            <input 
              v-model="profileForm.name" 
              type="text" 
              required
              class="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Tu nombre"
            />
          </div>

          <!-- Email (solo lectura) -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Correo Electrónico</label>
            <input 
              v-model="profileForm.email" 
              type="email" 
              readonly
              class="w-full px-4 py-2.5 rounded-lg border border-input bg-muted text-muted-foreground cursor-not-allowed outline-none"
              placeholder="tu@email.com"
            />
            <p class="text-xs text-muted-foreground">El email no puede ser modificado</p>
          </div>

          <!-- Teléfono -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Teléfono</label>
            <input 
              v-model="profileForm.phone" 
              type="tel"
              class="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="+505 8888 8888"
            />
          </div>

          <!-- Botón Guardar -->
          <button 
            type="submit" 
            :disabled="isUpdatingProfile"
            class="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <Loader2 v-if="isUpdatingProfile" class="w-5 h-5 animate-spin" />
            <Save v-else class="w-5 h-5" />
            {{ isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </form>
      </div>

      <!-- Tarjeta 2: Seguridad / Cambiar Contraseña -->
      <div class="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Lock class="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-foreground">Seguridad</h2>
            <p class="text-sm text-muted-foreground">Cambia tu contraseña</p>
          </div>
        </div>

        <form @submit.prevent="handleChangePassword" class="space-y-5">
          <!-- Contraseña Actual -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Contraseña Actual</label>
            <input 
              v-model="passwordForm.current_password" 
              type="password" 
              required
              class="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <!-- Nueva Contraseña -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Nueva Contraseña</label>
            <input 
              v-model="passwordForm.password" 
              type="password" 
              required
              minlength="8"
              class="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="••••••••"
            />
            <p class="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
          </div>

          <!-- Confirmar Nueva Contraseña -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Confirmar Nueva Contraseña</label>
            <input 
              v-model="passwordForm.password_confirmation" 
              type="password" 
              required
              minlength="8"
              class="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <!-- Botón Cambiar Contraseña -->
          <button 
            type="submit" 
            :disabled="isChangingPassword"
            class="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            <Loader2 v-if="isChangingPassword" class="w-5 h-5 animate-spin" />
            <Lock v-else class="w-5 h-5" />
            {{ isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
