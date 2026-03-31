import { DateRangePicker } from "@heroui/react";

interface DateRange {
  start: any;
  end: any;
}

interface DateRangePickerComponentProps {
  value?: DateRange | null;
  onChange?: (range: DateRange | null) => void;
  label?: string;
  className?: string;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  disabled?: boolean;
}

export default function DateRangePickerComponent({
  value,
  onChange,
  label,
  className = "max-w-xs",
  color = "default",
  disabled,
}: DateRangePickerComponentProps) {
  const handleChange = (dateRange: any) => {
    if (onChange) {
      onChange(dateRange);
    }
  };

  return (
    <DateRangePicker
      labelPlacement="outside"
      className={className}
      label={label ? label : ""}
      color={color}
      value={value}
      onChange={handleChange}
      isDisabled={disabled}
    />
  );
}
