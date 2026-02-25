import { createPortal } from "react-dom";
import {
  BaseIcon,
  BaseCircularProgress,
  BaseSelectBox,
  BaseButton,
  BaseInput,
  BaseCheckbox,
  BaseToggle,
  BaseDatePicker,
  BaseDateRangeSelector,
  BaseToast,
} from "@/components/common";
import { ICONS, type IconName } from "@/utils";
import type { IndicatorType } from "@/types";
import { INDICATOR_LABELS } from "@/types";
import styles from "./CommonView.module.scss";

interface CommonViewProps {
  selectedIndicator: IndicatorType;
  setSelectedIndicator: (indicator: IndicatorType) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  checked: boolean;
  setChecked: (checked: boolean) => void;
  activeToggle: string;
  setActiveToggle: (toggle: string) => void;
  selectedDate: string;
  startDate: string;
  endDate: string;
  onDateChange: (value: string) => void;
  showSuccessToast: boolean;
  showErrorToast: boolean;
  onShowSuccessToast: () => void;
  onShowErrorToast: () => void;
  onCloseSuccessToast: () => void;
  onCloseErrorToast: () => void;
}

const CommonView = ({
  selectedIndicator,
  setSelectedIndicator,
  inputValue,
  setInputValue,
  checked,
  setChecked,
  activeToggle,
  setActiveToggle,
  selectedDate,
  startDate,
  endDate,
  onDateChange,
  showSuccessToast,
  showErrorToast,
  onShowSuccessToast,
  onShowErrorToast,
  onCloseSuccessToast,
  onCloseErrorToast,
}: CommonViewProps) => {
  const iconNames = Object.keys(ICONS) as IconName[];

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <div className={styles.header}>
          <h1 className={styles.title}>원형 진행 표시</h1>
          <BaseSelectBox
            options={["스트레스", "불안", "우울"]}
            defaultValue={INDICATOR_LABELS[selectedIndicator]}
            onChange={(value) => {
              const indicatorKey = Object.entries(INDICATOR_LABELS).find(
                ([, label]) => label === value
              )?.[0] as IndicatorType;
              if (indicatorKey) setSelectedIndicator(indicatorKey);
            }}
            width={120}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.progressGrid}>
            <BaseCircularProgress
              value={82}
              status="healthy"
              indicatorType={selectedIndicator}
              label={INDICATOR_LABELS[selectedIndicator]}
            />
            <BaseCircularProgress
              value={64}
              status="good"
              indicatorType={selectedIndicator}
              label={INDICATOR_LABELS[selectedIndicator]}
            />
            <BaseCircularProgress
              value={56}
              status="caution"
              indicatorType={selectedIndicator}
              label={INDICATOR_LABELS[selectedIndicator]}
            />
            <BaseCircularProgress
              value={40}
              status="vulnerable"
              indicatorType={selectedIndicator}
              label={INDICATOR_LABELS[selectedIndicator]}
            />
            <BaseCircularProgress
              value={15}
              status="critical"
              indicatorType={selectedIndicator}
              label={INDICATOR_LABELS[selectedIndicator]}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.header}>
          <h1 className={styles.title}>버튼</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.componentGrid}>
            <BaseButton variant="primary">Primary 버튼</BaseButton>
            <BaseButton variant="secondary">Secondary 버튼</BaseButton>
            <BaseButton variant="outline">Outline 버튼</BaseButton>
            <BaseButton variant="primary" icon="add" iconPosition="left">
              아이콘 버튼
            </BaseButton>
            <BaseButton
              variant="custom"
              backgroundColor="#4ECB71"
              hoverBackgroundColor="#2F6C46"
              textColor="#FFFFFF"
              width={150}
              height={40}
            >
              커스텀 버튼
            </BaseButton>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.header}>
          <h1 className={styles.title}>입력 필드</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.inputExamples}>
            <BaseInput
              placeholder="일반 입력 필드"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <BaseInput
              placeholder="에러가 있는 입력 필드"
              error="필수 입력 항목입니다."
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.header}>
          <h1 className={styles.title}>체크박스</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.componentGrid}>
            <BaseCheckbox
              label="체크박스 (Small)"
              size="sm"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <BaseCheckbox label="체크박스 (Medium)" size="md" />
            <BaseCheckbox label="체크박스 (Large)" size="lg" />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.header}>
          <h1 className={styles.title}>토글</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.componentGrid}>
            <BaseToggle
              tabs={["일간", "주간", "월간"]}
              defaultTab={activeToggle}
              onChange={(tab) => setActiveToggle(tab)}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.header}>
          <h1 className={styles.title}>셀렉트박스</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.componentGrid}>
            <BaseSelectBox options={["옵션 1", "옵션 2", "옵션 3"]} />
            <BaseSelectBox
              options={["스트레스", "불안", "우울"]}
              defaultValue="스트레스"
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.header}>
          <h1 className={styles.title}>날짜 선택</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.componentGrid}>
            <BaseDatePicker />
            <BaseDateRangeSelector
              selectedDate={selectedDate}
              startDate={startDate}
              endDate={endDate}
              onDateChange={onDateChange}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.header}>
          <h1 className={styles.title}>토스트 메시지</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.componentGrid}>
            <BaseButton variant="primary" onClick={onShowSuccessToast}>
              성공 토스트 표시
            </BaseButton>
            <BaseButton variant="secondary" onClick={onShowErrorToast}>
              에러 토스트 표시
            </BaseButton>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.header}>
          <h1 className={styles.title}>아이콘 목록</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.iconGrid}>
            {iconNames.map((iconName) => (
              <div key={iconName} className={styles.iconItem}>
                <div className={styles.iconWrapper}>
                  <BaseIcon name={iconName} size={24} />
                </div>
                <span className={styles.iconName}>{iconName}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showSuccessToast &&
        createPortal(
          <BaseToast
            message="리포트 다운로드가 완료되었습니다."
            type="success"
            iconName="success"
            iconSize={16}
            onClose={onCloseSuccessToast}
          />,
          document.body
        )}

      {showErrorToast &&
        createPortal(
          <BaseToast
            message="리포트 다운로드에 실패했습니다. 다시 시도해 주세요."
            type="error"
            iconName="error"
            iconSize={16}
            onClose={onCloseErrorToast}
          />,
          document.body
        )}
    </div>
  );
};

export default CommonView;
