import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { format as formatDate } from "date-fns";
import { Popover, Chip, useTheme, Drawer, Button, useMediaQuery } from "@mui/material";
import { ArrowDropDown as ArrowDropDownIcon, Cancel as CancelIcon } from "@mui/icons-material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { TransactionDateRangePayload } from "../models";
import { hasDateQueryFields } from "../utils/transactionUtils";

const PREFIX = "TransactionListDateRangeFilter";

const classes = {
  popover: `${PREFIX}-popover`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.popover}`]: {
    [theme.breakpoints.down("md")]: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  },
}));

export type TransactionListDateRangeFilterProps = {
  filterDateRange: Function;
  dateRangeFilters: TransactionDateRangePayload;
  resetDateRange: Function;
};

const TransactionListDateRangeFilter: React.FC<TransactionListDateRangeFilterProps> = ({
  filterDateRange,
  dateRangeFilters,
  resetDateRange,
}) => {
  const theme = useTheme();
  const xsBreakpoint = useMediaQuery(theme.breakpoints.only("xs"));
  const queryHasDateFields = dateRangeFilters && hasDateQueryFields(dateRangeFilters);

  const [dateRangeAnchorEl, setDateRangeAnchorEl] = useState<HTMLDivElement | null>(null);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);

  const onCalendarSelect = (value: Date | [Date, Date]) => {
    if (Array.isArray(value)) {
      setDateRange(value);
      filterDateRange({
        dateRangeStart: value[0].toISOString(),
        dateRangeEnd: value[1].toISOString(),
      });
      setDateRangeAnchorEl(null);
    }
  };

  const handleDateRangeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setDateRangeAnchorEl(event.currentTarget);
  };

  const handleDateRangeClose = () => {
    setDateRangeAnchorEl(null);
  };

  const dateRangeOpen = Boolean(dateRangeAnchorEl);
  const dateRangeId = dateRangeOpen ? "date-range-popover" : undefined;

  const formatButtonDate = (date: string) => formatDate(new Date(date), "MMM d, yyyy");

  const dateRangeLabel = (dateRangeFields: TransactionDateRangePayload) => {
    const { dateRangeStart, dateRangeEnd } = dateRangeFields;
    return `${formatButtonDate(dateRangeStart!)} - ${formatButtonDate(dateRangeEnd!)}`;
  };

  return (
    <Root>
      {!queryHasDateFields && (
        <Chip
          color="primary"
          variant="outlined"
          onClick={handleDateRangeClick}
          label={"Date: ALL"}
          deleteIcon={<ArrowDropDownIcon />}
          onDelete={handleDateRangeClick}
        />
      )}
      {queryHasDateFields && (
        <Chip
          color="primary"
          variant="outlined"
          onClick={handleDateRangeClick}
          label={`Date: ${dateRangeLabel(dateRangeFilters)}`}
          deleteIcon={<CancelIcon />}
          onDelete={() => resetDateRange()}
        />
      )}
      {!xsBreakpoint && (
        <Popover
          id={dateRangeId}
          open={dateRangeOpen}
          anchorEl={dateRangeAnchorEl}
          onClose={handleDateRangeClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          className={classes.popover}
        >
          <Calendar selectRange onChange={onCalendarSelect} value={dateRange} />
        </Popover>
      )}
      {xsBreakpoint && (
        <Drawer
          id={dateRangeId}
          open={dateRangeOpen}
          onClose={handleDateRangeClose}
          anchor="bottom"
        >
          <Button onClick={handleDateRangeClose}>Close</Button>
          <Calendar selectRange onChange={onCalendarSelect} value={dateRange} />
        </Drawer>
      )}
    </Root>
  );
};

export default TransactionListDateRangeFilter;
