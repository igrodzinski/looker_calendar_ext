import React, { useContext, useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ExtensionProvider40, ExtensionContext40 } from '@looker/extension-sdk-react';
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
const Container = styled.div`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.06);
  padding: 14px;
  max-width: 320px;
  margin: 0 auto;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  user-select: none;

  &:hover {
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.8);
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
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

const Title = styled.h4`
  font-size: 13px;
  font-weight: 700;
  color: #2d3436;
  margin: 0;
  letter-spacing: 0.3px;
`;

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectButton = styled.button`
  width: 100%;
  padding: 10px 14px;
  background: #ffffff;
  border: 1.5px solid rgba(108, 92, 231, 0.25);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #2d3436;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  &:hover {
    border-color: #6c5ce7;
    background: #fcfbfe;
  }

  &:focus {
    border-color: #6c5ce7;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.15);
  }
`;

const ArrowIcon = styled.span<{ isOpen: boolean }>`
  border: solid #6c5ce7;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: ${props => props.isOpen ? 'rotate(-135deg)' : 'rotate(45deg)'};
  transition: transform 0.2s ease-in-out;
  margin-top: ${props => props.isOpen ? '3px' : '-2px'};
`;

const DropdownList = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  max-height: 200px;
  background: #ffffff;
  border: 1px solid rgba(108, 92, 231, 0.15);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(31, 38, 135, 0.12);
  overflow-y: auto;
  z-index: 1000;
  display: ${props => props.isOpen ? 'block' : 'none'};
  animation: slideDown 0.2s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(108, 92, 231, 0.3);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(108, 92, 231, 0.5);
  }
`;

const DropdownItem = styled.div<{ isSelected: boolean }>`
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.isSelected ? '#ffffff' : '#2d3436'};
  background: ${props => props.isSelected ? 'linear-gradient(135deg, #6c5ce7, #8e2de2)' : 'transparent'};
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${props => props.isSelected ? 'linear-gradient(135deg, #6c5ce7, #8e2de2)' : '#f3f0ff'};
    color: ${props => props.isSelected ? '#ffffff' : '#6c5ce7'};
  }

  &:first-child {
    border-top-left-radius: 7px;
    border-top-right-radius: 7px;
  }

  &:last-child {
    border-bottom-left-radius: 7px;
    border-bottom-right-radius: 7px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(108, 92, 231, 0.15);
  border-top-color: #6c5ce7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorText = styled.div`
  color: #d63031;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
`;

const DebugPanel = styled.div`
  margin-top: 12px;
  padding: 10px;
  background: rgba(45, 52, 54, 0.05);
  border: 1px dashed rgba(108, 92, 231, 0.3);
  border-radius: 8px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  color: #2d3436;
  max-height: 150px;
  overflow-y: auto;
  text-align: left;
  word-break: break-all;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(108, 92, 231, 0.2);
    border-radius: 2px;
  }
`;

const DebugTitle = styled.div`
  font-weight: 700;
  color: #6c5ce7;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DebugItem = styled.div`
  margin-bottom: 3px;
`;

const normalizeKey = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9]/g, ''); // keep only alpha-numeric characters
};

const resolveFilterKey = (filters: Record<string, any>, targetLabel: string): string => {
  const keys = Object.keys(filters);
  if (keys.length === 0) return targetLabel;

  // 1. Exact match
  if (filters[targetLabel] !== undefined) return targetLabel;

  const normalizedTarget = normalizeKey(targetLabel);

  // 2. Normalized match (e.g. "dataraportu" matches "data_raportu")
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (normalizeKey(key) === normalizedTarget) {
      return key;
    }
  }

  // 3. Substring match
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const normKey = normalizeKey(key);
    if (normKey.indexOf(normalizedTarget) !== -1 || normalizedTarget.indexOf(normKey) !== -1) {
      return key;
    }
  }

  // 4. If there's only one key, let's use it!
  if (keys.length === 1) {
    return keys[0];
  }

  return targetLabel;
};

// Converts YYYY-MM-DD to DD.MM.YYYY
const toDisplayFormat = (isoDate: string): string => {
  if (!isoDate) return '';
  const trimmed = isoDate.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parts = trimmed.split('-');
    return parts[2] + '.' + parts[1] + '.' + parts[0];
  }
  return trimmed; // fallback if already formatted or different
};

// Converts DD.MM.YYYY or YYYY-MM-DD to YYYY-MM-DD
const toIsoFormat = (dateStr: string): string => {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
    const parts = trimmed.split('.');
    return parts[2] + '-' + parts[1] + '-' + parts[0];
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
};

export const MonthEndFilter: React.FC = () => {
  const context = useContext(ExtensionContext40);
  const tileSDK = context.tileSDK;
  const tileHostData = context.tileHostData;
  const coreSDK = context.coreSDK;

  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Log filter changes for developer visibility in browser console
  useEffect(() => {
    console.log('Looker Calendar Ext - tileHostData:', tileHostData);
    console.log('Looker Calendar Ext - dashboardFilters:', tileHostData && tileHostData.dashboardFilters);
  }, [tileHostData]);

  // Extract the current filter value for "Data Raportu"
  const currentFilters = (tileHostData && tileHostData.dashboardFilters) || {};
  const resolvedFilterKey = resolveFilterKey(currentFilters, 'Data Raportu');
  const currentFilterValueRaw = currentFilters[resolvedFilterKey] || '';
  const currentFilterValue = toIsoFormat(currentFilterValueRaw);

  // Calculate the end of the previous month relative to a date (default: today) in YYYY-MM-DD format
  const getPreviousMonthEndIso = (today: Date): string => {
    const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const yyyy = prevMonthEnd.getFullYear();
    const mm = String(prevMonthEnd.getMonth() + 1).padStart(2, '0');
    const dd = String(prevMonthEnd.getDate()).padStart(2, '0');
    return yyyy + '-' + mm + '-' + dd; // Return YYYY-MM-DD
  };

  // Helper to extract dates from raw query results as YYYY-MM-DD strings
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
            dateSet.add(trimmed);
          } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
            const parts = trimmed.split('.');
            dateSet.add(parts[2] + '-' + parts[1] + '-' + parts[0]);
          }
        }
      }
    }

    const uniqueDates: string[] = [];
    dateSet.forEach((d) => {
      uniqueDates.push(d);
    });

    // Sort descending (newest date first)
    uniqueDates.sort((a, b) => {
      const timeA = new Date(a).getTime();
      const timeB = new Date(b).getTime();
      return timeB - timeA;
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

        // Programmatic fallback if no dates loaded from Looker query (generate as YYYY-MM-DD)
        if (fetchedDates.length === 0) {
          const generatedDates: string[] = [];
          const today = new Date();
          for (let i = 0; i < 24; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 0);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            generatedDates.push(yyyy + '-' + mm + '-' + dd);
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

  // 2. Handle initial filter set and synchronization (always overwrite on start)
  useEffect(() => {
    if (loading || dates.length === 0) return;

    if (!initialized) {
      if (tileSDK) {
        const prevMonthEnd = getPreviousMonthEndIso(new Date());
        const updateObj: Record<string, string> = {};
        updateObj[resolvedFilterKey] = prevMonthEnd;
        tileSDK.updateFilters(updateObj);
        setSelectedValue(prevMonthEnd);
        setInitialized(true);
        // Trigger dashboard auto-refresh to fetch data using our new filter
        tileSDK.runDashboard();
      }
    }
  }, [loading, dates, tileSDK, initialized, resolvedFilterKey]);

  // Update selected value when filter value changes externally (only after initialization)
  useEffect(() => {
    if (initialized && currentFilterValue) {
      setSelectedValue(currentFilterValue);
    }
  }, [currentFilterValue, initialized]);

  const handleItemClick = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
    if (tileSDK) {
      const updateObj: Record<string, string> = {};
      updateObj[resolvedFilterKey] = value;
      tileSDK.updateFilters(updateObj);
      // Automatically refresh the dashboard when the user changes the filter
      tileSDK.runDashboard();
    }
  };

  if (loading) {
    return (
      <Container>
        <GlobalStyles />
        <LoadingContainer>
          <Spinner /> Ładowanie...
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <GlobalStyles />
        <ErrorText>{error}</ErrorText>
      </Container>
    );
  }

  return (
    <Container>
      <GlobalStyles />
      <TitleWrapper onClick={() => setShowDebug(!showDebug)} style={{ cursor: 'pointer' }}>
        <Bullet />
        <Title>Data Raportu</Title>
        <span style={{ fontSize: '9px', opacity: 0.4, marginLeft: 'auto' }}>
          {showDebug ? '▲ ukryj debug' : '▼ debug'}
        </span>
      </TitleWrapper>
      <DropdownContainer ref={dropdownRef}>
        <SelectButton onClick={() => setIsOpen(!isOpen)}>
          {selectedValue ? toDisplayFormat(selectedValue) : 'Wybierz datę...'}
          <ArrowIcon isOpen={isOpen} />
        </SelectButton>
        <DropdownList isOpen={isOpen}>
          {dates.map((d) => {
            return (
              <DropdownItem
                key={d}
                isSelected={d === selectedValue}
                onClick={() => handleItemClick(d)}
              >
                {toDisplayFormat(d)}
              </DropdownItem>
            );
          })}
        </DropdownList>
      </DropdownContainer>
      {showDebug && (
        <DebugPanel>
          <DebugTitle>
            <span>Diagnostyka filtra</span>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={(e) => {
              e.stopPropagation();
              setShowDebug(false);
            }}>zamknij</span>
          </DebugTitle>
          <DebugItem><strong>Dopasowany klucz:</strong> {resolvedFilterKey}</DebugItem>
          <DebugItem><strong>Wybrana wartość (ISO):</strong> {selectedValue || 'brak'}</DebugItem>
          <DebugItem><strong>Wartość w Lookerze (ISO):</strong> {currentFilterValue || 'brak'}</DebugItem>
          <DebugItem><strong>Wartość w Lookerze (surowa):</strong> {currentFilters[resolvedFilterKey] || 'brak'}</DebugItem>
          <DebugItem>
            <strong>Wszystkie filtry w Lookerze:</strong>
            {Object.keys(currentFilters).length > 0 
              ? ' ' + Object.keys(currentFilters).join(', ') 
              : ' Brak (pusta lista)'}
          </DebugItem>
          <DebugItem><strong>Query ID:</strong> {tileHostData?.queryId || 'brak'}</DebugItem>
          <DebugItem><strong>Dashboard ID:</strong> {tileHostData?.dashboardId || 'brak'}</DebugItem>
        </DebugPanel>
      )}
    </Container>
  );
};

export const App: React.FC = () => {
  return (
    <ExtensionProvider40>
      <MonthEndFilter />
    </ExtensionProvider40>
  );
};

const renderApp = () => {
  const root = document.getElementById('app') || (() => {
    const div = document.createElement('div');
    div.id = 'app';
    document.body.appendChild(div);
    return div;
  })();
  ReactDOM.render(<App />, root);
};

if (document.body) {
  renderApp();
} else {
  window.addEventListener('DOMContentLoaded', renderApp);
}
