// dailyAttendantSalesData.js

export const dailyAttendantSalesColumns = [
  "Date",
  "Attendant",
  "Pump No",
  "Product",
  "Shift open",
  "Shift close",
  "Litres sold",
  "Amount",
  "Cash received",
  "Discrepancies",
  "Action",
];

export const dailyAttendantSalesData = [
  [
    "04/17/23",
    "John Dave",
    "-",
    "-",
    "-",
    "-",
    "-",
     "-",
    <input type="text" className="border rounded-md w-[8rem] px-2 py-1" />,
     "-",
     <input type="checkbox" />,
  ],
  [
    "04/17/23",
    "Oboh ThankGod",
    "1",
    "Diesel",
    "2500",
    "-",
     "-",
    "-",
    <input type="text" className="border rounded-md w-[8rem] px-2 py-1" />,
     "-",
    <input type="checkbox" />,
  ],
  [
    "04/17/23",
    "John Dave",
    "1",
    "Fuel",
    "2500",
    "2000",
    "500",
    "123,000,000",
    <input
      type="text"
      defaultValue="123,000,000"
      className="border rounded-md w-[8rem] px-2 py-1"
    />,
    "-",
    <input type="checkbox" />,
  ],
  [
    "04/17/23",
    "John Dave",
    "1",
    "Fuel",
    "2500",
    "2000",
    "500",
    "123,000,000",
    <input
      type="text"
      defaultValue="123,000,000"
      className="border rounded-md w-[8rem] px-2 py-1"
    />,
    "0",
    <input type="checkbox" defaultChecked />,
  ],
  [
    "04/17/23",
    "John Dave",
    "1",
    "Fuel",
    "2500",
    "2000",
    "500",
    "123,000,000",
    <input
      type="text"
      defaultValue="123,500,000"
      className="border rounded-md w-[8rem] px-2 py-1"
    />,
    <span className="text-green-600 font-semibold">+500,000</span>,
    <input type="checkbox" />,
  ],
  [
    "04/17/23",
    "John Dave",
    "1",
    "Fuel",
    "2500",
    "2000",
    "500",
    "123,000,000",
    <input
      type="text"
      defaultValue="123,500,000"
      className="border rounded-md w-[8rem] px-4 py-2"
    />,
    <span className="text-green-600 font-semibold">+500,000</span>,
    <input type="checkbox" />,
  ],
];
