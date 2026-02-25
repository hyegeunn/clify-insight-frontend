import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "@/stores/languageStore";

const TARGET_SEQUENCE = "i18n";
const RESET_DELAY = 2000;

export const useKeyboardLanguageToggle = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const typedSequenceRef = useRef<string>("");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      typedSequenceRef.current += key;

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }

      resetTimerRef.current = setTimeout(() => {
        typedSequenceRef.current = "";
      }, RESET_DELAY);

      if (typedSequenceRef.current.includes(TARGET_SEQUENCE)) {
        const newLang = language === "ko" ? "en" : "ko";
        setLanguage(newLang);
        i18n.changeLanguage(newLang);
        typedSequenceRef.current = "";

        if (resetTimerRef.current) {
          clearTimeout(resetTimerRef.current);
        }
      }
    };

    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, [i18n, language, setLanguage]);
};
