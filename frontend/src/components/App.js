import React, {Component} from "react";
import HomePage from "./HomePage";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import InfoPage from "./InfoPage";

export default class App extends Component {
    constructor(props) {
        super(props);
    }

    // date = new Date(2011, 0, 1, 2, 3, 4, 567)
    tzoffset = new Date().getTimezoneOffset();
    date = new Date()

    date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), 0, 0, 0, 0)

    now_utc = Date.UTC(this.date.getUTCFullYear(), this.date.getUTCMonth(),
                this.date.getUTCDate(), this.date.getUTCHours(),
                this.date.getUTCMinutes(), this.date.getUTCSeconds());


    render() {
        return (
            <Routes>
                <Route path="/info" element={<InfoPage pallet_props={{}} timezone={this.tzoffset}/>}/>
                <Route path='/home1' element={<HomePage pallet_props={{}} now_utc={this.now_utc}/>}/>
            </Routes>
        );
    }
}