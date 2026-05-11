 "use client";
 import ChangeProfile from "./changeProfile";
 import ChangePassword from "./changePassword";
 import Address from "./address";
 import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
 
   return (
     <>
       {loading ? (
         <LoadingSpinner label="Đang tải..." />
       ) : (
         user && (
           <ChangeProfile user={user} onProfileUpdated={refreshUser} />
         )
       )}
 
       <div className="space-y-8">
         <ChangePassword />
         <Address />
       </div>
     </>
   );
 }
