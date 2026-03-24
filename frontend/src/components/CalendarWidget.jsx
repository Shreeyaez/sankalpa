import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function CalendarWidget() {
  const [value, setValue] = useState(new Date());

  return (
    <div className="bg-white p-4 rounded border">
      <h3 className="font-semibold mb-3">Calendar</h3>
      <Calendar onChange={setValue} value={value} />
    </div>
  );
}
