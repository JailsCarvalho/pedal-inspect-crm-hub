
import React from "react";
import InspectionsList from "@/components/inspections/InspectionsList";

const Inspections = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Inspeções</h2>
      </div>
      
      <div className="border-t">
        <InspectionsList />
      </div>
    </div>
  );
};

export default Inspections;
