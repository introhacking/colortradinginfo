import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiService } from '../services/apiService'
import { toast } from 'sonner';



// ✅ Helper to get token from localStorage
const getUserLoginId = () => {
    const loginInfo = JSON.parse(localStorage.getItem("loginInfo"));
    return loginInfo?.user?.id || null;
};


const liveMarquee = (set) => ({
    top20Stocks: [],
    setTop20Stocks: (liveData) => {
        return set({
            top20Stocks: liveData
        })
    },
})

export const liveDataMarque = create(persist(liveMarquee, { name: 'liveDataMarque' }))


export const useTrackingStore = create((set, get) => ({
    trackingData: [],
    loading: false,
    // ✅ Get all records
    getTrackingData: () => get().trackingData,

    // ✅ Add new record
    getTrackingDatabasedUponId: async () => {
        try {
            set({ loading: true }); // 🔹 start loading
            const userId = await getUserLoginId();
            // 🔹 Fetch tracking list from server
            const res = await apiService.getInfoFromServer(`tracking/${userId}`);
            // 🔹 Update Zustand store with response (replace or merge)
            set(() => ({
                trackingData: res.trackingList || [], // ensure fallback
                loading: false, // 🔹 stop loading
            }));
        } catch (err) {
            console.error("Error fetching tracking data:", err);
            set({ loading: false }); // 🔹 stop loading on error
            throw err;
        }
    },


    addTrackingRecord: async (record) => {
        try {
            const userId = await getUserLoginId();
            // call API here
            const res = await apiService.postFormInfoToServer("tracking/add", { userId, ...record });
            // ✅ update local state on success
            set((state) => ({
                trackingData: [...state.trackingData, record],
            }));

            // ✅ show success message
            toast.success(res.data || "Stock added successfully!");
            return res;
        } catch (err) {
            console.error("Error posting tracking record:", err);
            if (err.status === 400 && err.data?.error) {
                // ⚠️ show duplicate warning
                toast.warning(err.data.error);
            } else {
                // ❌ fallback error
                toast.error("Something went wrong, please try again.");
            }
            throw err;
        }
    },


    // ✅ Remove record by id (or index)
    removeTrackingRecord: async (stockId) => {
        try {
            // Call API (make sure deletingById appends stockId in URL properly)
            const userId = await getUserLoginId();
            const res = await apiService.deletingById(`tracking/remove`, stockId);

            if (res.success) {
                // Update state
                set((state) => ({
                    trackingData: state.trackingData.filter(
                        (item) => item._id !== stockId
                    ),
                }));

                toast.success(res.message || "Stock removed successfully");
            } else {
                toast.error(res.message || "Failed to remove stock");
            }
        } catch (err) {
            toast.error("Server error while removing stock");
        }
    }

}));