
import { useState, useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import { Customer } from '@/types';

export const useBirthdayInfo = (client: Customer | null) => {
  const [isBirthday, setIsBirthday] = useState(false);
  const [nextBirthdayDate, setNextBirthdayDate] = useState<string | null>(null);

  const calculateBirthdayInfo = (customer: Customer | null) => {
    if (!customer?.birthdate) {
      setIsBirthday(false);
      setNextBirthdayDate(null);
      return;
    }

    const today = new Date();
    
    try {
      // Create Date object from the birthdate string
      const birthdate = new Date(customer.birthdate);
      
      if (isNaN(birthdate.getTime())) {
        setIsBirthday(false);
        setNextBirthdayDate(null);
        return;
      }
      
      // Get current year's birthday
      const currentYearBirthday = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate());
      
      // Get next year's birthday (for when this year's birthday has already passed)
      const nextYearBirthday = new Date(today.getFullYear() + 1, birthdate.getMonth(), birthdate.getDate());
      
      // Determine if today is the birthday
      if (
        today.getDate() === currentYearBirthday.getDate() && 
        today.getMonth() === currentYearBirthday.getMonth()
      ) {
        setIsBirthday(true);
        setNextBirthdayDate("hoje");
      } 
      // Calculate days until next birthday
      else {
        setIsBirthday(false);
        // Use the appropriate reference date (this year or next year)
        const referenceDate = today > currentYearBirthday ? nextYearBirthday : currentYearBirthday;
        const daysUntilBirthday = differenceInDays(referenceDate, today);
        
        if (daysUntilBirthday <= 7) {
          setNextBirthdayDate(`em ${daysUntilBirthday} ${daysUntilBirthday === 1 ? 'dia' : 'dias'}`);
        } else if (daysUntilBirthday <= 30) {
          setNextBirthdayDate(`em ${daysUntilBirthday} dias`);
        } else {
          setNextBirthdayDate(null);
        }
      }
    } catch (error) {
      console.error("Error calculating birthday:", error);
      setIsBirthday(false);
      setNextBirthdayDate(null);
    }
  };

  // Calculate on initial render and when client changes
  useEffect(() => {
    calculateBirthdayInfo(client);
  }, [client?.birthdate]);

  return {
    isBirthday,
    nextBirthdayDate,
    recalculateBirthdayInfo: calculateBirthdayInfo
  };
};
