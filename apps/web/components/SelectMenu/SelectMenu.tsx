'use client'

import React, { forwardRef, useRef, useId } from "react";
import Select, { components, DropdownIndicatorProps, ClearIndicatorProps, SelectInstance } from 'react-select';
import { AngleDown, X } from "components/Icons";
import './SelectMenu.scss';

export const SelectMenuStylePresets = {
  Large: {
    control: (baseStyles: any) => ({
      ...baseStyles,
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      borderColor: '#D8D8D8',
      fontWeight: '700',
      fontSize: '16px',
    }),
    valueContainer: (baseStyles: any) => ({
      ...baseStyles,
      paddingRight: '0px',
    }),
    singleValue: (baseStyles: any, {data}: {data: any}) => ({
      ...baseStyles,
      color: data.color ? data.color : '#333',
    }),
    placeholder: (baseStyles: any) => ({
      ...baseStyles,
      color: '#BDBDBD',
      fontWeight: '700',
      fontSize: '16px',
    }),
    menu: (baseStyles: any) => ({
      ...baseStyles,
      borderRadius: '5px',
      backgroundColor: '#f5f5f5',
      boxShadow: '0 0 6px 0 rgba(0,0,0,0.30)',
    }),
    menuPortal: (baseStyles: any) => ({
      ...baseStyles,
      zIndex: 55555,
    }),
    menuList: (baseStyles: any) => ({
      ...baseStyles,
      padding: '0',
      borderRadius: '5px',
    }),
    option: (baseStyles: any, { data, isDisabled, isFocused, isSelected }: { data: any, isDisabled: boolean, isFocused: boolean, isSelected: boolean }) => ({
      ...baseStyles,
      color: isFocused ? 'white' : 'inherit',
      fontSize: '16px',
      fontWeight: 'bold',
      backgroundColor: isFocused ? (data.color || '#0087FF') : 'transparent',
      cursor: isDisabled ? 'not-allowed' : 'default',
      borderRadius: '5px',
      padding: '11px 12px',
    }),
    dropdownIndicator: (baseStyles: any) => ({
      ...baseStyles,
      paddingLeft: '2px',
      fontSize: '16px',
      color: '#BDBDBD',
    }),
    clearIndicator: (baseStyles: any) => ({
      ...baseStyles,
      fontSize: '16px',
      color: '#bdbdbd',
      marginRight: '0px',
      padding: '0px',
    }),
  },
  Medium: {
    control: (baseStyles: any) => ({
      ...baseStyles,
      backgroundColor: '#f5f5f5',
      borderRadius: '5px',
      borderColor: '#f5f5f5',
      fontWeight: '640',
      letterSpacing: '-0.5px',
      fontSize: '12px',
      minHeight: 'none',
    }),
    valueContainer: (baseStyles: any) => ({
      ...baseStyles,
      padding: '0px 4px',
    }),
    singleValue: (baseStyles: any, {data}: {data: any}) => ({
      ...baseStyles,
      color: data.color ? data.color : '#333',
    }),
    placeholder: (baseStyles: any) => ({
      ...baseStyles,
      color: '#BDBDBD',
      fontWeight: '700',
      fontSize: '12px',
    }),
    menu: (baseStyles: any) => ({
      ...baseStyles,
      borderRadius: '5px',
      backgroundColor: '#f5f5f5',
      boxShadow: '0 0 6px 0 rgba(0,0,0,0.30)',
    }),
    menuPortal: (baseStyles: any) => ({
      ...baseStyles,
      zIndex: 55555,
    }),
    menuList: (baseStyles: any) => ({
      ...baseStyles,
      padding: '0',
      borderRadius: '5px',
    }),
    option: (baseStyles: any, { data, isDisabled, isFocused, isSelected }: { data: any, isDisabled: boolean, isFocused: boolean, isSelected: boolean }) => ({
      ...baseStyles,
      color: isFocused ? 'white' : 'inherit',
      fontSize: '12px',
      fontWeight: 'bold',
      backgroundColor: isFocused ? (data.color || '#0087FF') : 'transparent',
      cursor: isDisabled ? 'not-allowed' : 'default',
      borderRadius: '5px',
      padding: '6px 7px',
    }),
    dropdownIndicator: (baseStyles: any) => ({
      ...baseStyles,
      paddingLeft: '2px',
      fontSize: '12px',
      color: '#BDBDBD',
    }),
    clearIndicator: (baseStyles: any) => ({
      ...baseStyles,
      fontSize: '12px',
      padding: '0px',
      color: '#bdbdbd',
    }),
  },
};

const DropdownIndicator = (props: DropdownIndicatorProps) => {
  return (
    <components.DropdownIndicator {...props}>
      <AngleDown/>
    </components.DropdownIndicator>
  );
};

const ClearIndicator = (props: ClearIndicatorProps) => (
  <components.ClearIndicator {...props}>
    <X/>
  </components.ClearIndicator>
);

// Helper function to get the selected option
export const getSelectMenuOption = (value: string | undefined, options: SelectMenuOption[]) => {
  if (!value) return;
  const option = options.find(option => option.value === value) || null;
  return option;
}

export interface SelectMenuOption {
  value: any;
  label: string;
  color?: string;
}

export interface SelectMenuProps {
  options?: SelectMenuOption[];
  selectedOption?: any;
  onChange?: (selectedOption: any) => void;
  styles?: any;
  placeholder?: string;
  resetOnSelect?: boolean;
  selectProps?: any;
  instanceId?: string;
}

const SelectMenu = forwardRef<SelectInstance, SelectMenuProps>(({
  options = [], 
  selectedOption, 
  onChange, 
  styles, 
  placeholder, 
  resetOnSelect = false,
  selectProps,
  instanceId
}, ref) => {
  const internalRef = useRef<SelectInstance>(null);
  const selectRef = ref || internalRef;
  const fallbackId = useId(); // Generate stable ID as fallback
  
  // Use provided instanceId or fallback to generated ID
  const stableInstanceId = instanceId || fallbackId;

  const handleChange = (option: any) => {
    // Call the original onChange
    if (onChange) {
      onChange(option);
      
      // If resetOnSelect is true, clear the selection after a brief delay
      if (resetOnSelect && option !== null) {
        setTimeout(() => {
          if (selectRef && 'current' in selectRef && selectRef.current) {
            selectRef.current.clearValue();
          }
        }, 50);
      }
    }
  };

  return (
    <Select 
      ref={selectRef}
      instanceId={stableInstanceId}
      defaultValue={selectedOption}
      components={{
        DropdownIndicator, 
        IndicatorSeparator: null,
        ClearIndicator,
      }}
      placeholder={placeholder ? placeholder : "Select..."}
      classNamePrefix="selectmenu"
      options={options} 
      blurInputOnSelect={true}
      isClearable={true}
      isSearchable={false}
      menuPlacement="auto"
      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
      onChange={handleChange}
      {...selectProps}
      styles={styles}
    />
  )
});

SelectMenu.displayName = 'SelectMenu';

export default SelectMenu;