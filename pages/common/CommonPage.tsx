import { useState } from "react";
import CommonView from "./CommonView";
import type { IndicatorType } from "@/types";
import { useDateRange } from "@/hooks";

const CommonPage = () => {
  const { selectedDate, startDate, endDate, handleDateChange } = useDateRange();
  const [selectedIndicator, setSelectedIndicator] =
    useState<IndicatorType>("stress");
  const [inputValue, setInputValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [activeToggle, setActiveToggle] = useState("일간");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const handleShowSuccessToast = () => {
    setShowSuccessToast(true);
  };

  const handleShowErrorToast = () => {
    setShowErrorToast(true);
  };

  return (
    <CommonView
      selectedIndicator={selectedIndicator}
      setSelectedIndicator={setSelectedIndicator}
      inputValue={inputValue}
      setInputValue={setInputValue}
      checked={checked}
      setChecked={setChecked}
      activeToggle={activeToggle}
      setActiveToggle={setActiveToggle}
      selectedDate={selectedDate}
      startDate={startDate}
      endDate={endDate}
      onDateChange={handleDateChange}
      showSuccessToast={showSuccessToast}
      showErrorToast={showErrorToast}
      onShowSuccessToast={handleShowSuccessToast}
      onShowErrorToast={handleShowErrorToast}
      onCloseSuccessToast={() => setShowSuccessToast(false)}
      onCloseErrorToast={() => setShowErrorToast(false)}
    />
  );
};

export default CommonPage;
