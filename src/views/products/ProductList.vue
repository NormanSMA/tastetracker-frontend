<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useProductStore, type Product } from '@/stores/products';
import { useAuthStore } from '@/stores/auth';
import { Plus, Search, Filter, Pencil, Trash2, Upload, Loader2 } from 'lucide-vue-next';
import BaseModal from '@/components/common/BaseModal.vue';
import { toast } from 'vue-sonner';

const productStore = useProductStore();
const authStore = useAuthStore();
const selectedCategory = ref<number | 'all'>('all');
const searchQuery = ref('');

// Estado del Modal
const isModalOpen = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string | null>(null);

const form = reactive({
  id: 0,
  name: '',
  price: '',
  category_id: 0,
  description: '',
  image: null as File | null
});

onMounted(() => {
  productStore.fetchMenu();
});

const filteredProducts = computed(() => {
  return productStore.products.filter(product => {
    const matchesCategory = selectedCategory.value === 'all' || product.category_id === selectedCategory.value;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
});

const formatCurrency = (value: number) => {
  return 'C$ ' + Number(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

// --- Lógica del Formulario ---

const openCreateModal = () => {
  isEditing.value = false;
  form.name = '';
  form.price = '';
  form.category_id = productStore.categories.length > 0 ? productStore.categories[0].id : 0;
  form.description = '';
  form.image = null;
  imagePreview.value = null;
  isModalOpen.value = true;
};

const openEditModal = (product: Product) => {
  isEditing.value = true;
  form.id = product.id;
  form.name = product.name;
  form.price = product.price.toString();
  form.category_id = product.category_id;
  // CORRECCIÓN: Cargar la descripción existente o cadena vacía
  form.description = product.description || ''; 
  form.image = null;
  imagePreview.value = product.image_url;
  isModalOpen.value = true;
};

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    form.image = file;
    const reader = new FileReader();
    reader.onload = e => imagePreview.value = e.target?.result as string;
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('category_id', form.category_id.toString());
    formData.append('description', form.description); // Asegurar envío
    formData.append('is_active', '1');
    
    if (form.image) {
      formData.append('image', form.image);
    }

    if (isEditing.value) {
      await productStore.updateProduct(form.id, formData);
      toast.success('Producto actualizado correctamente');
    } else {
      await productStore.createProduct(formData);
      toast.success('Producto creado correctamente');
    }
    isModalOpen.value = false;
  } catch (e: any) {
    console.error(e);
    toast.error('Error al guardar', { description: 'Verifica los datos o la imagen' });
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (id: number) => {
  if(confirm('¿Estás seguro de eliminar este producto?')) {
    try {
      await productStore.deleteProduct(id);
      toast.success('Producto eliminado');
    } catch (e) {
      toast.error('No se pudo eliminar');
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Menú & Productos</h1>
        <p class="text-muted-foreground">Gestiona el catálogo de tu restaurante</p>
      </div>
      <button v-if="authStore.isAdmin" @click="openCreateModal" class="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
        <Plus class="w-5 h-5" />
        Nuevo Producto
      </button>
    </div>

    <div class="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center">
      <div class="relative w-full md:w-64">
        <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input v-model="searchQuery" type="text" placeholder="Buscar platillo..." class="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
      </div>
      <div class="flex gap-2 overflow-x-auto w-full pb-2 md:pb-0 no-scrollbar">
        <button @click="selectedCategory = 'all'" class="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border" :class="selectedCategory === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'">Todos</button>
        <button v-for="cat in productStore.categories" :key="cat.id" @click="selectedCategory = cat.id" class="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border" :class="selectedCategory === cat.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'">{{ cat.name }}</button>
      </div>
    </div>

    <div v-if="productStore.isLoading" class="flex justify-center py-20">
      <Loader2 class="w-10 h-10 text-primary animate-spin" />
    </div>

    <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="(product, index) in filteredProducts" :key="product.id" class="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all duration-300 animate-entry" :style="{ animationDelay: `${index * 50}ms` }">
        <div class="h-48 bg-muted relative overflow-hidden">
          <img v-if="product.image_url" :src="product.image_url" :alt="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground"><Filter class="w-12 h-12 opacity-20" /></div>
          <div class="absolute top-2 right-2 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm">{{ product.category_name }}</div>
        </div>
        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-lg truncate pr-2">{{ product.name }}</h3>
            <span class="font-bold text-primary">{{ formatCurrency(product.price) }}</span>
          </div>
          <p class="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">{{ product.description || 'Sin descripción' }}</p>
          
          <div v-if="authStore.isAdmin" class="flex gap-2">
            <button @click="openEditModal(product)" class="flex-1 py-2 rounded-lg border border-input hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors text-sm font-medium flex justify-center items-center gap-2">
               <Pencil class="w-4 h-4" /> Editar
            </button>
            <button @click="handleDelete(product.id)" class="px-3 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors">
               <Trash2 class="w-4 h-4" />
            </button>
          </div>
          <div v-else class="text-center text-xs text-muted-foreground italic mt-2">Solo lectura</div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-20 text-muted-foreground">No se encontraron productos.</div>

    <BaseModal :is-open="isModalOpen" :title="isEditing ? 'Editar Producto' : 'Nuevo Producto'" @close="isModalOpen = false">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <div class="flex justify-center mb-4">
          <div class="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer bg-muted/30 flex items-center justify-center group" @click="fileInput?.click()">
            <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" />
            <div v-else class="flex flex-col items-center text-muted-foreground group-hover:text-primary">
               <Upload class="w-8 h-8 mb-1" />
               <span class="text-xs">Subir foto</span>
            </div>
            <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="handleImageUpload" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Nombre</label>
            <input v-model="form.name" required class="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Precio</label>
            <input v-model="form.price" type="number" step="0.01" required class="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Categoría</label>
          <select v-model="form.category_id" required class="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none">
            <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <div class="space-y-2">
            <label class="text-sm font-medium">Descripción</label>
            <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none" placeholder="Ingredientes..."></textarea>
        </div>

        <div class="pt-4 flex justify-end gap-3">
          <button type="button" @click="isModalOpen = false" class="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors">Cancelar</button>
          <button type="submit" :disabled="isSubmitting" class="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center">
             <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin mr-2" />
             {{ isEditing ? 'Guardar' : 'Crear' }}
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
