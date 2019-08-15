'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
    _inherits(App, _React$Component);

    function App(props) {
        _classCallCheck(this, App);

        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

        _this.state = {
            mode: 0, // 0 for heartBPM, 1 for tapBPM
            heartStatus: {
                min: 0,
                max: 0,
                avg: 0
            },
            tapStatus: {
                min: 0,
                max: 0,
                avg: 0
            },
            musiclist: window.musicList.slice()
        };

        return _this;
    }

    _createClass(App, [{
        key: "generateMusicList",
        value: function generateMusicList(bpmdata) {
            var RANGE = 10;
            var LOWEST = 60;
            var HIGHEST = 220;

            var avg = bpmdata.avg;
            var high = void 0,
                low = void 0;
            if (avg > HIGHEST) {
                avg = HIGHEST;low = HIGHEST - RANGE;high = HIGHEST;
            } else if (avg < LOWEST) {
                avg = LOWEST;low = LOWEST;high = LOWEST + RANGE;
            } else {
                low = avg - RANGE > LOWEST ? avg - RANGE : LOWEST;
                high = avg + RANGE < HIGHEST ? avg + RANGE : HIGHEST;
            }

            var list = window.musicList.slice().filter(function (obj) {
                return obj.bpm > low && obj.bpm < high;
            });
            list.sort(function (a, b) {
                return 0.5 - Math.random();
            });

            this.setState({ musiclist: list });
        }
    }, {
        key: "bpmClick",
        value: function bpmClick(mode) {
            this.setState({ mode: mode });
            if (mode === 0) this.generateMusicList(this.state.heartStatus);else this.generateMusicList(this.state.tapStatus);
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            return React.createElement(
                "div",
                { className: "App" },
                React.createElement(
                    "div",
                    { className: "Data" },
                    React.createElement(
                        "div",
                        null,
                        React.createElement(
                            "button",
                            { onClick: function onClick() {
                                    _this2.bpmClick(0);
                                }, className: this.state.mode === 0 ? "active" : "" },
                            React.createElement(
                                "h2",
                                null,
                                "Heart BPM Status"
                            ),
                            React.createElement(
                                "p",
                                null,
                                "min = ",
                                this.state.heartStatus.min,
                                ", max = ",
                                this.state.heartStatus.max,
                                ", avg = ",
                                this.state.heartStatus.avg
                            )
                        )
                    ),
                    React.createElement("br", null),
                    React.createElement(
                        "div",
                        null,
                        React.createElement(
                            "button",
                            { onClick: function onClick() {
                                    _this2.bpmClick(1);
                                }, className: this.state.mode === 1 ? "active" : "" },
                            React.createElement(
                                "h2",
                                null,
                                "Tap BPM Status"
                            ),
                            React.createElement(
                                "p",
                                null,
                                "min = ",
                                this.state.tapStatus.min,
                                ", max = ",
                                this.state.tapStatus.max,
                                ", avg = ",
                                this.state.tapStatus.avg
                            )
                        )
                    )
                ),
                React.createElement(Thumbnails, { list: this.state.musiclist })
            );
        }
    }, {
        key: "updateStatus",
        value: function updateStatus(mode) {
            var UPDATESIZE = 5;
            var ary = mode === 0 ? window.heartBPMData.slice() : window.tapBPMData.slice();
            var maxv = -1;
            var minv = 1000;
            var avg = void 0;
            var acc = 0;
            for (var i = ary.length - 1; i >= ary.length - UPDATESIZE && i >= 0; i--) {
                maxv = ary[i] > maxv ? ary[i] : maxv;
                minv = ary[i] < minv ? ary[i] : minv;
                acc += ary[i];
            }

            if (maxv === -1 && minv === 1000) avg = 0;else avg = (acc / UPDATESIZE).toFixed(2); // edge case: ary.length < UPDATESIZE
            console.log(avg);
            return { min: minv, max: maxv, avg: avg };
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            //alert('mount');
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            //alert('update'); 

            if (window.reactupdate) {
                window.reactupdate = false;
                var data1 = this.updateStatus(0);
                var data2 = this.updateStatus(1);
                this.setState({
                    heartStatus: data1,
                    tapStatus: data2
                });
            }
        }
    }]);

    return App;
}(React.Component);

var Thumbnails = function (_React$Component2) {
    _inherits(Thumbnails, _React$Component2);

    function Thumbnails() {
        _classCallCheck(this, Thumbnails);

        return _possibleConstructorReturn(this, (Thumbnails.__proto__ || Object.getPrototypeOf(Thumbnails)).apply(this, arguments));
    }

    _createClass(Thumbnails, [{
        key: "processlist",
        value: function processlist(list) {
            var temp = [];
            for (var i = 0; i < 10 && i < list.length; i++) {
                var obj = list[i];
                temp.push(React.createElement(
                    "tr",
                    { key: i },
                    React.createElement(
                        "td",
                        null,
                        i + 1
                    ),
                    React.createElement(
                        "td",
                        null,
                        obj.artist
                    ),
                    React.createElement(
                        "td",
                        null,
                        obj.name
                    ),
                    React.createElement(
                        "td",
                        null,
                        obj.bpm
                    ),
                    React.createElement(
                        "td",
                        null,
                        obj.genre
                    )
                ));
            }

            return React.createElement(
                "table",
                { className: "musicList" },
                React.createElement(
                    "tr",
                    { className: "align-left" },
                    React.createElement(
                        "th",
                        null,
                        "no."
                    ),
                    React.createElement(
                        "th",
                        null,
                        "artist"
                    ),
                    React.createElement(
                        "th",
                        null,
                        "name"
                    ),
                    React.createElement(
                        "th",
                        null,
                        "bpm"
                    ),
                    React.createElement(
                        "th",
                        null,
                        "genre"
                    )
                ),
                temp
            );
        }
    }, {
        key: "render",
        value: function render() {
            var list = this.props.list.slice();
            var showlist = this.processlist(list);

            //console.log(window.musicList)

            return React.createElement(
                "div",
                { className: "Thumbnails" },
                showlist
            );
        }
    }]);

    return Thumbnails;
}(React.Component);

var domContainer = document.querySelector('#App');
ReactDOM.render(React.createElement(App, null), domContainer);