import React from 'react';
import { TextField } from '@mui/material';

const SearchBar = React.memo(({ value, onChange, label }) => {
    return (
        <TextField
            fullWidth
            label={label}
            variant="outlined"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            sx={{ mb: 2 }}
        />
    );
});

export default SearchBar;