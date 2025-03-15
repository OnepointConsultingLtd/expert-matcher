import { useEffect, useRef } from "react";
import { useHamburgerStore } from "../context/HamburgerStore";


export default function useHamburger() {
    const { open, setOpen } = useHamburgerStore();
    const menuRef = useRef<HTMLMenuElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
  
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !menuRef.current?.contains(target) &&
        !imgRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
  
    useEffect(() => {
      // Add event listener when the component mounts
      document.addEventListener("mousedown", handleClickOutside);
  
      // Remove event listener when the component unmounts
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [handleClickOutside]);

    return { open, setOpen, menuRef, imgRef };
}
