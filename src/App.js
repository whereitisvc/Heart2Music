'use strict';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
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

  }

  generateMusicList(bpmdata){
        const RANGE = 10
        const LOWEST = 60
        const HIGHEST = 220

        let avg = bpmdata.avg
        let high, low
        if(avg > HIGHEST){ avg = HIGHEST; low = HIGHEST-RANGE; high = HIGHEST; }
        else if(avg < LOWEST){ avg = LOWEST; low = LOWEST; high = LOWEST+RANGE; }
        else{
            low = (avg - RANGE > LOWEST) ? avg - RANGE : LOWEST
            high = (avg + RANGE < HIGHEST) ? avg + RANGE : HIGHEST
        }
        
        let list = window.musicList.slice().filter(obj => {return obj.bpm > low && obj.bpm < high})
        list.sort((a, b) => {return 0.5 - Math.random()})

        this.setState({musiclist: list})
  }

  bpmClick(mode){
        this.setState({mode: mode})
        if(mode === 0) this.generateMusicList(this.state.heartStatus)
        else this.generateMusicList(this.state.tapStatus)
  }

  render() {
    return (
        <div className="App">
            <div className="Data">           
                <div>
                    <button onClick={() => {this.bpmClick(0)} } className={this.state.mode===0 ? "active" : ""}> 
                        <h2>Heart BPM Status</h2>
                        <p>min = {this.state.heartStatus.min}, max = {this.state.heartStatus.max}, avg = {this.state.heartStatus.avg}</p> 
                    </button>
                </div>
                <br/>
                <div>
                    <button onClick={() => {this.bpmClick(1)} } className={this.state.mode===1 ? "active" : ""}> 
                        <h2>Tap BPM Status</h2>
                        <p>min = {this.state.tapStatus.min}, max = {this.state.tapStatus.max}, avg = {this.state.tapStatus.avg}</p> 
                    </button>
                </div>
            </div>
            <Thumbnails list={this.state.musiclist}/>
        </div>
    );
  }

  updateStatus(mode){
    const UPDATESIZE = 5
    let ary = (mode === 0) ? window.heartBPMData.slice() : window.tapBPMData.slice()
    let maxv = -1;
    let minv = 1000;
    let avg;
    let acc = 0;
    for(let i=ary.length-1; i>=ary.length-UPDATESIZE && i>=0; i--){
        maxv = (ary[i] > maxv) ? ary[i] : maxv;
        minv = (ary[i] < minv) ? ary[i] : minv;
        acc += ary[i];
    }

    if(maxv === -1 && minv === 1000) avg = 0
    else avg = (acc/UPDATESIZE).toFixed(2) // edge case: ary.length < UPDATESIZE
    console.log(avg)
    return { min: minv, max: maxv, avg: avg }
  }

  componentDidMount(){
      //alert('mount');
  }

  componentDidUpdate(){
      //alert('update'); 

        if(window.reactupdate){
            window.reactupdate = false
            let data1 = this.updateStatus(0)
            let data2 = this.updateStatus(1)
            this.setState({
                heartStatus: data1,
                tapStatus: data2,
            })
        }
  }

}

class Thumbnails extends React.Component {
    processlist(list){
        let temp = []
        for(let i=0; i<10 && i<list.length; i++){
            let obj = list[i]
            temp.push(
                <tr key={i}>
                    <td>{i+1}</td>
                    <td>{obj.artist}</td>
                    <td>{obj.name}</td>
                    <td>{obj.bpm}</td>
                    <td>{obj.genre}</td>
                </tr>
            )
        }

        return(
            <table className="musicList">
                <tr className="align-left">
                    <th>no.</th>
                    <th>artist</th>
                    <th>name</th>
                    <th>bpm</th>
                    <th>genre</th>
                </tr>
                {temp}
            </table>
        )
    }
    render() {
        let list = this.props.list.slice()
        let showlist = this.processlist(list)

        //console.log(window.musicList)

        return (
            <div className="Thumbnails">
                {showlist}
            </div>
        )
    }
}

let domContainer = document.querySelector('#App');
ReactDOM.render(<App />, domContainer);