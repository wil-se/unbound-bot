import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const SLOW_INTERVAL = 60000;
const FAST_INTERVAL = 1000;

const RefreshContext = React.createContext({ slow: 0, fast: 0 });

const useIsBrowserTabActive = () => {
  const isBrowserTabActiveRef = useRef(true);

  useEffect(() => {
    const onVisibilityChange = () => {
      isBrowserTabActiveRef.current = !document.hidden;
    };

    window.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return isBrowserTabActiveRef;
};

const RefreshContextProvider = ({ children }) => {
  const [slow, setSlow] = useState(0);
  const [fast, setFast] = useState(0);
  const isBrowserTabActiveRef = useIsBrowserTabActive();

  useEffect(() => {
    const interval = setInterval(() => {
      if (isBrowserTabActiveRef.current) {
        setFast(prev => prev + 1);
      }
    }, FAST_INTERVAL);
    return () => clearInterval(interval);
  }, [isBrowserTabActiveRef]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isBrowserTabActiveRef.current) {
        setSlow(prev => prev + 1);
      }
    }, SLOW_INTERVAL);
    return () => clearInterval(interval);
  }, [isBrowserTabActiveRef]);

  return (
    <RefreshContext.Provider value={{ slow, fast }}>
      {children}
    </RefreshContext.Provider>
  );
};

RefreshContextProvider.propTypes = {
  children: PropTypes.element,
};

export { RefreshContext, RefreshContextProvider };