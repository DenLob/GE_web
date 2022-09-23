import * as React from 'react';
import PropTypes from 'prop-types';
import {alpha} from '@mui/material/styles';
import axios from "axios";
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import {visuallyHidden} from '@mui/utils';
import HelpClass from "../help_funcs";
import {get_server_api_addr} from '../consts'
import {useState} from "react";

const InfoPage = ({pallet_props, timezone}) => {
    // const [server_api_addr, setServerApiAddr] = useState('http://ge-web.ru:8000')
    // get_server_api_addr().then((res) => setServerApiAddr(res))


    function descendingComparator(a, b, orderBy) {
        let tmp_a = {}
        let tmp_b = {}
        Object.assign(tmp_a, a)
        Object.assign(tmp_b, b)
        if (orderBy === 'time_1' || orderBy === 'time_end') {
            let tmp = a[orderBy].split(' ')[0]
            tmp = tmp.split('.')[2] + '.' + tmp.split('.')[1] + '.' + tmp.split('.')[0]
            tmp_a[orderBy] = tmp + ' ' + tmp_a[orderBy].split(' ')[1]
            tmp = b[orderBy].split(' ')[0]
            tmp = tmp.split('.')[2] + '.' + tmp.split('.')[1] + '.' + tmp.split('.')[0]
            tmp_b[orderBy] = tmp + ' ' + tmp_b[orderBy].split(' ')[1]
        }
        if (tmp_b[orderBy] < tmp_a[orderBy]) {
            return -1;
        }
        if (tmp_b[orderBy] > tmp_a[orderBy]) {
            return 1;
        }
        return 0;
    }

    function getComparator(order, orderBy) {
        return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
    }

    function stableSort(array, comparator) {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) {
                return order;
            }
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }

    const headCells = [
        {
            id: 'time_1', numeric: true, disablePadding: false, label: 'Дата загрузки', sortable: true
        }, {
            id: 'type1', numeric: true, disablePadding: false, label: 'Сорт 1, шт.', sortable: true
        }, {
            id: 'type2', numeric: true, disablePadding: false, label: 'Сорт 2, шт.', sortable: true
        }, {
            id: 'type3', numeric: true, disablePadding: false, label: 'Сорт 3, шт.', sortable: true
        }, {
            id: 'Romaine_lettuce', numeric: true, disablePadding: false, label: 'Романо, шт.', sortable: true
        }, {
            id: 'Lettuce', numeric: true, disablePadding: false, label: 'Латук, шт.', sortable: true
        }, {
            id: 'Undefined', numeric: true, disablePadding: false, label: 'Неопределённый сорт, шт.', sortable: true
        }, {
            id: 'total_count', numeric: true, disablePadding: false, label: 'Всего растений, шт.', sortable: true
        },{
            id: 'date_end', numeric: true, disablePadding: false, label: 'Дата готовности', sortable: true
        }];

    function EnhancedTableHead(props) {
        const {onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort} = props;
        const createSortHandler = (property) => (event) => {
            onRequestSort(event, property);
        };

        return (<TableHead>
            <TableRow>
                {headCells.map((headCell) => (<TableCell
                    key={headCell.id}
                    align={headCell.numeric ? 'left' : 'center'}
                    padding={headCell.disablePadding ? 'none' : 'normal'}
                    sortDirection={orderBy === headCell.id ? order : false}
                >
                    {headCell.sortable ?
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (<Box component="span" sx={visuallyHidden}>
                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>) : null}
                        </TableSortLabel> :
                        headCell.label
                    }
                </TableCell>))}
            </TableRow>
        </TableHead>);
    }

    EnhancedTableHead.propTypes = {
        numSelected: PropTypes.number.isRequired,
        onRequestSort: PropTypes.func.isRequired,
        onSelectAllClick: PropTypes.func.isRequired,
        order: PropTypes.oneOf(['asc', 'desc']).isRequired,
        orderBy: PropTypes.string.isRequired,
        rowCount: PropTypes.number.isRequired,
    };

    const EnhancedTableToolbar = (props) => {
        const {numSelected} = props;

        return (<Toolbar
            sx={{
                pl: {sm: 2}, pr: {xs: 1, sm: 1}, ...(numSelected > 0 && {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}
        >
            {numSelected > 0 ? (<Typography
                sx={{flex: '1 1 100%'}}
                color="inherit"
                variant="subtitle1"
                component="div"
            >
                {numSelected} selected
            </Typography>) : (<Typography key={'tableTitle'}
                                          sx={{
                                              mr: 2,
                                              display: {xs: 'none', md: 'flex'},
                                              color: 'inherit',
                                              textDecoration: 'none',
                                          }}
                                          id="tableTitle"
                                          variant="h6"
                                          component="div"
            >
                Салатная теплица 1
            </Typography>)}

            {numSelected > 0 ? (<Tooltip title="Delete">
                <IconButton>
                    <DeleteIcon/>
                </IconButton>
            </Tooltip>) : (<Box sx={{flexGrow: 0}}><Tooltip title="Filter list">
                <IconButton>
                    <FilterListIcon/>
                </IconButton>
            </Tooltip></Box>)}
        </Toolbar>);
    };

    EnhancedTableToolbar.propTypes = {
        numSelected: PropTypes.number.isRequired,
    };

    function EnhancedTable({pallet_props}) {
        let request = 'api/get-statistics?page=' + 1 + '&per_page=' + 5 + '&order=desc&order_by=time_1&tz=' + timezone.toString()
            + Object.entries(pallet_props).map(
                ([key, value]) =>
                    +key + '=' + value + '&'
                        .repeat(+(key !== Object.keys(pallet_props)[Object.keys(pallet_props).length - 1]))).join('')
        const [totalRows, setTotalRows] = useState(0);


        const prepareData = (dic) => {
            let tmp = new HelpClass(+dic.time_1)
            dic.time_1 = tmp.DateFromTsNoLocale()
            tmp = new HelpClass(+dic.date_end)
            dic.date_end = tmp.DateFromTsNoLocale()
            return dic
        }
        const [rows, setRows] = React.useState([])
        const getData = () => {
            request = 'api/get-statistics?page=' + (page + 1) + '&per_page=' + rowsPerPage + '&order=' + order + '&order_by=' + orderBy + '&tz='+timezone.toString()
                + Object.entries(pallet_props).map(
                    ([key, value]) =>
                        +key + '=' + value + '&'
                            .repeat(+(key !== Object.keys(pallet_props)[Object.keys(pallet_props).length - 1]))).join('')
            setRows([])
            console.log(request)
            axios.get(request).then((response) => {
                fillRows(response.data)
            })
        }
        const fillRows = (data) => {
            data = JSON.parse(data)

            setTotalRows(data['page']['total_rows'])
            for (let i = 0; i < data['data'].length; i++) {
                setRows(existRows => {
                    return [...existRows, prepareData(data['data'][i])]
                })
            }

        }

        const [order, setOrder] = React.useState('desc');
        const [orderBy, setOrderBy] = React.useState('time_1');
        const [selected, setSelected] = React.useState([]);
        const [page, setPage] = React.useState(0);
        const [dense, setDense] = React.useState(false);
        const [rowsPerPage, setRowsPerPage] = React.useState(5);

        const handleRequestSort = (event, property) => {
            const isAsc = orderBy === property && order === 'asc';
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(property);
        };

        const handleSelectAllClick = (event) => {
            if (event.target.checked) {
                const newSelected = rows.map((n) => n.id);
                setSelected(newSelected);
                return;
            }
            setSelected([]);
        };

        const handleClick = (event, name) => {
            const selectedIndex = selected.indexOf(name);
            let newSelected = [];

            if (selectedIndex === -1) {
                newSelected = newSelected.concat(selected, name);
            } else if (selectedIndex === 0) {
                newSelected = newSelected.concat(selected.slice(1));
            } else if (selectedIndex === selected.length - 1) {
                newSelected = newSelected.concat(selected.slice(0, -1));
            } else if (selectedIndex > 0) {
                newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1),);
            }

            setSelected(newSelected);
        };

        const handleChangePage = (event, newPage) => {
            setPage(newPage);
        };

        const handleChangeRowsPerPage = (event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
        };

        const handleChangeDense = (event) => {
            setDense(event.target.checked);
        };

        const isSelected = (name) => selected.indexOf(name) !== -1;

        // Avoid a layout jump when reaching the last page with empty rows.
        const emptyRows = 0;

        React.useEffect(() => {
            getData()

        }, [page, rowsPerPage, order, orderBy])
        return (<Box sx={{width: '100%'}}>
            <Paper sx={{width: '100%', mb: 2}}>
                <EnhancedTableToolbar numSelected={selected.length}/>
                <TableContainer sx={{overflowX: 'hidden', overflowY: 'hidden'}}>
                    <Table
                        sx={{minWidth: 750}}
                        aria-labelledby="tableTitle"
                        size={dense ? 'small' : 'medium'}
                    >
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                        />
                        <TableBody>
                            {/* if you don't need to support IE11, you can replace the `stableSort` call with:
             rows.slice().sort(getComparator(order, orderBy)) */}
                            {
                                // stableSort(rows, getComparator(order, orderBy))
                                rows
                                    .slice(0, rowsPerPage)
                                    .map((row, index) => {
                                        const isItemSelected = isSelected(row.id);
                                        const labelId = `enhanced-table-checkbox-${index}`;
                                        // axios.get(server_api_addr + '/media/thumb_' + row.img.split('/')[row.img.split('/').length - 1])
                                        //     .then(() => setImgOrSvg(server_api_addr + '/media/thumb_' + row.img.split('/')[row.img.split('/').length - 1]))
                                        //     .catch(() => setImgOrSvg(noPalletSvgStr))

                                        return (<TableRow
                                            hover
                                            // onClick={(event) => handleClick(event, row.id)}
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={row.time_1}
                                            selected={isItemSelected}
                                        >
                                            <TableCell align="left">{row.time_1}</TableCell>
                                            <TableCell align="left">{row.type1}</TableCell>
                                            <TableCell align="left">{row.type2}</TableCell>
                                            <TableCell align="left">{row.type3}</TableCell>
                                            <TableCell align="left">{row['Romaine lettuce']}</TableCell>
                                            <TableCell align="left">{row['Lettuce']}</TableCell>
                                            <TableCell align="left">{row.Undefined}</TableCell>
                                            <TableCell align="left">{row.total_count}</TableCell>
                                            <TableCell align="left">{row.date_end}</TableCell>

                                        </TableRow>);
                                    })}
                            {emptyRows > 0 && (<TableRow
                                style={{
                                    height: (dense ? 33 : 53) * emptyRows,
                                }}
                            >
                                <TableCell colSpan={6}/>
                            </TableRow>)}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalRows}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
            <FormControlLabel
                control={<Switch checked={dense} onChange={handleChangeDense}/>}
                label="Dense padding"
            />
        </Box>);
    }


    return <EnhancedTable pallet_props={pallet_props}/>

    // return <div></div>
};

export default InfoPage;