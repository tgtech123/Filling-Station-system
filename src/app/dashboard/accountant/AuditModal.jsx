// AuditModal.jsx
import { Check, TriangleAlert, X } from "lucide-react";
import Image from "next/image";
import React from "react";
import fuelux from "../../../../public/dip.png"
import fuel from "../../../../public/fuel.png"
import pump from "../../../../public/pump.png"
import pumpNozzle from "../../../../public/pumpNozzle.png"
import { GoHourglass, GoTag } from "react-icons/go";
import { TbCurrencyNaira } from "react-icons/tb";
import { GiReceiveMoney } from "react-icons/gi";

const AuditModal = ({ isOpen, onClose, record, onAudit, isAudited }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-lg w-[90%] max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-4">
            <X onClick={onClose} className="cursor-pointer" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          Shift Summary
        </h2>
        <div className="flex justify-between text-gray-700">
            <p>Sales summary of {record.attendant}</p>
            <p>{record.date}</p>
        </div>

        <div className="space-y-2 text-sm mt-6 text-gray-700">
          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
                <Image src={fuelux} height={20} width={20} alt="fuelux img" />
                <p>Opening Meter reading</p>
            </div>
            <p>33,200 Litres</p>
          </div>
          
          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
                <Image src={fuelux} height={20} width={20} alt="fuelux img" />
                <p>Closing Meter reading</p>
            </div>
            <p>32,200 Litres</p>
          </div>
          
          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
                <Image src={pump} height={20} width={20} alt="fuelux img" />
                <p>Pump no</p>
            </div>
            <p>Pump {record.pumpNo}</p>
          </div>

          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
                <GoTag size={20} />
                <p>Product type</p>
            </div>
                <p>Diesel</p>
          </div>
          

          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
                <Image src={fuel} height={20} width={20} alt="fuelux img" />
                <p>Price/litre</p>
            </div>
                <p>₦120</p>
          </div>
          
          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
                <Image src={pumpNozzle} height={20} width={20} alt="fuelux img" />
                <p>Litres sold</p>
            </div>
                <p>{record.litres} Litres</p>
          </div>

          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
                <TbCurrencyNaira size={20} />
                <p>Amount</p>
            </div>
                <p>₦{record.amount}</p>
          </div>

          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
                <GiReceiveMoney size={20} />
                <p>Reconciled Cash</p>
            </div>
                <p>₦{record.cashReceived}</p>
          </div>
          

          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
                <TriangleAlert size={20} />
                <p>Discrepancy</p>
            </div>
                <p className="text-red-500 font-semibold">{record.discrepancy}NGN</p>
          </div>

          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
                <GoHourglass size={20} />
                <p>Status</p>
            </div>
            <div>
                {record.status === "Matched" ? (
                      <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-3 py-1 rounded-md inline-flex justify-center items-center space-x-1">
                        <Check size={12} />
                        <span>Matched</span>
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-md inline-flex justify-center items-center space-x-1">
                        <TriangleAlert size={12} />
                        <span>Flagged</span>
                      </span>
                    )}
            </div>
          </div>
          
        
        </div>

        <div className="flex justify-between w-full mt-6">
       
          <button
            onClick={onAudit}
            disabled={isAudited}
            className={`px-4 py-2 w-full rounded-lg text-white font-semibold ${
              isAudited
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#0080ff]"
            }`}
          >
            {isAudited ? "Audited" : "Audit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditModal;
