import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
// import './CustomSelect.css';

const CustomSelect = ({ options, onChange, placeholder, isSearchable }) => {
  return (
    <Select
      options={options}
      onChange={onChange}
      isSearchable={isSearchable}
      placeholder={placeholder}
      styles={{
        control: (base, state) => ({
          ...base,
          fontWeight: 400,
          lineHeight: 1.5,
          color: 'var(--bs-body-color)',
          backgroundColor: state.isFocused
            ? 'var(--bs-body-bg)' // Default or use CSS variable
            : 'var(--bs-body-bg)', // Default background
          border: state.isFocused
            ? 'rgb(176.5, 165, 255)'
            : 'var(--bs-border-width) solid var(--bs-border-color)', // Default border
          borderRadius: 'var(--bs-border-radius)',
          boxShadow: state.isFocused
            ? '0 0 0 0.25rem rgba(98, 75, 255, 0.25)' // Updated focus shadow
            : 'none', // No shadow when not focused
          transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
          outline: 0, // Removes default outline
        //   '&:hover': {
        //     borderColor: 'var(--bs-border-width) solid var(--bs-border-color)',
        //   },
        }),
        menu: (base) => ({
          ...base,
          zIndex: 1050, // Ensures dropdown is visible
        }),
      }}
    />
  );
};

CustomSelect.propTypes = {
  options: PropTypes.array.isRequired, // Ensure options is an array
  onChange: PropTypes.func.isRequired, // Ensure onChange is a function
  placeholder: PropTypes.string, // Optional placeholder text
  isSearchable: PropTypes.bool, // Optional isSearchable prop
};

CustomSelect.defaultProps = {
  placeholder: 'Select an option',
  isSearchable: true,
};

export default CustomSelect;
