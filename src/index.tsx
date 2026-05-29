import React, { useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ExtensionProvider, ExtensionContext } from '@looker/extension-sdk-react';
import { ComponentsProvider } from '@looker/components-providers';
import { Select } from '@looker/components/Form/Inputs/Select';
import { Box } from '@looker/components/Layout/Box';
import { Card } from '@looker/components/Card';
import { Heading } from '@looker/components/Text/Heading';
import { Text } from '@looker/components/Text/Text';
import { Spinner } from '@looker/components/Spinner';
import styled, { createGlobalStyle } from 'styled-components';

// Global styles for modern typography and smooth animations
const GlobalStyles = createGlobalStyle`
  body {
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 0;
    background: transparent;
    overflow: hidden;
  }
`;

// Beautiful glassmorphism card layout for premium look and feel
const StyledCard = styled(Card)`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.08);
  padding: 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 320px;
  margin: 0 auto;

  &:hover {
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Bullet = styled.div`
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  border-radius: 50%;
  box-shadow: 0 0 8px #6c5ce7;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(108, 92, 231, 0.7);
    }
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 6px rgba(108, 92, 231, 0);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(108, 92, 231, 0);
    }
  }
`;

const SelectContainer = styled.div`
  position: relative;
  
  .looker-Select-input {
    border-radius: 8px;
    border: 1.5px solid rgba(108, 92, 231, 0.2);
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    font-size: 14px;
    font-weight: 500;
    color: #2d3436;

    &:focus, &:focus-within {
      border-color: #6c5ce7;
      box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.15);
    }
  }
`;

export const MonthEndFilter: React.FC = () => {
  const context = useContext(ExtensionContext);
  const tileSDK = context.tileSDK;
  const tileHostData = context.tileHostData;
  const coreSDK = context.coreSDK;

  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string>('');

  // Extract the current filter value for "Data Raportu"
  const currentFilters = (tileHostData && tileHostData.dashboardFilters) || {};
  const currentFilterValue = currentFilters['Data Raportu'] || '';

  // Format YYYY-MM-DD to DD.MM.YYYY
  const toDisplayFormat = (dateStr: string): string => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return parts[2] + '.' + parts[1] + '.' + parts[0];
  };

  // Format DD.MM.YYYY to YYYY-MM-DD
  const toApiFormat = (dateStr: string): string => {
    if (!dateStr || !dateStr.includes('.')) return dateStr;
    const parts = dateStr.split('.');
    if (parts.length !== 3) return dateStr;
    return parts[2] + '-' + parts[1] + '-' + parts[0];
  };

  // Calculate the end of the previous month relative to a date (default: today)
  const getPreviousMonthEndFormatted = (today: Date): string => {
    // Setting date to 0 gets the last day of the previous month
    const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const yyyy = prevMonthEnd.getFullYear();
    const mm = String(prevMonthEnd.getMonth() + 1).padStart(2, '0');
    const dd = String(prevMonthEnd.getDate()).padStart(2, '0');
    return dd + '.' + mm + '.' + yyyy; // Return DD.MM.YYYY
  };

  // Helper to extract dates from raw query results
  const extractDatesFromResults = (results: any[]): string[] => {
    const dateSet = new Set<string>();
    if (!results || !Array.isArray(results)) return [];

    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      if (!row) continue;
      const keys = Object.keys(row);
      for (let j = 0; j < keys.length; j++) {
        const val = row[keys[j]];
        if (typeof val === 'string') {
          const trimmed = val.trim();
          if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            const parts = trimmed.split('-');
            dateSet.add(parts[2] + '.' + parts[1] + '.' + parts[0]);
          } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
            dateSet.add(trimmed);
          }
        }
      }
    }

    const uniqueDates: string[] = [];
    dateSet.forEach((d) => {
      uniqueDates.push(d);
    });

    uniqueDates.sort((a, b) => {
      const partsA = a.split('.');
      const partsB = b.split('.');
      const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0]));
      const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0]));
      return dateB.getTime() - dateA.getTime();
    });

    return uniqueDates;
  };

  // Load Outfit font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // 1. Fetch dates on mount
  useEffect(() => {
    const fetchDates = async () => {
      try {
        setLoading(true);
        let fetchedDates: string[] = [];

        // Attempt to load from tileHostData query if it exists
        if (tileHostData && tileHostData.queryId) {
          try {
            const results = await coreSDK.ok(
              coreSDK.run_query({
                query_id: String(tileHostData.queryId),
                result_format: 'json',
              })
            );
            fetchedDates = extractDatesFromResults(results);
          } catch (queryErr) {
            console.warn('Could not run query associated with tile, falling back...', queryErr);
          }
        }

        // Programmatic fallback if no dates loaded from Looker query
        if (fetchedDates.length === 0) {
          const generatedDates: string[] = [];
          const today = new Date();
          for (let i = 0; i < 24; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 0);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            generatedDates.push(dd + '.' + mm + '.' + yyyy);
          }
          fetchedDates = generatedDates;
        }

        setDates(fetchedDates);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dates:', err);
        setError('Błąd ładowania dat');
        setLoading(false);
      }
    };

    fetchDates();
  }, [coreSDK, tileHostData]);

  // 2. Handle initial filter set and synchronization
  useEffect(() => {
    if (loading || dates.length === 0) return;

    // Check if the dashboard filter "Data Raportu" is already set.
    // If not, calculate the last day of the previous month and update the dashboard.
    if (!currentFilterValue) {
      if (tileSDK) {
        const prevMonthEnd = getPreviousMonthEndFormatted(new Date());
        tileSDK.updateFilters({
          'Data Raportu': prevMonthEnd,
        });
        setSelectedValue(prevMonthEnd);
      }
    } else {
      setSelectedValue(currentFilterValue);
    }
  }, [loading, dates, currentFilterValue, tileSDK]);

  // Update selected value when filter value changes externally
  useEffect(() => {
    if (currentFilterValue) {
      setSelectedValue(currentFilterValue);
    }
  }, [currentFilterValue]);

  const handleSelectChange = (value: string) => {
    setSelectedValue(value);
    if (tileSDK) {
      tileSDK.updateFilters({
        'Data Raportu': value,
      });
    }
  };

  if (loading) {
    return (
      <ComponentsProvider>
        <GlobalStyles />
        <Box display="flex" alignItems="center" justifyContent="center" height="100px">
          <Spinner size={32} />
        </Box>
      </ComponentsProvider>
    );
  }

  if (error) {
    return (
      <ComponentsProvider>
        <GlobalStyles />
        <Box display="flex" alignItems="center" justifyContent="center" height="100px">
          <Text color="critical" fontSize="small" fontWeight="semiBold">
            {error}
          </Text>
        </Box>
      </ComponentsProvider>
    );
  }

  // Map dates to options
  const options = dates.map((d) => {
    return {
      label: d,
      value: d,
    };
  });

  return (
    <ComponentsProvider>
      <GlobalStyles />
      <Box p="xsmall">
        <StyledCard>
          <TitleWrapper>
            <Bullet />
            <Heading as="h4" fontSize="small" fontWeight="bold" color="#2d3436" m="none">
              Data Raportu
            </Heading>
          </TitleWrapper>
          <SelectContainer>
            <Select
              options={options}
              value={selectedValue}
              onChange={handleSelectChange}
              placeholder="Wybierz datę..."
            />
          </SelectContainer>
        </StyledCard>
      </Box>
    </ComponentsProvider>
  );
};

export const App: React.FC = () => {
  return (
    <ExtensionProvider>
      <MonthEndFilter />
    </ExtensionProvider>
  );
};

const root = document.getElementById('app') || (() => {
  const div = document.createElement('div');
  div.id = 'app';
  document.body.appendChild(div);
  return div;
})();

ReactDOM.render(<App />, root);
