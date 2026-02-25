import { useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { BaseButton, BaseToast } from "@/components/common";
import BaseReportOverlay from "./BaseReportOverlay";
import type { BaseReportDownloadProps } from "@/types/common";

// 메뉴 아이템 정의 (Sidebar와 동일)
const menuItems = [
  {
    id: "home",
    label: "홈",
    path: "/home",
  },
  {
    id: "organization",
    label: "조직진단",
    children: [{ id: "fav", label: "FAV", path: "/fav" }],
  },
  {
    id: "solution",
    label: "솔루션 이용 현황",
    children: [
      {
        id: "psy-counseling",
        label: "심리상담",
        path: "/psy-counseling",
      },
      {
        id: "psy-test",
        label: "심리검사",
        path: "/psy-test",
      },
      {
        id: "psy-test-consultation",
        label: "심리검사+해석상담",
        path: "/psy-test-consultation",
      },
      {
        id: "coaching",
        label: "코칭",
        path: "/coaching",
      },
      {
        id: "partner",
        label: "제휴 서비스",
        path: "/partner",
      },
    ],
  },
  {
    id: "settlement",
    label: "이용 내역 및 정산",
    children: [
      {
        id: "employee-usage",
        label: "임직원별 이용 내역",
        path: "/employee-usage",
      },
      {
        id: "team-usage",
        label: "팀별 이용 내역",
        path: "/team-usage",
      },
      {
        id: "billing",
        label: "정산",
        path: "/billing",
      },
    ],
  },
  {
    id: "management",
    label: "임직원 관리",
    path: "/management",
  },
];

// 경로로부터 메뉴명 찾기
const getMenuNameFromPath = (pathname: string): string => {
  for (const item of menuItems) {
    if (item.path === pathname) {
      return item.label;
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.path === pathname) {
          return child.label;
        }
      }
    }
  }
  return "리포트";
};

// 날짜 포맷팅 (YYYY년 M월 -> YYYYMM)
const formatDateForFileName = (selectedDate: string): string => {
  const match = selectedDate.match(/(\d{4})년\s*(\d{1,2})월/);
  if (match) {
    const [, year, month] = match;
    return `${year}${month.padStart(2, "0")}`;
  }
  // 형식이 맞지 않으면 오늘 날짜 사용
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}${month}`;
};

const BaseReportDownload = ({
  onDownload,
  buttonText = "리포트 다운로드",
  iconSize = 16,
  height = 34,
  disabled = false,
  menuName,
  selectedDate,
}: BaseReportDownloadProps) => {
  const location = useLocation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    setIsDownloading(true);

    try {
      // main 태그의 content 영역 찾기
      const mainElement = document.querySelector("main");
      if (!mainElement) {
        console.error("main 요소를 찾을 수 없습니다.");
        setIsDownloading(false);
        return;
      }

      // 오버레이가 렌더링될 시간을 주기 위해 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 원본 요소의 원래 스타일 저장
      const originalWidth = mainElement.style.width;
      const originalMinWidth = mainElement.style.minWidth;

      // 원본 요소를 1680px로 확장
      mainElement.style.width = "1680px";
      mainElement.style.minWidth = "1680px";

      // 리포트 다운로드 버튼 숨기기 (캡처에서 제외)
      const reportButtons = document.querySelectorAll(
        '[data-report-download="true"]'
      );
      reportButtons.forEach((button) => {
        (button as HTMLElement).style.display = "none";
      });

      // 확장 후 차트 리사이즈 완료 대기
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 높이 계산
      const componentWidth = 1680;
      let maxHeight = 0;
      const children = mainElement.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        const childBottom = child.offsetTop + child.offsetHeight;
        maxHeight = Math.max(maxHeight, childBottom);
      }

      const componentHeight = Math.max(
        maxHeight,
        mainElement.scrollHeight,
        mainElement.offsetHeight,
        mainElement.clientHeight
      );

      // PDF 생성
      const canvas = await html2canvas(mainElement, {
        scale: 2, // 화질 개선
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#f6f7f8",
        width: componentWidth,
        height: componentHeight,
        windowWidth: componentWidth,
        windowHeight: componentHeight,
      });

      // 원본 스타일 복원
      mainElement.style.width = originalWidth;
      mainElement.style.minWidth = originalMinWidth;

      // 리포트 다운로드 버튼 다시 보이기
      reportButtons.forEach((button) => {
        (button as HTMLElement).style.display = "";
      });

      const orientation = componentWidth >= componentHeight ? "l" : "p";
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation,
        unit: "px",
      });

      pdf.internal.pageSize.width = componentWidth;
      pdf.internal.pageSize.height = componentHeight;

      pdf.addImage(imgData, "PNG", 0, 0, componentWidth, componentHeight);

      const finalMenuName = menuName || getMenuNameFromPath(location.pathname);
      const dateStr = selectedDate
        ? formatDateForFileName(selectedDate)
        : new Date().toISOString().split("T")[0].replace(/-/g, "");
      const fileName = `${finalMenuName}_${dateStr}.pdf`;

      pdf.save(fileName);

      // 성공 토스트 표시
      setToastType("success");
      setToastMessage("리포트 다운로드가 완료되었습니다.");
      setShowToast(true);
    } catch (error) {
      console.error("리포트 다운로드 실패:", error);

      // 실패 토스트 표시
      setToastType("error");
      setToastMessage("리포트 다운로드에 실패했습니다. 다시 시도해 주세요.");
      setShowToast(true);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div data-report-download="true">
        <BaseButton
          variant="custom"
          width={140}
          icon="download"
          iconPosition="left"
          iconSize={iconSize}
          iconColor="#FFFFFF"
          onClick={handleDownload}
          disabled={disabled || isDownloading}
          style={{
            height: `${height}px`,
            backgroundColor: "var(--color-primary)",
            color: "var(--color-white)",
            fontSize: "12px",
            fontWeight: 500,
            borderRadius: "8px",
            gap: "8px",
          }}
        >
          {isDownloading ? "생성 중..." : buttonText}
        </BaseButton>
      </div>
      {isDownloading && createPortal(<BaseReportOverlay />, document.body)}
      {showToast &&
        createPortal(
          <BaseToast
            message={toastMessage}
            type={toastType}
            iconName={toastType === "success" ? "success" : "error"}
            iconSize={16}
            onClose={() => setShowToast(false)}
          />,
          document.body
        )}
    </>
  );
};

export default BaseReportDownload;
