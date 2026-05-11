 "use client";

 import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useState,
   type ReactNode,
 } from "react";
 import { userServices } from "@/components/services/user.services";
 import type { IUser } from "@/types/user.type";

 interface UserContextType {
   user: IUser | null;
   loading: boolean;
   refreshUser: () => Promise<void>;
   setUser: (user: IUser | null) => void;
 }

 const UserContext = createContext<UserContextType | null>(null);

 export function UserProvider({ children }: { children: ReactNode }) {
   const [user, setUser] = useState<IUser | null>(null);
   const [loading, setLoading] = useState<boolean>(true);

   const fetchUser = useCallback(async () => {
     setLoading(true);
     try {
       const res = await userServices.getProfileUser();
       setUser(res.user);
     } finally {
       setLoading(false);
     }
   }, []);

   useEffect(() => {
     void fetchUser();
   }, [fetchUser]);

   const value: UserContextType = {
     user,
     loading,
     refreshUser: fetchUser,
     setUser,
   };

   return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
 }

 export function useUser() {
   const context = useContext(UserContext);
   if (!context) {
     throw new Error("useUser must be used within UserProvider");
   }
   return context;
 }

