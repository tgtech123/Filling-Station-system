import DisplayCard from "@/components/Dashboard/DisplayCard";
import CustomTable from "./CustomTable";

export default function Deliveries() {
    const deliveryColumn = ["Tank No", "Fuel Type", "No of Litres", "Suppliers", "Expected Delivery", "Action"]
    const deliveryData = [
        [
            "Tank A",
            "Diesel",
            "20,000 L",
            "PetroMax Supply",
            "28/12/2025",
            "Pending"
        ],
        [
            "Tank B",
            "PMS",
            "20,000 L",
            "PetroMax Supply",
            "28/12/2025",
            "Completed"
        ],
        [
            "Tank E",
            "AGO",
            "20,000 L",
            "PetroMax Supply",
            "28/12/2025",
            "Pending"
        ],
        [
            "Tank C",
            "Diesel",
            "20,000 L",
            "PetroMax Supply",
            "28/12/2025",
            "Canceled"
        ]
    ]

    const handleStatusAction = (action, row, rowIndex) => {
  console.log(`${action} action for order:`, row[0]); // row[0] is the order ID
  
  switch(action) {
    case 'edit':
      // Open edit modal/page
      break;
    case 'view':
      // Open view modal/page  
      break;
    case 'delete':
      // Show delete confirmation
      break;
  }
};

    return (
        <DisplayCard>
            <h3 className="text-xl font-semibold">Recent Deliveries</h3>
            <p>Track fuel schedules and deliveries</p>

            <CustomTable 
                data={deliveryData} 
                columns={deliveryColumn} 
                onStatusAction={handleStatusAction} 
                lastColumnType="status"
            />
        </DisplayCard>
    )
}