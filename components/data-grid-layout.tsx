"use client";

import { useState } from 'react';
import { CompaniesGrid } from '@/components/grids/companies-grid';
import { PeopleGrid } from '@/components/grids/people-grid';
import { PatentsGrid } from '@/components/grids/patents-grid';
import { RowDetailsSidebar } from '@/components/ui/row-details-sidebar';
import { mapRowToSidebarModel } from '@/lib/row-details';

interface DataGridLayoutProps {
  activeTab: string;
}

export function DataGridLayout({ activeTab }: DataGridLayoutProps) {
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleRowSelect = (item: any) => {
    setSelectedItem(item);
  };

  const handleCloseSidebar = () => {
    setSelectedItem(null);
  };

  const renderGrid = () => {
    switch (activeTab) {
      case 'companies':
        return <CompaniesGrid onRowSelect={handleRowSelect} />;
      case 'people':
        return <PeopleGrid onRowSelect={handleRowSelect} />;
      case 'patents':
        return <PatentsGrid onRowSelect={handleRowSelect} />;
      default:
        return <PatentsGrid onRowSelect={handleRowSelect} />;
    }
  };

  const sidebarModel = selectedItem
    ? mapRowToSidebarModel(activeTab, selectedItem)
    : null;

  return (
    <div className="relative">
      <div className="flex">
        <div className="flex-1">
          {renderGrid()}
        </div>
      </div>

      <RowDetailsSidebar
        open={Boolean(selectedItem)}
        onClose={handleCloseSidebar}
        title={sidebarModel?.title || ''}
        link={sidebarModel?.link}
        fields={sidebarModel?.fields || []}
        summary={sidebarModel?.summary}
      />
    </div>
  );
}
