"use client";

import { auth } from "@/lib/firebase";
import { queryClient } from "@/services/queryClient";
import { getMe } from "@/services/userApi";
import { useUserStore } from "@/stores/userStore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setUser } = useUserStore();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (auth) => {
      if (auth) {
        try {
          const me = await getMe();
          queryClient.setQueryData(["user", auth.uid], me);
          setUser(me);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      } else {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, []);
  return <>{children}</>;
}
