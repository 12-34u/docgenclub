import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialFormData = {
    eventName: "",
    eventDate: "",
    eventVenue: "",
    eventStartTime: "",
    eventEndTime: "",
    eventFlow: "",
    docType: "Instagram",
};

export const useFormStore = create(
    persist(
        (set) => ({
            formData: initialFormData,
            setFormData: (updates) =>
                set((state) => ({
                    formData: { ...state.formData, ...updates },
                })),
            resetFormData: () => set({ formData: initialFormData }),
        }),
        {
            name: "equinox-form-storage", // key in localStorage
        },
    ),
);
