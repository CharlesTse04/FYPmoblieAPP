import React, { useState } from 'react';
import {
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    CircularProgress,
} from '@mui/material';
import SalesReport from './Sales/SalesReport.jsx';
import SalesLine from './Sales/SalesLine.jsx';
import YearSalesPie from './Sales/YearSalesPie.jsx';
import YearSalesLine from './Sales/YearSalesLine.jsx';
import MonthPie from './Sales/MonthPie.jsx';
import MonthLine from './Sales/MonthLine.jsx';
import MonthSalesLine from './Sales/MonthSalesLine.jsx';
import MonthSalesPie from './Sales/MonthSalesPie.jsx';
import SalesGarReport from './Sales/SalesGarReport.jsx';
import SalesGarLine from './Sales/SalesGarLine.jsx';

const ReportSearch = ({ handleSearch, loading }) => {
    const today = new Date();
    const [startDate, setStartDate] = useState(today.toISOString().split("T")[0]); // Default to today's date
    const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]); // Default to today's date
    const [year, setYear] = useState(today.getFullYear());
    const [selectedReport, setSelectedReport] = useState('');
    const [chartType, setChartType] = useState('bar');
    const [currentComponent, setCurrentComponent] = useState(null);
    const [selectedGoods, setSelectedGoods] = useState('');

    const handleSearchClick = () => {
        if (selectedGoods === 'cards' && selectedReport === 'card_sales' && chartType === 'pie') {
            setCurrentComponent(<SalesReport startDate={startDate} endDate={endDate} />);
        } else if (selectedReport === 'year_sales' && chartType === 'pie') {
            setCurrentComponent(<YearSalesPie startDate={startDate} endDate={endDate} />);
        } else if (selectedGoods === 'cards' && selectedReport === 'card_sales' && chartType === 'bar') {
            setCurrentComponent(<SalesLine startDate={startDate} endDate={endDate} />);
        } else if (selectedReport === 'year_sales' && chartType === 'bar') {
            setCurrentComponent(<YearSalesLine startDate={startDate} endDate={endDate} />);
        } else if (selectedReport === 'procurement' && chartType === 'pie') {
            setCurrentComponent(<MonthPie startDate={startDate} endDate={endDate} />);
        } else if (selectedReport === 'procurement' && chartType === 'bar') {
            setCurrentComponent(<MonthLine startDate={startDate} endDate={endDate} />);
        } else if (selectedReport === 'monthly_sales' && chartType === 'bar') {
            setCurrentComponent(<MonthSalesLine YearDate={year} />);
        } else if (selectedReport === 'monthly_sales' && chartType === 'pie') {
            setCurrentComponent(<MonthSalesPie YearDate={year} />);
        } else if (selectedGoods === 'galleries' && selectedReport === 'card_sales' && chartType === 'pie') {
            setCurrentComponent(<SalesGarReport startDate={startDate} endDate={endDate} />);
        } else if (selectedGoods === 'galleries' && selectedReport === 'card_sales' && chartType === 'bar') {
            setCurrentComponent(<SalesGarLine startDate={startDate} endDate={endDate} />);
        } else {
            setCurrentComponent(null);
            alert('Please select "Card Sales" with the appropriate chart type.');
        }
    };

    // Helper function to determine input type based on selected report
    const getDateType = () => {
        if (selectedReport === 'procurement') {
            return 'month'; // Month selection
        }
        return 'date'; // Default date selection
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <FormControl margin="normal" style={{ minWidth: 200 }}>
                <InputLabel id="demo-simple-select-label">Report Type</InputLabel>
                    <Select value={selectedReport} id="demo-simple-select" label="Report Type" onChange={(e) => setSelectedReport(e.target.value)}>
                        <MenuItem value="">Select Report</MenuItem>
                        <MenuItem value="monthly_sales">Monthly Sales</MenuItem>
                        <MenuItem value="year_sales">Year Sales</MenuItem>
                        <MenuItem value="card_sales">Card Sales</MenuItem>
                        <MenuItem value="procurement">Procurement Report</MenuItem>
                    </Select>
                </FormControl>

                {selectedReport === 'card_sales' && (
                    <FormControl margin="normal" style={{ minWidth: 200 }}>
                        <InputLabel id="Goods-select" >Goods</InputLabel>
                        <Select value={selectedGoods} id="Goods-select" label="Goods" onChange={(e) => setSelectedGoods(e.target.value)}>
                            <MenuItem value="cards">Cards</MenuItem>
                            <MenuItem value="galleries">Galleries</MenuItem>
                        </Select>
                    </FormControl>
                )}

                {/* Conditionally render date inputs based on selected report */}
                {selectedReport === 'monthly_sales' ? (
                    <TextField
                        margin="normal"
                        label="Year"
                        type="number"
                        variant="outlined"
                        value={year}
                        onChange={(e) => setYear(Math.max(e.target.value, 2000))} // Set a minimum year of 2000
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: 2000 }} // Set minimum value to 2000
                    />
                ) : selectedReport === 'year_sales' ? (
                    <>
                        <TextField
                            margin="normal"
                            label="Start Date"
                            type="number"
                            variant="outlined"
                            value={startDate.split('-')[0]} // Only show the year
                            onChange={(e) => setStartDate(`${e.target.value}-01-01`)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: 2000 }} // Set minimum value to 2000
                        />
                        <p>to</p>
                        <TextField
                            margin="normal"
                            label="End Date"
                            type="number"
                            variant="outlined"
                            value={endDate.split('-')[0]} // Only show the year
                            onChange={(e) => setEndDate(`${e.target.value}-12-31`)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: 2000 }} // Set minimum value to 2000
                        />
                    </>
                ) : (
                    <>
                        <TextField
                            margin="normal"
                            label="Start Date"
                            type={getDateType() === 'month' ? 'month' : 'date'}
                            variant="outlined"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        <p>to</p>
                        <TextField
                            margin="normal"
                            label="End Date"
                            type={getDateType() === 'month' ? 'month' : 'date'}
                            variant="outlined"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </>
                )}

                <FormControl margin="normal">
                    <InputLabel id="Chart-select">Chart Type</InputLabel>
                    <Select value={chartType} id="Chart-select" label="Chart Type" onChange={(e) => setChartType(e.target.value)}>
                        <MenuItem value="bar">Bar Chart</MenuItem>
                        <MenuItem value="pie">Pie Chart</MenuItem>
                    </Select>
                </FormControl>

                <Button onClick={handleSearchClick} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Search'}
                </Button>
            </div>

            {/* Render the selected component */}
            {currentComponent}
        </div>
    );
};

export default ReportSearch;