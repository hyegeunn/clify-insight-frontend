import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BaseTable, BaseTooltip, BaseIcon } from "@/components/common";
import type {
  FavUsageStatusTableProps,
  FavUsageStatusTableRow,
} from "@/types/pages/fav";
import type { HeaderConfig, RowData } from "@/types/common";

const FavUsageStatusTable = ({ data, onSort }: FavUsageStatusTableProps) => {
  const { t } = useTranslation("pages/fav");
  const [sortKey, setSortKey] = useState<keyof FavUsageStatusTableRow>("rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (
    key: keyof FavUsageStatusTableRow,
    direction: "asc" | "desc"
  ) => {
    setSortKey(key);
    setSortDirection(direction);
    onSort?.(key, direction);
  };

  const sortedData = useMemo(() => {
    const sorted = [...data];

    sorted.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortKey) {
        case "rank":
          aValue = a.rank;
          bValue = b.rank;
          break;
        case "departmentName":
          aValue = a.departmentName;
          bValue = b.departmentName;
          break;
        case "parentDepartment":
          aValue = a.parentDepartment;
          bValue = b.parentDepartment;
          break;
        case "lastParticipationDate":
          aValue = a.lastParticipationDate || "";
          bValue = b.lastParticipationDate || "";
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return sorted;
  }, [data, sortKey, sortDirection]);
  const headers: HeaderConfig<FavUsageStatusTableRow>[] = useMemo(
    () => [
      {
        key: "rank",
        label: t("usage.header.rank"),
        width: "11.11%",
        sortable: true,
      },
      {
        key: "departmentName",
        label: t("usage.header.lowerDepartment"),
        width: "11.11%",
        sortable: true,
      },
      {
        key: "parentDepartment",
        label: t("usage.header.upperDepartment"),
        width: "11.11%",
        sortable: true,
      },
      {
        key: "totalMembers",
        label: t("usage.header.totalMembers"),
        width: "11.11%",
        sortable: false,
      },
      {
        key: "participatedMembers",
        label: t("usage.header.participatedMembers"),
        width: "11.11%",
        sortable: false,
      },
      {
        key: "participationRate",
        label: t("usage.header.participationRate"),
        width: "11.11%",
        sortable: false,
        icon: (
          <BaseTooltip content={t("usage.tooltip.participationRate")}>
            <BaseIcon name="tooltip" size={16} color="#9095a0" />
          </BaseTooltip>
        ),
      },
      {
        key: "avgParticipationCount",
        label: t("usage.header.avgParticipationCount"),
        width: "11.11%",
        sortable: false,
      },
      {
        key: "nonParticipatedMembers",
        label: t("usage.header.nonParticipatedMembers"),
        width: "11.11%",
        sortable: false,
      },
      {
        key: "lastParticipationDate",
        label: t("usage.header.lastParticipationDate"),
        width: "11.11%",
        sortable: true,
      },
    ],
    [t]
  );

  const rows: RowData<FavUsageStatusTableRow>[] = useMemo(() => {
    return sortedData.map((item) => ({
      rank: item.rank,
      departmentName: {
        type: "text",
        value: item.departmentName,
        align: "left",
      },
      parentDepartment: {
        type: "text",
        value: item.parentDepartment,
        align: "left",
      },
      totalMembers: t("unit.people", { count: item.totalMembers }),
      participatedMembers: t("unit.people", { count: item.participatedMembers }),
      participationRate: {
        type: "text",
        value: `${item.participationRate}%`,
      },
      avgParticipationCount: t("unit.times", { count: item.avgParticipationCount }),
      nonParticipatedMembers: t("unit.people", { count: item.nonParticipatedMembers }),
      lastParticipationDate: item.lastParticipationDate || "-",
    }));
  }, [sortedData, t]);

  return (
    <BaseTable
      headers={headers}
      data={rows}
      onSort={handleSort}
      defaultSortKey="rank"
      defaultSortDirection="asc"
      emptyMessage={t("usage.emptyMessage")}
    />
  );
};

export default FavUsageStatusTable;
