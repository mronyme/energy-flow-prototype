
import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface DatePickerProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
  mode?: string;
  // Allow any additional props
  [key: string]: any;
}

export function DatePicker({
  selected,
  onSelect,
  disabled = false,
  className,
  label = "Date",
  placeholder = "Pick a date",
  mode = "single",
  ...props
}: DatePickerProps) {
  // Generate unique ID for accessibility
  const uniqueId = React.useId();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          aria-label={`${label}: ${selected ? format(selected, "PPP") : "No date selected"}`}
          aria-haspopup="dialog"
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
          {selected ? format(selected, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          initialFocus
          className="pointer-events-auto"
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
