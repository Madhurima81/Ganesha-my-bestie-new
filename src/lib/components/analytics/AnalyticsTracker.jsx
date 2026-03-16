import { createContext, useContext } from 'react';
import { Analytics } from '../../services/analytics';

const AnalyticsContext = createContext(Analytics);

export const useAnalytics = () => useContext(AnalyticsContext);

export const AnalyticsTracker = ({ children }) => (
  <AnalyticsContext.Provider value={Analytics}>
    {children}
  </AnalyticsContext.Provider>
);
