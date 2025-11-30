<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useUserStore, type User } from '@/stores/users';
import { Plus, Search, Mail, Phone, Shield, Pencil, Trash2, Upload, Loader2 } from 'lucide-vue-next';
import BaseModal from '@/components/common/BaseModal.vue';

const userStore = useUserStore();
const searchQuery = ref('');
const isModalOpen = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string | null>(null);

const form = reactive({
  id: 0,
  name: '',
  email: '',
  password: '',
  role: 'waiter',
  phone: '',
  photo: null as File | null
});

onMounted(() => { userStore.fetchUsers(); });

const filteredUsers = computed(() => {
  return userStore.users.filter(u => u.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const getRoleColor = (role: string) => {
    switch(role) {
        case 'admin': return 'bg-red-100 text-red-700 border-red-200';
        case 'kitchen': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'waiter': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

// --- Lógica Modal (similar a Productos) ---
const openCreate = () => {
    isEditing.value = false;
    form.name = ''; form.email = ''; form.password = ''; form.role = 'waiter'; form.phone = '';
    imagePreview.value = null; form.photo = null;
    isModalOpen.value = true;
};

const openEdit = (user: User) => {
    isEditing.value = true;
    form.id = user.id;
    form.name = user.name;
    form.email = user.email;
    form.password = ''; // Dejar vacío si no se cambia
    form.role = user.role;
    form.phone = user.phone || '';
    imagePreview.value = user.photo ? `/storage/${user.photo}` : null; // Ajustar path según backend
    isModalOpen.value = true;
};

const handleImage = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
        form.photo = file;
        imagePreview.value = URL.createObjectURL(file);
    }
};

const handleSubmit = async () => {
    isSubmitting.value = true;
    try {
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('role', form.role);
        if (form.password) formData.append('password', form.password);
        if (form.phone) formData.append('phone', form.phone);
        if (form.photo) formData.append('photo', form.photo);

        if (isEditing.value) await userStore.updateUser(form.id, formData);
        else await userStore.createUser(formData);
        isModalOpen.value = false;
    } catch (e) { alert('Error al guardar usuario'); }
    finally { isSubmitting.value = false; }
};

const handleDelete = async (id: number) => {
    if(confirm('¿Eliminar este usuario?')) await userStore.deleteUser(id);
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Equipo de Trabajo</h1>
        <p class="text-muted-foreground">Gestiona el acceso del personal</p>
      </div>
      <button @click="openCreate" class="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20">
        <Plus class="w-5 h-5" /> Nuevo Usuario
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="user in filteredUsers" :key="user.id" class="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all animate-entry group relative overflow-hidden">
            
            <div class="w-24 h-24 rounded-full bg-muted border-4 border-background shadow-sm mb-4 overflow-hidden relative group-hover:scale-105 transition-transform">
                <img v-if="user.photo" :src="user.photo.startsWith('http') ? user.photo : `/storage/${user.photo}`" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground bg-muted">
                    {{ user.name.charAt(0) }}
                </div>
            </div>

            <h3 class="font-bold text-lg text-foreground mb-1">{{ user.name }}</h3>
            <span class="px-2 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider mb-4" :class="getRoleColor(user.role)">{{ user.role }}</span>

            <div class="w-full space-y-2 text-sm text-muted-foreground mb-6">
                <div class="flex items-center justify-center gap-2">
                    <Mail class="w-4 h-4" /> {{ user.email }}
                </div>
                <div v-if="user.phone" class="flex items-center justify-center gap-2">
                    <Phone class="w-4 h-4" /> {{ user.phone }}
                </div>
            </div>

            <div class="flex gap-2 w-full mt-auto">
                <button @click="openEdit(user)" class="flex-1 py-2 rounded-lg border border-input hover:bg-primary/5 hover:text-primary hover:border-primary transition-colors flex justify-center"><Pencil class="w-4 h-4" /></button>
                <button @click="handleDelete(user.id)" class="px-4 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"><Trash2 class="w-4 h-4" /></button>
            </div>
        </div>
    </div>

    <BaseModal :is-open="isModalOpen" :title="isEditing ? 'Editar Usuario' : 'Nuevo Usuario'" @close="isModalOpen = false">
        <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="flex justify-center mb-6">
                <div class="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary overflow-hidden relative" @click="fileInput?.click()">
                    <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" />
                    <Upload v-else class="w-8 h-8 text-muted-foreground" />
                    <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="handleImage" />
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-muted-foreground uppercase">Nombre</label>
                    <input v-model="form.name" required class="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-muted-foreground uppercase">Rol</label>
                    <select v-model="form.role" class="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 outline-none">
                        <option value="waiter">Mesero</option>
                        <option value="kitchen">Cocina</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
            </div>

            <div class="space-y-1">
                <label class="text-xs font-bold text-muted-foreground uppercase">Email</label>
                <input v-model="form.email" type="email" required class="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-muted-foreground uppercase">Teléfono</label>
                    <input v-model="form.phone" class="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-muted-foreground uppercase">{{ isEditing ? 'Nueva Contraseña' : 'Contraseña' }}</label>
                    <input v-model="form.password" type="password" :required="!isEditing" placeholder="********" class="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
            </div>

            <div class="pt-4 flex justify-end gap-3">
                <button type="button" @click="isModalOpen = false" class="px-4 py-2 border rounded-lg hover:bg-muted">Cancelar</button>
                <button type="submit" :disabled="isSubmitting" class="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center">
                    <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin mr-2" /> Guardar
                </button>
            </div>
        </form>
    </BaseModal>
  </div>
</template>
