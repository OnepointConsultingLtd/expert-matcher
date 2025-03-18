import { create } from 'zustand';

type Hamburger = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useHamburgerStore = create<Hamburger>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
