// import { create } from "zustand";
// import axios from "axios";

// const API_URL = "http://localhost:5000/api/pump"; // your backend base URL

// const usePumpStore = create((set) => ({
//   pumps: [], // 🪣 where we keep all pumps
//   loading: false, // ⚙️ shows when fetching or saving
//   error: null, // ❌ if something goes wrong

//   // 🧠 1️⃣ ADD PUMP
//   addPump: async (pumpData) => {
//     try {
//       set({ loading: true });
//       const res = await axios.post(`${API_URL}/add-pump`, pumpData);
//       set((state) => ({
//         pumps: [...state.pumps, res.data],
//         loading: false,
//       }));
//     } catch (err) {
//       set({ error: err.response?.data?.message || "Failed to add pump", loading: false });
//     }
//   },

//   // 🧠 2️⃣ GET ALL PUMPS
//   getPumps: async () => {
//     try {
//       set({ loading: true });
//       const res = await axios.get(API_URL);
//       set({ pumps: res.data.pumps, loading: false });
//     } catch (err) {
//       set({ error: err.response?.data?.message || "Failed to fetch pumps", loading: false });
//     }
//   },

//   // 🧠 3️⃣ UPDATE PUMP
//   updatePump: async (pumpData) => {
//     try {
//       set({ loading: true });
//       await axios.put(`${API_URL}/update-pump`, pumpData);
//       set((state) => ({
//         pumps: state.pumps.map((p) =>
//           p.pumpId === pumpData.pumpId ? { ...p, ...pumpData } : p
//         ),
//         loading: false,
//       }));
//     } catch (err) {
//       set({ error: err.response?.data?.message || "Failed to update pump", loading: false });
//     }
//   },

//   // 🧠 4️⃣ DELETE PUMP
//   deletePump: async (pumpId) => {
//     try {
//       set({ loading: true });
//       await axios.delete(`${API_URL}/delete-pump`, { data: { pumpId } });
//       set((state) => ({
//         pumps: state.pumps.filter((p) => p.pumpId !== pumpId),
//         loading: false,
//       }));
//     } catch (err) {
//       set({ error: err.response?.data?.message || "Failed to delete pump", loading: false });
//     }
//   },

//   // 🧠 5️⃣ UPDATE PRICE BY FUEL TYPE
//   updatePriceByFuel: async (priceData) => {
//     try {
//       set({ loading: true });
//       await axios.put(`${API_URL}/update-price`, priceData);
//       set({ loading: false });
//     } catch (err) {
//       set({ error: err.response?.data?.message || "Failed to update price", loading: false });
//     }
//   },
// }));

// export default usePumpStore;

import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:5000/api/pump"; // backend base URL

const usePumpStore = create((set) => ({
  pumps: [], // 🪣 all pumps
  loading: false, // ⚙️ loading state
  error: null, // ❌ error message

  // 📦 1️⃣ ADD PUMP
  addPump: async (pumpData) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");

      const res = await axios.post(`${API_URL}/add-pump`, pumpData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set((state) => ({
        pumps: [...state.pumps, res.data],
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to add pump",
        loading: false,
      });
    }
  },

  // 📦 2️⃣ GET ALL PUMPS
  getPumps: async () => {
  try {
    set({ loading: true, error: null });
    const token = localStorage.getItem("token");

    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Use res.data.data instead of res.data.pumps
    set({ pumps: res.data.data || [], loading: false });
  } catch (err) {
    set({
      error: err.response?.data?.message || "Failed to fetch pumps",
      loading: false,
    });
  }
},

  // 📦 3️⃣ UPDATE PUMP
  updatePump: async (pumpData) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");

      await axios.put(`${API_URL}/update-pump`, pumpData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set((state) => ({
        pumps: state.pumps.map((p) =>
          p.pumpId === pumpData.pumpId ? { ...p, ...pumpData } : p
        ),
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update pump",
        loading: false,
      });
    }
  },

  // 📦 4️⃣ DELETE PUMP
  deletePump: async (pumpId) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");

      await axios.post(`${API_URL}/delete-pump`, 
          {pumpId},
        {
        headers: {
          
          Authorization: `Bearer ${token}`,
        },
      }
    );

      set((state) => ({
        pumps: state.pumps.filter((p) => p.pumpId !== pumpId),
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete pump",
        loading: false,
      });
    }
  },

  // 📦 5️⃣ UPDATE PRICE BY FUEL TYPE
  updatePriceByFuel: async (priceData) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem("token");

      await axios.post(`${API_URL}/update-prices`, priceData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ loading: false });
      alert("Prices updated succesfully")
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update price",
        loading: false,
      });
    }
  },
}));

export default usePumpStore;

