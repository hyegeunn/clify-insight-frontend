import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BaseModal,
  BaseButton,
  BaseSearchInput,
  BaseIcon,
} from "@/components/common";
import styles from "../ManagementView.module.scss";
import type {
  ManagementDepartment,
  DepartmentSelectModalProps,
} from "@/types/pages/management";

const matchDepartment = (
  department: ManagementDepartment,
  keyword: string
): boolean => {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return true;
  }

  return (
    department.name.toLowerCase().includes(normalizedKeyword) ||
    department.subDepartments.some(
      (subDept) =>
        subDept.name.toLowerCase().includes(normalizedKeyword) ||
        subDept.teams.some((team) =>
          team.name.toLowerCase().includes(normalizedKeyword)
        )
    )
  );
};

const DepartmentSelectModal = ({
  isOpen,
  onClose,
  onConfirm,
  onReset,
  selectedDepartment,
  selectedDepartmentId: currentSelectedDepartmentId,
  departments,
}: DepartmentSelectModalProps) => {
  const { t } = useTranslation("pages/management");
  const [departmentSearchValue, setDepartmentSearchValue] = useState("");
  const [selectedPrimaryDepartment, setSelectedPrimaryDepartment] =
    useState<string>("");
  const [selectedSecondaryDepartment, setSelectedSecondaryDepartment] =
    useState<string>("");
  const [selectedTertiaryDepartment, setSelectedTertiaryDepartment] =
    useState<string>("");
  const [selectedDepartmentName, setSelectedDepartmentName] =
    useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);

  // 모달이 열릴 때 현재 선택된 부서를 찾아서 자동 선택
  useEffect(() => {
    if (isOpen && currentSelectedDepartmentId && departments.length > 0) {
      // 전체 departments에서 선택된 ID를 찾기
      let foundPrimary = "";
      let foundSecondary = "";
      let foundTertiary = "";
      let foundName = "";

      // 3단계 depth를 순회하면서 ID 찾기
      for (const dept of departments) {
        // 1depth에서 찾기
        if (dept.id === currentSelectedDepartmentId) {
          foundPrimary = dept.name;
          foundName = dept.name;
          break;
        }

        // 2depth(subDepartments)에서 찾기
        for (const subDept of dept.subDepartments) {
          if (subDept.id === currentSelectedDepartmentId) {
            // 2depth가 선택된 경우
            foundPrimary = dept.name;
            foundSecondary = subDept.name;
            foundName = subDept.name;
            break;
          }

          // 3depth(teams)에서 찾기
          for (const team of subDept.teams) {
            if (team.id === currentSelectedDepartmentId) {
              foundPrimary = dept.name;
              foundSecondary = subDept.name;
              foundTertiary = team.name;
              foundName = team.name;
              break;
            }
          }

          if (foundName) break;
        }

        if (foundName) break;
      }

      // 찾은 정보로 상태 업데이트
      if (foundName) {
        setSelectedPrimaryDepartment(foundPrimary);
        setSelectedSecondaryDepartment(foundSecondary);
        setSelectedTertiaryDepartment(foundTertiary);
        setSelectedDepartmentName(foundName);
        setSelectedDepartmentId(currentSelectedDepartmentId);
      }
    } else if (isOpen && !currentSelectedDepartmentId) {
      // "전체"가 선택된 경우 모든 선택 초기화
      setSelectedPrimaryDepartment("");
      setSelectedSecondaryDepartment("");
      setSelectedTertiaryDepartment("");
      setSelectedDepartmentName("");
      setSelectedDepartmentId(null);
    }
  }, [isOpen, currentSelectedDepartmentId, departments]);

  // 1depth: 검색 필터링 적용
  const filteredDepartments = departments.filter((department) =>
    matchDepartment(department, departmentSearchValue)
  );

  // 2depth: 검색 필터링 적용 (선택된 1depth도 검색 조건에 맞아야 함)
  const secondaryDepartmentOptions = selectedPrimaryDepartment
    ? filteredDepartments.find(
        (department) => department.name === selectedPrimaryDepartment
      )?.subDepartments || []
    : [];

  // 3depth: 검색 필터링 적용
  // 2depth 선택됨 → 해당 부서의 팀만
  // 2depth 선택안됨 → 1depth 하위의 모든 팀
  const tertiaryDepartmentOptions = selectedPrimaryDepartment
    ? selectedSecondaryDepartment
      ? // 2depth 선택됨
        filteredDepartments
          .find((department) => department.name === selectedPrimaryDepartment)
          ?.subDepartments.find(
            (subDept) => subDept.name === selectedSecondaryDepartment
          )?.teams || []
      : // 2depth 선택안됨 → 필터링된 1depth의 모든 팀
        filteredDepartments
          .find((department) => department.name === selectedPrimaryDepartment)
          ?.subDepartments.flatMap((subDept) => subDept.teams) || []
    : [];

  const handlePrimaryDepartmentSelect = (deptName: string, deptId: number) => {
    setSelectedPrimaryDepartment(deptName);
    setSelectedSecondaryDepartment("");
    setSelectedTertiaryDepartment("");
    // 1depth 선택 시 최종 선택으로 설정
    setSelectedDepartmentName(deptName);
    setSelectedDepartmentId(deptId);
  };

  const handleSecondaryDepartmentSelect = (
    subDeptName: string,
    subDeptId: number
  ) => {
    setSelectedSecondaryDepartment(subDeptName);
    setSelectedTertiaryDepartment("");
    // 2depth 선택 시 항상 최종 선택으로 설정
    setSelectedDepartmentName(subDeptName);
    setSelectedDepartmentId(subDeptId);
  };

  const handleTertiaryDepartmentSelect = (teamName: string, teamId: number) => {
    // 3depth 선택 시 부모 2depth도 자동으로 선택
    if (!selectedSecondaryDepartment && selectedPrimaryDepartment) {
      // 2depth가 선택되지 않은 상태에서 3depth 클릭 시, 부모 2depth 찾기
      const parentDept = filteredDepartments
        .find((dept) => dept.name === selectedPrimaryDepartment)
        ?.subDepartments.find((subDept) =>
          subDept.teams.some((team) => team.id === teamId)
        );

      if (parentDept) {
        setSelectedSecondaryDepartment(parentDept.name);
      }
    }

    setSelectedTertiaryDepartment(teamName);
    // 3depth 선택 시 최종 선택으로 설정
    setSelectedDepartmentName(teamName);
    setSelectedDepartmentId(teamId);
  };

  const handleClose = () => {
    setDepartmentSearchValue("");
    setSelectedPrimaryDepartment("");
    setSelectedSecondaryDepartment("");
    setSelectedTertiaryDepartment("");
    setSelectedDepartmentName("");
    setSelectedDepartmentId(null);
    onClose();
  };

  const handleConfirm = () => {
    // 최종 선택된 ID가 있으면 확인
    if (selectedDepartmentId !== null) {
      onConfirm(selectedDepartmentName, selectedDepartmentId);
    }
    handleClose();
  };

  const handleReset = () => {
    setSelectedPrimaryDepartment("");
    setSelectedSecondaryDepartment("");
    setSelectedTertiaryDepartment("");
    setSelectedDepartmentName("");
    setSelectedDepartmentId(null);
    setDepartmentSearchValue("");
    // onReset 호출하여 부모 컴포넌트의 상태도 초기화
    onReset();
  };

  // 선택 초기화 버튼 표시 여부: selectedDepartment가 "전체"가 아닐 때만 표시
  const allOption = t("filter.options.all");
  const showResetButton = selectedDepartment !== allOption;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      width={454}
      contentPadding="0"
      footerPadding="16px 24px"
      footerBorder
      footerBorderColor="#D1D5DB"
      content={
        <div className={styles.deptModalContent}>
          {/* 헤더 */}
          <div className={styles.deptHeader}>
            <div className={styles.deptHeaderTitle}>
              {t("modal.departmentSelect.title")}
            </div>
            <div className={styles.deptSearchInput}>
              <BaseSearchInput
                placeholder={t("modal.departmentSelect.placeholder.search")}
                value={departmentSearchValue}
                onChange={setDepartmentSearchValue}
                height={40}
              />
            </div>
          </div>

          {/* 컨텐츠 (1depth | 2depth | 3depth) */}
          <div className={styles.deptContent}>
            {/* 1depth 목록 (본부) */}
            <div className={styles.dept1List}>
              {filteredDepartments.map((department) => (
                <div
                  key={department.name}
                  className={`${styles.dept1Item} ${
                    selectedPrimaryDepartment === department.name
                      ? styles.selected
                      : ""
                  }`}
                  onClick={() =>
                    handlePrimaryDepartmentSelect(
                      department.name,
                      department.id
                    )
                  }
                >
                  {department.name}
                </div>
              ))}
            </div>

            {/* 2depth 목록 (부서) */}
            <div className={styles.dept2List}>
              {secondaryDepartmentOptions.length > 0 ? (
                secondaryDepartmentOptions.map((subDepartment) => (
                  <div
                    key={subDepartment.name}
                    className={`${styles.dept2Item} ${
                      selectedSecondaryDepartment === subDepartment.name
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() =>
                      handleSecondaryDepartmentSelect(
                        subDepartment.name,
                        subDepartment.id
                      )
                    }
                  >
                    {subDepartment.name}
                  </div>
                ))
              ) : (
                <div className={styles.emptyDept2}>
                  {selectedPrimaryDepartment
                    ? t("modal.departmentSelect.empty.noResult")
                    : t("modal.departmentSelect.empty.selectPrimary")}
                </div>
              )}
            </div>

            {/* 3depth 목록 (팀) */}
            <div className={styles.dept3List}>
              {tertiaryDepartmentOptions.length > 0 ? (
                tertiaryDepartmentOptions.map((team) => (
                  <div
                    key={team.id}
                    className={`${styles.dept3Item} ${
                      selectedTertiaryDepartment === team.name
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() =>
                      handleTertiaryDepartmentSelect(team.name, team.id)
                    }
                  >
                    {team.name}
                  </div>
                ))
              ) : (
                <div className={styles.emptyDept3}>
                  {selectedSecondaryDepartment
                    ? // 선택된 2depth가 있는데 3depth가 없으면 "하위 팀이 없습니다"
                      secondaryDepartmentOptions.find(
                        (dept) => dept.name === selectedSecondaryDepartment
                      )?.teams.length === 0
                      ? t("modal.departmentSelect.empty.noTeam")
                      : t("modal.departmentSelect.empty.noResult")
                    : t("modal.departmentSelect.empty.selectSecondary")}
                </div>
              )}
            </div>
          </div>
        </div>
      }
      footer={
        <div className={styles.deptModalFooter}>
          <div className={styles.deptModalFooterLeft}>
            {showResetButton && (
              <div className={styles.deptResetButton} onClick={handleReset}>
                <BaseIcon name="refresh" width={20} height={20} />
                <span>{t("modal.departmentSelect.button.reset")}</span>
              </div>
            )}
          </div>
          <div className={styles.deptModalFooterRight}>
            <BaseButton
              variant="custom"
              backgroundColor="#ffffff"
              hoverBackgroundColor="#f6f7f8"
              textColor="#333333"
              onClick={handleClose}
              style={{
                height: "44px",
                border: "1px solid #D1D5DB",
                fontSize: "15px",
                fontWeight: "600",
                lineHeight: "130%",
              }}
            >
              {t("modal.departmentSelect.button.cancel")}
            </BaseButton>
            <BaseButton
              variant="custom"
              backgroundColor="#2F6C46"
              hoverBackgroundColor="#52976d"
              textColor="#ffffff"
              onClick={handleConfirm}
              disabled={selectedDepartmentId === null}
              style={{
                height: "44px",
                border: "none",
                fontSize: "15px",
                fontWeight: "600",
                lineHeight: "130%",
              }}
            >
              {t("modal.departmentSelect.button.confirm")}
            </BaseButton>
          </div>
        </div>
      }
    />
  );
};

export default DepartmentSelectModal;
