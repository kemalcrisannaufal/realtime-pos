import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constants/data-table-constants";
import { ChangeEvent, useState } from "react";
import useDebounce from "./use-debounce";

export default function useDataTable() {
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [currentLimit, setCurrentLimit] = useState(DEFAULT_LIMIT);
  const [currentSearch, setCurrentSearch] = useState("");
  const [currentFilter, setCurrentFilter] = useState("");

  const debounce = useDebounce();

  const handleChangePage = (page: number) => setCurrentPage(page);
  const handleChangeLimit = (limit: number) => {
    setCurrentLimit(limit);
    setCurrentPage(DEFAULT_PAGE);
  };

  const handleChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    debounce(() => {
      setCurrentSearch(search);
      setCurrentPage(DEFAULT_PAGE);
    }, 500);
  };

  const handleChangeFilter = (filter: string) => {
    setCurrentFilter(filter);
  };

  return {
    currentPage,
    handleChangePage,
    currentLimit,
    handleChangeLimit,
    currentSearch,
    handleChangeSearch,
    currentFilter,
    handleChangeFilter,
  };
}
