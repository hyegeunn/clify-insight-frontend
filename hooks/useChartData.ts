import { useState } from "react";

interface UseChartDataResult<T> {
  data: T[];
  isEmpty: boolean;
  isLoading: boolean;
  setData: (data: T[], isEmpty: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const useChartData = <T>(): UseChartDataResult<T> => {
  const [data, setDataState] = useState<T[]>([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const setData = (newData: T[], empty: boolean) => {
    setDataState(newData);
    setIsEmpty(empty);
    setIsLoading(false);
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const reset = () => {
    setDataState([]);
    setIsEmpty(false);
    setIsLoading(false);
  };

  return { data, isEmpty, isLoading, setData, setLoading, reset };
};

export default useChartData;
