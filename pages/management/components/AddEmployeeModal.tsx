import { useState, useEffect, useMemo } from "react";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  BaseModal,
  BaseInput,
  BaseButton,
  BaseSearchInput,
  BaseFilterSelect,
} from "@/components/common";
import { isValidPhone } from "@/utils/validation";
import styles from "../ManagementView.module.scss";
import type {
  AddEmployeeModalProps,
  ManagementDepartment,
  ManagementNewEmployee,
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

const AddEmployeeModal = ({
  isOpen,
  onClose,
  onSubmit,
  departments,
  apiErrors,
}: AddEmployeeModalProps) => {
  const { t } = useTranslation("pages/management");
  const [newEmployee, setNewEmployee] = useState<ManagementNewEmployee>({
    name: "",
    department: "",
    organizationId: 0,
    employeeNumber: "",
    phone: "",
    jobPosition: "",
    birthDate: "",
    gender: "",
  });
  const [departmentSearchValue, setDepartmentSearchValue] = useState("");
  const [selectedPrimaryDepartment, setSelectedPrimaryDepartment] =
    useState<string>("");
  const [selectedSecondaryDepartment, setSelectedSecondaryDepartment] =
    useState<string>("");
  const [errors, setErrors] = useState({
    employeeNumber: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    jobPosition: "",
  });

  // 모달이 열릴 때 모든 필드 초기화
  useEffect(() => {
    if (isOpen) {
      setNewEmployee({
        name: "",
        department: "",
        organizationId: 0,
        employeeNumber: "",
        phone: "",
        jobPosition: "",
        birthDate: "",
        gender: "",
      });
      setSelectedPrimaryDepartment("");
      setSelectedSecondaryDepartment("");
      setDepartmentSearchValue("");
      setErrors({
        employeeNumber: "",
        email: "",
        phone: "",
        birthDate: "",
        gender: "",
        jobPosition: "",
      });
    }
  }, [isOpen]);

  // API 에러가 변경되면 로컬 에러 상태에 반영
  useEffect(() => {
    if (apiErrors) {
      setErrors((prev) => ({
        ...prev,
        employeeNumber: apiErrors.employeeNumber || "",
        email: apiErrors.email || "",
        phone: apiErrors.phone || "",
      }));
    }
  }, [apiErrors]);

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
    // 1depth 선택 시 최종 선택으로 설정
    setNewEmployee((prev) => ({
      ...prev,
      department: deptName,
      organizationId: deptId,
    }));
  };

  const handleSecondaryDepartmentSelect = (
    subDeptName: string,
    subDeptId: number
  ) => {
    setSelectedSecondaryDepartment(subDeptName);
    // 2depth 선택 시 항상 최종 선택으로 설정
    setNewEmployee((prev) => ({
      ...prev,
      department: subDeptName,
      organizationId: subDeptId,
    }));
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

    setNewEmployee((prev) => ({
      ...prev,
      department: teamName,
      organizationId: teamId,
    }));
  };

  const handleClose = () => {
    setNewEmployee({
      name: "",
      department: "",
      organizationId: 0,
      employeeNumber: "",
      phone: "",
      jobPosition: "",
      birthDate: "",
      gender: "",
    });
    setSelectedPrimaryDepartment("");
    setSelectedSecondaryDepartment("");
    setDepartmentSearchValue("");
    setErrors({
      employeeNumber: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "",
      jobPosition: "",
    });
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors = {
      employeeNumber: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "",
      jobPosition: "",
    };

    // 연락처 검증: 전화번호 형식
    if (newEmployee.phone && !isValidPhone(newEmployee.phone)) {
      newErrors.phone = t("modal.addEmployee.error.phoneFormat");
    }

    // 생년월일 검증: YYYY.MM.DD 형식 (8자리 숫자)
    if (newEmployee.birthDate) {
      const numbers = newEmployee.birthDate.replace(/[^\d]/g, "");
      if (numbers.length !== 8) {
        newErrors.birthDate = t("modal.addEmployee.error.birthDateFormat");
      }
    }

    // 성별 검증: 필수 입력
    if (!newEmployee.gender || newEmployee.gender.trim() === "") {
      newErrors.gender = t("modal.addEmployee.error.genderRequired");
    }

    // 직급 검증: 필수 입력
    if (!newEmployee.jobPosition || newEmployee.jobPosition.trim() === "") {
      newErrors.jobPosition = t("modal.addEmployee.error.jobPositionRequired");
    }

    setErrors(newErrors);

    // 모든 에러가 비어있으면 유효함
    return (
      !newErrors.employeeNumber &&
      !newErrors.email &&
      !newErrors.phone &&
      !newErrors.birthDate &&
      !newErrors.gender &&
      !newErrors.jobPosition
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // API 전송 시 생년월일을 YYYY-MM-DD 형식으로 변환
    const employeeData = {
      ...newEmployee,
      birthDate: convertBirthDateToApiFormat(newEmployee.birthDate),
    };

    await onSubmit(employeeData);
  };

  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "");

    // 길이에 따라 하이픈 추가
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
        7,
        11
      )}`;
    }
  };

  const formatBirthDate = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "");

    // 길이에 따라 하이픈 추가 (YYYY-MM-DD)
    if (numbers.length <= 4) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    } else {
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(
        6,
        8
      )}`;
    }
  };

  const convertBirthDateToApiFormat = (value: string): string => {
    // YYYY-MM-DD 형식이 이미 맞으므로 그대로 반환
    // 만약 숫자만 있다면 하이픈 추가
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length === 8) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(
        6,
        8
      )}`;
    }
    return value;
  };

  const handleEmployeeFieldChange =
    (field: keyof ManagementNewEmployee) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      let { value } = event.target;

      // 연락처 필드인 경우 자동 하이픈 추가
      if (field === "phone") {
        value = formatPhoneNumber(value);
      }

      // 생년월일 필드인 경우 자동 점 추가
      if (field === "birthDate") {
        value = formatBirthDate(value);
      }

      setNewEmployee((prev) => ({ ...prev, [field]: value }));

      // 입력 시 해당 필드 에러 초기화
      if (
        field === "employeeNumber" ||
        field === "email" ||
        field === "phone" ||
        field === "birthDate" ||
        field === "jobPosition"
      ) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  // 모든 필드가 입력되었는지 확인
  const isFormValid =
    newEmployee.name.trim() !== "" &&
    newEmployee.department.trim() !== "" &&
    newEmployee.employeeNumber.trim() !== "" &&
    newEmployee.phone.trim() !== "" &&
    newEmployee.jobPosition.trim() !== "" &&
    newEmployee.birthDate.trim() !== "" &&
    newEmployee.gender.trim() !== "";

  const genderOptions = useMemo(
    () => [t("gender.male"), t("gender.female")],
    [t]
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("modal.addEmployee.title")}
      width={895}
      headerPadding="24px"
      headerBorder
      contentPadding="24px 24px 0 24px"
      footerPadding="32px 24px"
      footerBorder={false}
      content={
        <div className={styles.modalContent}>
          {/* Left: 이름, 사번, 생년월일, 연락처 */}
          <div className={styles.modalLeft}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                {t("modal.addEmployee.label.name")}
              </label>
              <BaseInput
                placeholder={t("modal.addEmployee.placeholder.name")}
                value={newEmployee.name}
                onChange={handleEmployeeFieldChange("name")}
              />
              <div className={styles.inputHint}></div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                {t("modal.addEmployee.label.employeeNumber")}
              </label>
              <BaseInput
                placeholder={t("modal.addEmployee.placeholder.employeeNumber")}
                value={newEmployee.employeeNumber}
                onChange={handleEmployeeFieldChange("employeeNumber")}
              />
              {errors.employeeNumber && (
                <div className={styles.errorMessage}>
                  {errors.employeeNumber}
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                {t("modal.addEmployee.label.birthDate")}
              </label>
              <BaseInput
                type="text"
                placeholder={t("modal.addEmployee.placeholder.birthDate")}
                value={newEmployee.birthDate}
                onChange={handleEmployeeFieldChange("birthDate")}
              />
              {errors.birthDate && (
                <div className={styles.errorMessage}>{errors.birthDate}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                {t("modal.addEmployee.label.phone")}
              </label>
              <BaseInput
                placeholder={t("modal.addEmployee.placeholder.phone")}
                value={newEmployee.phone}
                onChange={handleEmployeeFieldChange("phone")}
              />
              {errors.phone && (
                <div className={styles.errorMessage}>{errors.phone}</div>
              )}
            </div>
          </div>

          {/* Middle: 소속, 직급, 성별 */}
          <div className={styles.modalMiddle}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                {t("modal.addEmployee.label.department")}
              </label>
              <div
                className={`${styles.departmentDisplay} ${
                  !newEmployee.department ? styles.placeholder : ""
                }`}
              >
                {newEmployee.department
                  ? selectedPrimaryDepartment === newEmployee.department
                    ? newEmployee.department
                    : selectedSecondaryDepartment === newEmployee.department
                    ? `${selectedPrimaryDepartment} > ${newEmployee.department}`
                    : `${selectedPrimaryDepartment} > ${selectedSecondaryDepartment} > ${newEmployee.department}`
                  : t("modal.addEmployee.placeholder.department")}
              </div>
              <div className={styles.inputHint}>
                {t("modal.addEmployee.hint.department")}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                {t("modal.addEmployee.label.jobPosition")}
              </label>
              <BaseInput
                placeholder={t("modal.addEmployee.placeholder.jobPosition")}
                value={newEmployee.jobPosition}
                onChange={handleEmployeeFieldChange("jobPosition")}
              />
              {errors.jobPosition && (
                <div className={styles.errorMessage}>{errors.jobPosition}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                {t("modal.addEmployee.label.gender")}
              </label>
              <div className={styles.selectWrapper}>
                <BaseFilterSelect
                  label=""
                  placeholder={t("modal.addEmployee.placeholder.gender")}
                  options={genderOptions}
                  defaultValue={newEmployee.gender}
                  onChange={(value) => {
                    setNewEmployee((prev) => ({ ...prev, gender: value }));
                    setErrors((prev) => ({ ...prev, gender: "" }));
                  }}
                  height={45}
                />
              </div>
              {errors.gender && (
                <div className={styles.errorMessage}>{errors.gender}</div>
              )}
            </div>
          </div>

          <div className={styles.modalRight}>
            <div className={styles.marginAuto}></div>
            <div className={styles.col}>
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
                          newEmployee.department === team.name
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
                        ? t("modal.departmentSelect.empty.noResult")
                        : t("modal.departmentSelect.empty.selectSecondary")}
                    </div>
                  )}
                </div>
              </div>

              {/* 푸터 */}
              <div className={styles.deptFooter}>
                <button
                  className={styles.clearButton}
                  onClick={() => {
                    setNewEmployee((prev) => ({
                      ...prev,
                      department: "",
                      organizationId: 0,
                    }));
                    setSelectedPrimaryDepartment("");
                    setSelectedSecondaryDepartment("");
                  }}
                  disabled={!newEmployee.department}
                >
                  {t("modal.departmentSelect.button.clear")}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      footer={
        <BaseButton
          variant="custom"
          backgroundColor="#2F6C46"
          hoverBackgroundColor="#52976d"
          textColor="#ffffff"
          onClick={handleSubmit}
          disabled={!isFormValid}
          style={{
            width: "100%",
            height: "44px",
            border: "none",
            fontSize: "15px",
            fontWeight: "600",
            lineHeight: "130%",
          }}
        >
          {t("modal.addEmployee.button.submit")}
        </BaseButton>
      }
    />
  );
};

export default AddEmployeeModal;
