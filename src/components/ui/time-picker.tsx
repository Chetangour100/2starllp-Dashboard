import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string; // Format: "HH:MM" or "HH:MM - HH:MM" for range
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isRange?: boolean; // If true, shows start and end time pickers
}

// Parse time value helper function
const parseTime = (timeStr: string | undefined, isRange: boolean): { start: string; end: string } => {
  if (!timeStr) return { start: "09:00", end: "17:00" };
  
  if (isRange && timeStr.includes(" - ")) {
    const [start, end] = timeStr.split(" - ");
    return { start: start?.trim() || "09:00", end: end?.trim() || "17:00" };
  }
  
  // If single time, use as start and default end
  return { start: timeStr || "09:00", end: "17:00" };
};

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  className,
  disabled = false,
  isRange = true,
}: TimePickerProps) {
  const initialTime = React.useMemo(() => parseTime(value, isRange), [value, isRange]);
  const [startTime, setStartTime] = React.useState(initialTime.start);
  const [endTime, setEndTime] = React.useState(initialTime.end);
  const [open, setOpen] = React.useState(false);

  // Update local state when value prop changes
  React.useEffect(() => {
    const parsed = parseTime(value, isRange);
    setStartTime(parsed.start);
    setEndTime(parsed.end);
  }, [value, isRange]);

  // Generate time options (every 15 minutes)
  const generateTimeOptions = () => {
    const options: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        options.push(timeStr);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    // Don't call onChange here - wait for Apply button
  };

  const handleEndTimeChange = (newEnd: string) => {
    setEndTime(newEnd);
    // Don't call onChange here - wait for Apply button
  };

  const formatDisplayValue = () => {
    if (!value) return placeholder;
    if (isRange && value.includes(" - ")) {
      return value;
    }
    return value;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatDisplayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time</label>
            <Select value={startTime} onValueChange={handleStartTimeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Start time" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {isRange && (
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Select value={endTime} onValueChange={handleEndTimeChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (isRange) {
                  onChange(`${startTime} - ${endTime}`);
                } else {
                  onChange(startTime);
                }
                setOpen(false);
              }}
              className="bg-brand-green hover:bg-brand-green/90 text-white"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
