import React from 'react';
import Box from "@mui/material/Box";
import {CircularProgress, Modal} from "@mui/material";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import CloseIcon from '@mui/icons-material/Close';
import {noPalletSvgStr} from '../../../static/frontend/thumbs/NoPallet'

const PhotoModal = ({handleClose, open, id, api_url}) => {

    const [img, setImg] = React.useState('https://s1.1zoom.ru/b4344/471/Owls_Birds_Glance_537043_2560x1440.jpg')
    const [loaded, setLoaded] = React.useState(false)
    const [noImg, setNoImg] = React.useState(false)
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: (loaded && !noImg) ? '100%' : '50px',
        alignContent: 'center',
        // bgcolor: 'background.paper',
        // border: '2px solid #000',
        // boxShadow: 24,
        p: 4,
    };

    React.useEffect(() => {
        setLoaded(false)
        if (id !== null && open) {
            axios.get(api_url + 'get-img?id=' + id).then((response) => {
                setImg('data:image/png;base64,'+JSON.parse(response.data)['image'])
                setLoaded(true)
                setNoImg(false)
            }).catch(() => {
                // console.log('NO IMAGE')
                setImg(noPalletSvgStr)
                setLoaded(true)
                setNoImg(true)
            })
        }
    }, [id])

    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{...style}}>
                    {loaded ?
                        <IconButton
                            id="modal-modal-title"
                            aria-label="close"
                            onClick={handleClose}
                            sx={{
                                // marginX: 'auto',
                                // position: 'absolute',
                                marginLeft: '50%',
                                top: -10,
                                // color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon/>
                        </IconButton>
                        :
                        <div></div>}


                    {loaded ? <img id="modal-modal-description" width="100%" src={(img)}
                                   alt='Error'/> : <CircularProgress id="modal-modal-description"/>}


                </Box>

            </Modal>
        </div>

    );
};

export default PhotoModal;