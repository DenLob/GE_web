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
import {Chip, ImageListItem} from "@mui/material";
import {NoPallet, noPalletSvg, noPalletSvgStr} from '../../static/frontend/thumbs/NoPallet'
import {get_server_api_addr} from '../consts'
import {useState} from "react";
import PhotoModal from "./modals/PhotoModal";
import {useNavigate } from "react-router-dom";



const HomePage = ({pallet_props, now_utc}) => {
    const navigate = useNavigate();

    const handleOnSubmit = () => {
        navigate(`/info`);
    };
    const [server_api_addr, setServerApiAddr] = useState('http://ge-web.ru:8000')
    get_server_api_addr().then((res) => setServerApiAddr(res))



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

    const headCells = [{
        id: 'id', numeric: true, disablePadding: false, label: 'Номер поддона',sortable: true
    }, {
        id: 'time_1', numeric: true, disablePadding: false, label: 'Время загрузки',sortable: true
    }, {
        id: 'date_end', numeric: true, disablePadding: false, label: 'Дата готовности',sortable: true
    }, {
        id: 'type_plant', numeric: false, disablePadding: false, label: 'Сорт',sortable: false
    }, {
        id: 'count', numeric: true, disablePadding: false, label: 'Количество',sortable: false
    }, {
        id: 'img', numeric: false, disablePadding: true, label: 'Фото',sortable: false
    }];

    function EnhancedTableHead(props) {
        const {onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort} = props;
        const createSortHandler = (property) => (event) => {
            onRequestSort(event, property);
        };

        return (<TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{
                            'aria-label': 'select all desserts',
                        }}
                    />
                </TableCell>
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
        const {numSelected, statistic} = props;
        let indicators = [<Typography key={'tableTitle'}
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
        </Typography>,
            <Typography key={'indicatorTitle'}
                        sx={{
                            ml: 2,
                            display: {xs: 'none', md: 'flex'},
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                        id="indicatorTitle"
                // variant="h"
                        component="div"
            >
                Загружено за сегодня:
            </Typography>
        ]
        indicators.push(...Object.keys(statistic).map((key) => <Chip sx={{ml: 2}} key={key}
                                                                     label={key + ' : ' + statistic[key]}
                                                                     variant="outlined"
                                                                     onClick={handleOnSubmit}
        />))
        if (indicators.length === 2) {
            indicators.push(<Chip sx={{ml: 2}} key='NoIndicators'
                                  label='0 растений'
                                  variant="outlined"
                                  onClick={handleOnSubmit}
            />)
        }
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
            </Typography>) : (<Box key='BoxIndicators' sx={{
                flexGrow: 1,
                display: {xs: 'none', md: 'flex'},
                alignItems: 'center'
            }}>{indicators}</Box>)}

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
        numSelected: PropTypes.number.isRequired, statistic: PropTypes.object,
    };

    function EnhancedTable({pallet_props}) {
        let request = 'api/get-pallets?page=' + 1 + '&per_page=' + 5 + '&order=desc&order_by=id&today=' + now_utc
            + Object.entries(pallet_props).map(
                ([key, value]) =>
                    +key + '=' + value + '&'
                        .repeat(+(key !== Object.keys(pallet_props)[Object.keys(pallet_props).length - 1]))).join('')
        const [totalRows, setTotalRows] = useState(0);


        const prepareData = (dic) => {
            let tmp = new HelpClass(+dic.time_1)
            dic.time_1 = tmp.DateTimeFromTs()
            tmp = new HelpClass(+dic.date_end)
            dic.date_end = tmp.DateFromTs()
            return dic
        }
        const [rows, setRows] = React.useState([])
        const [statRows, setStatRows] = React.useState([])
        const getData = () => {
            request = 'api/get-pallets?page=' + (page + 1) + '&per_page=' + rowsPerPage + '&order=' + order + '&order_by=' + orderBy + '&today=' + now_utc
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
            setThumbs([])
            for (let i = 0; i < data['data'].length; i++) {
                setRows(existRows => {
                    return [...existRows, prepareData(data['data'][i])]
                })
                createThumbs(data['data'][i])
            }
            setStatRows([])
            for (let i=0;i<data['stat'].length;i++){
                setStatRows(existRows => {
                    return [...existRows, prepareData(data['stat'][i])]
                })
            }
        }


        const [order, setOrder] = React.useState('desc');
        const [orderBy, setOrderBy] = React.useState('id');
        const [selected, setSelected] = React.useState([]);
        const [page, setPage] = React.useState(0);
        const [dense, setDense] = React.useState(false);
        const [rowsPerPage, setRowsPerPage] = React.useState(5);
        const [open, setOpen] = React.useState(false);
        const handleOpen = () => setOpen(true);

        const [selectedPhoto, setSelectedPhoto] = React.useState(null)
        const handleClose = () => {
            setSelectedPhoto(null);
            setOpen(false);
        }

        const handleRequestSort = (event, property) => {
            const isAsc = orderBy === property && order === 'asc';
            if (orderBy === 'id' || orderBy === 'time_1' || orderBy === 'time_end')
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
        const convertNonePlants = (data) => (
            data.type_plant === 'None' ? 'Пустых палетов' : data.type_plant
        )
        const convertNonePlantsCount = (data) => (
            data.type_plant === 'None' ? 1 : data.count
        )
        const statistic = statRows
        let fin_stat = {}
        statistic.forEach(item => convertNonePlants(item) in fin_stat ? fin_stat[convertNonePlants(item)] += convertNonePlantsCount(item) : fin_stat[convertNonePlants(item)] = +convertNonePlantsCount(item))
        const [imgOrSvg, setImgOrSvg] = React.useState(noPalletSvgStr)
        const [thumbs, setThumbs] = React.useState([])
        const createThumbs = (row) => {
            axios.get(server_api_addr + 'media/thumb_' + row.img.split('/')[row.img.split('/').length - 1])
                .then(() => {
                    setThumbs(existRows => {
                        return {...existRows, [row['id']]:server_api_addr + 'media/thumb_' + row.img.split('/')[row.img.split('/').length - 1]}
                    })
                })
                .catch(() => {
                    setThumbs(existRows => {
                        return {...existRows, [row['id']]:noPalletSvgStr}
                    })
                })
        }
        React.useEffect(() => {
            getData()

        }, [page, rowsPerPage, order, orderBy])
        return (<Box sx={{width: '100%'}}>
            <Paper sx={{width: '100%', mb: 2}}>
                <EnhancedTableToolbar numSelected={selected.length} statistic={fin_stat}/>
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
                                            key={row.id}
                                            selected={isItemSelected}
                                        >
                                            <TableCell padding='checkbox'>
                                                <Checkbox
                                                    color="primary"
                                                    checked={isItemSelected}
                                                    inputProps={{
                                                        'aria-labelledby': labelId,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell
                                                component="th"
                                                id={labelId}
                                                scope="row"
                                                padding="none"
                                            >
                                                {row.id}
                                            </TableCell>
                                            <TableCell align="left">{row.time_1}</TableCell>
                                            <TableCell align="left">{row.date_end}</TableCell>
                                            <TableCell align="center">{row.type_plant}</TableCell>
                                            <TableCell align="left">{row.count}</TableCell>

                                            <TableCell sx={{width: '15%'}} align="center">
                                                {<Tooltip title="Открыть фото">
                                                    <img
                                                        src={thumbs[row['id']] }
                                                        // ? noPalletSvgStr : server_api_addr + '/media/thumb_' + row.img.split('/')[row.img.split('/').length - 1]}
                                                        alt='Error'
                                                        onClick={()=> {
                                                            setSelectedPhoto(row.id)
                                                            handleOpen()
                                                        }}
                                                    />
                                                </Tooltip>}
                                            </TableCell>

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
            <PhotoModal handleClose={handleClose} id={selectedPhoto} open={open} api_url={server_api_addr}/>
        </Box>);
    }


    return <EnhancedTable pallet_props={pallet_props}/>

    // return <div></div>
};

export default HomePage;