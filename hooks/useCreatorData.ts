import { useContext } from 'react';
import { CreatorDataContext } from '../contexts/CreatorDataContext';

export const useCreatorData = () => {
  const context = useContext(CreatorDataContext);
  if (context === undefined) {
    throw new Error('useCreatorData must be used within a CreatorDataProvider');
  }
  return context;
};