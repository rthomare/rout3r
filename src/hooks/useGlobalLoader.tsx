import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Fade, Heading } from '@chakra-ui/react';
import { LoadingScreen } from '../components/LoadingScreen';

interface LoaderConfig {
  id: string;
  showLoader: boolean;
  helperText?: string;
}

const LoaderContext = createContext<
  | {
      salt: string;
      add: (config: LoaderConfig) => void;
      remove: (config: LoaderConfig) => void;
      values: Map<string, LoaderConfig>;
    }
  | undefined
>(undefined);

export function GlobalLoaderProvider(props: React.PropsWithChildren<{}>) {
  const [values, setValues] = useState<Map<string, LoaderConfig>>(new Map());
  const [salt, setSalt] = useState(Math.random().toString(36).substring(7));
  const add = useCallback(
    (config: LoaderConfig) => {
      const exists = values.get(config.id);
      if (exists) {
        values.set(exists.id, { ...exists, ...config });
      } else {
        values.set(config.id, config);
      }
      setValues(values);
      setSalt(Math.random().toString(36).substring(7));
      return;
    },
    [values]
  );
  const remove = useCallback(
    (config: LoaderConfig) => {
      values.delete(config.id);
      setSalt(Math.random().toString(36).substring(7));
    },
    [values]
  );
  const value = {
    salt,
    add,
    remove,
    values,
  };

  const loaderItem = useMemo(() => {
    let _e: undefined | LoaderConfig;
    values.forEach((element) => {
      if (element.showLoader && !_e) {
        _e = element;
      }
    });
    return _e;
  }, [values, salt]);

  return (
    <LoaderContext.Provider value={value}>
      <Fade
        transition={{
          enter: {
            duration: 0.5,
          },
          exit: {
            duration: 0.2,
          },
        }}
        in={!!loaderItem}
        unmountOnExit
      >
        <LoadingScreen summary={loaderItem?.helperText} />
      </Fade>
      {props.children}
    </LoaderContext.Provider>
  );
}

export function useGlobalLoader(config: LoaderConfig) {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error(
      'useGlobalLoader must be used within a GlobalLoaderProvider'
    );
  }
  const { add, remove } = context;
  useEffect(() => {
    if (config.showLoader) {
      add(config);
    } else {
      remove(config);
    }
    return () => {
      remove(config);
    };
  }, [config.showLoader, add, remove]);
}
