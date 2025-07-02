import * as React from 'react';

interface AppContextType {
  isTelegramModalOpen: boolean;
  openTelegramModal: () => void;
  closeTelegramModal: () => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isTelegramModalOpen, setIsTelegramModalOpen] = React.useState(false);

  const openTelegramModal = () => setIsTelegramModalOpen(true);
  const closeTelegramModal = () => setIsTelegramModalOpen(false);

  const value = {
    isTelegramModalOpen,
    openTelegramModal,
    closeTelegramModal,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};