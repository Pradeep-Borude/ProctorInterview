import { createContext, useContext, useState } from "react";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };
  return (
    <SessionContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionRefresh = () => useContext(SessionContext);
