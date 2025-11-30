import { defineStore } from 'pinia';
import api from '@/api/axios';
import { ref } from 'vue';

export interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  category_id: number;
  category_name: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  image_url: string | null;
}

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([]);
  const categories = ref<Category[]>([]);
  const isLoading = ref(false);

  async function fetchMenu() {
    isLoading.value = true;
    try {
      // Hacemos las dos peticiones en paralelo
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products')
      ]);
      categories.value = catRes.data.data;
      products.value = prodRes.data.data;
    } catch (error) {
      console.error('Error cargando menú:', error);
    } finally {
      isLoading.value = false;
    }
  }

  // --- NUEVAS ACCIONES ---
  async function createProduct(productData: FormData) {
    try {
      const { data } = await api.post('/products', productData, {
        headers: { 'Content-Type': 'multipart/form-data' } // Importante para imágenes
      });
      // Agregamos el nuevo producto a la lista local para no recargar
      products.value.unshift(data.data);
      return true;
    } catch (error) {
      console.error('Error creando producto:', error);
      throw error;
    }
  }

  async function updateProduct(id: number, productData: FormData) {
    try {
      // Laravel requiere _method: 'PUT' dentro del FormData si enviamos archivos
      productData.append('_method', 'PUT'); 
      
      const { data } = await api.post(`/products/${id}`, productData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Actualizamos el producto en la lista local
      const index = products.value.findIndex(p => p.id === id);
      if (index !== -1) products.value[index] = data.data;
      return true;
    } catch (error) {
      console.error('Error actualizando producto:', error);
      throw error;
    }
  }

  async function deleteProduct(id: number) {
     try {
        await api.delete(`/products/${id}`);
        products.value = products.value.filter(p => p.id !== id);
     } catch (error) {
        console.error(error);
     }
  }

  return { products, categories, isLoading, fetchMenu, createProduct, updateProduct, deleteProduct };
});
