import React, {
  createContext,
  useContext,
  useState,
} from 'react';

import {
  mills as initialMills,
  suppliers as initialSuppliers,
  reelTypes as initialReelTypes,
}  from "../pages/data/mockData";

const AppContext = createContext();

export function AppProvider({ children }) {
  // Mock Data States
  const [suppliers, setSuppliers] =
    useState(initialSuppliers);

  const [mills, setMills] =
    useState(initialMills);

  const [reelTypes, setReelTypes] =
    useState(initialReelTypes);

  // Toast
  const [toastInfo, setToastInfo] =
    useState(null);

  // Modal
  const [modal, setModal] =
    useState(null);

  // Settings
  const [settings, setSettings] = useState({
    corrugationFactor: 0.45,
    decimals: 3,
    alerts: true,
  });

  const showToast = (
    msg,
    sub = '',
    isError = false
  ) => {
    setToastInfo({
      msg,
      sub,
      isError,
    });

    setTimeout(() => {
      setToastInfo(null);
    }, 3200);
  };

  const openSheet = (
    title,
    body,
    foot = null
  ) => {
    setModal({
      title,
      body,
      foot,
    });
  };

  const closeSheet = () => {
    setModal(null);
  };

  return (
    <AppContext.Provider
      value={{
        // Toast
        toastInfo,
        showToast,

        // Modal
        modal,
        openSheet,
        closeSheet,

        // Settings
        settings,
        setSettings,

        // Mock Data
        suppliers,
        setSuppliers,

        mills,
        setMills,

        reelTypes,
        setReelTypes,

      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}