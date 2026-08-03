import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { establishments } from '../ui/menu-data';

export type CartItem = { 
  itemId: string; 
  establishmentId: string; 
  quantity: number; 
  notes: string;
};

interface MenuState {
  selectedId: string;
  selectedCategory: string;
  cart: CartItem[];
  customerName: string;
  showCheckout: boolean;

  setSelectedId: (id: string) => void;
  setSelectedCategory: (category: string) => void;
  setCustomerName: (name: string) => void;
  setShowCheckout: (show: boolean) => void;
  add: (itemId: string, establishmentId: string) => void;
  remove: (itemId: string, establishmentId: string) => void;
  updateNotes: (itemId: string, establishmentId: string, notes: string) => void;
}

// Note a mudança aqui: envolvemos tudo no persist()
export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      selectedId: establishments[0].id,
      selectedCategory: "Todos",
      cart: [],
      customerName: "",
      showCheckout: false,

      setSelectedId: (id) => set({ selectedId: id, selectedCategory: "Todos" }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setCustomerName: (name) => set({ customerName: name }),
      setShowCheckout: (show) => set({ showCheckout: show }),

      add: (itemId, establishmentId) => set((state) => {
        const existing = state.cart.find((row) => row.itemId === itemId && row.establishmentId === establishmentId);
        if (existing) {
          return { cart: state.cart.map((row) => row === existing ? { ...row, quantity: row.quantity + 1 } : row) };
        }
        return { cart: [...state.cart, { itemId, establishmentId, quantity: 1, notes: "" }] };
      }),

      remove: (itemId, establishmentId) => set((state) => ({
        cart: state.cart.flatMap((row) => 
          row.itemId === itemId && row.establishmentId === establishmentId 
            ? (row.quantity === 1 ? [] : [{ ...row, quantity: row.quantity - 1 }]) 
            : [row]
        )
      })),

      updateNotes: (itemId, establishmentId, notes) => set((state) => ({
        cart: state.cart.map((row) => 
          row.itemId === itemId && row.establishmentId === establishmentId ? { ...row, notes } : row
        )
      }))
    }),
    {
      name: 'food-park-storage', // Nome da chave no localStorage
      // Salva APENAS o carrinho e o nome do cliente. O resto reseta ao atualizar a página.
      partialize: (state) => ({ 
        cart: state.cart, 
        customerName: state.customerName 
      }),
    }
  )
);