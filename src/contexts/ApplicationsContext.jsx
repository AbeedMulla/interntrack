import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";

const ApplicationsContext = createContext(null);

export const ApplicationsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true); // only for first load

  useEffect(() => {
    if (!currentUser) {
      setApplications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const applicationsRef = collection(db, "users", currentUser.uid, "applications");
    const q = query(applicationsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const apps = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setApplications(apps);
        setLoading(false);
      },
      (err) => {
        console.error("Applications listener error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const value = useMemo(() => ({ applications, loading }), [applications, loading]);

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
};

export const useApplications = () => {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) throw new Error("useApplications must be used inside ApplicationsProvider");
  return ctx;
};
