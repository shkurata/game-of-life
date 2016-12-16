import React from 'react';

const speed = {
      Slow: 200,
      Medium: 100,
      Fast: 30
    };

class BaseComponent extends React.Component {
 _bind(...methods) {
  methods.forEach( (method) => this[method] = this[method].bind(this) );
 }
}

class Game extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      rows: 50,
      cols: 70,
      table: [],
      markedCells: 0,
      generation: 0,
      speed: 100,
      running: false,
      startPushed: false,
      clearPushed: false
    };
    this._bind('markRandomCells',
               'clearTable',
               'displayNextGeneration',
               'calculateNextGeneration',
               'checkCellNextStatus',
               'setCellValue',
               'createBlankTable',
               'createTable',
               'clickRunButton',
               'makeButtons',
               'makeSpeedButton',
               'makeSizeButton',
               'makeControlButton',
               'run',
               'clearButtonHelper',
               'runButtonHelper',
               'clickSizeButton',
               'clickSpeedButton',
               'pause');
  }
  componentWillMount() {
    this.setState({
      table: this.createBlankTable()
    });
  }
  componentDidMount() {
    this.markRandomCells();
    this.run();
  }
  clrTable() {
    return this.state.table.map(row=>row.map(()=>null));
  }
  createBlankTable() {
    return new Array(this.state.rows).fill(new Array(this.state.cols).fill(null));
  }
  createTable(rows, cols) {
    return new Array(rows).fill(new Array(cols).fill(null));
  }
  createRandomTable() {
    return this.state.table.map(function(row) {
      return row.map(function() {
        return Math.random() < 0.7 ? null : true
      });
    });
  }
  clearButtonHelper() {
    this.setState({
        clearPushed: true
      }, ()=>setTimeout(()=>this.setState({
        clearPushed: false
      }), 700));
  }
  runButtonHelper() {
    this.setState({
        startPushed: true
      }, ()=>setTimeout(()=>this.setState({
        startPushed: false
      }), 700));
  }
  clearTable() {
    this.setState({
      table: this.clrTable(),
      generation: 0,
      markedCells: 0,
      running: false
    });
    clearInterval(this.interval);
    this.clearButtonHelper();
  }
  clickRunButton() {
    if (!this.state.running) {
      this.run();
      this.runButtonHelper();
    }
  }
  run() {
      this.interval = setInterval(function() {
        this.displayNextGeneration();
      }.bind(this), this.state.speed);
      this.setState({
        running: true
      });
  }
  pause() {
    if (this.state.running) {
      this.setState({
        running: false
      });
      clearInterval(this.interval);
    }
  }
  markRandomCells() {
    this.setState({
      table: this.createRandomTable()
    });
  }
  displayNextGeneration() {
    var nextGeneration = this.calculateNextGeneration();
    if (this.state.markedCells || nextGeneration.count) {
      this.setState({
        generation: this.state.generation + 1,
        table: nextGeneration.table,
        markedCells: nextGeneration.count,
      });
    } else {
      this.pause();
      this.clearTable();
    }
  }
  calculateNextGeneration() {
    var aliveCellsCount = 0,
      nextTable = this.state.table.map(function(val, i) {
        return val.map(function(el, n) {
          var nextCell = this.checkCellNextStatus(i, n);
          if (nextCell !== null) {
            aliveCellsCount++;
          }
          return nextCell;
        }, this);
      }, this);
    return {
      table: nextTable,
      count: aliveCellsCount
    };
  }
  checkCellNextStatus(x, y) {
    var cellSum = 0,
        arr = this.state.table,
        cellValue = arr[x][y],
        rows = this.state.rows,
        columns = this.state.cols;
    for (var i = x - 1, k = 0;
      (i <= x + 1 || i === rows) && k < 3; i++, k++) {
      for (var j = y - 1, p = 0;
        (j <= y + 1 || j === columns) && p < 3; j++, p++) {
        if (i < 0) {
          i = rows - 1;
        }
        if (i > rows - 1) {
          i = 0;
        }
        if (j < 0) {
          j = columns - 1;
        }
        if (j > columns - 1) {
          j = 0;
        }
        if (i === x && j === y) {
          continue;
        }
        if (arr[i][j] !== null) {
          cellSum++;
        }
      }
    }
    if (cellValue !== null) {
      if (cellSum !== 2 && cellSum !== 3) {
        cellValue = null;
      } else {
        cellValue = true;
      }
    } else {
      if (cellSum === 3) {
        cellValue = false;
      }
    }
    return cellValue;
  }
  setCellValue(row, col) {
    let tempArr = this.state.table.slice(),
        marked = this.state.markedCells;
    if (tempArr[row][col] !== null) {
      tempArr[row][col] = null;
      marked--;
    } else {
      tempArr[row][col] = true;
      marked++;
    }
    this.setState({
      table: tempArr,
      markedCells: marked
    });
  }
  makeSizeButton(string) {
    const rows = string.split('x')[0];
    const isActive = this.state.rows === parseInt(rows, 10);
    string = 'Size: ' + string;
    return <Button active={isActive} click={this.clickSizeButton} text={string} />
  }
  makeSpeedButton(string) {
    const isActive = this.state.speed === parseInt(speed[string], 10);
    return <Button active={isActive} click={this.clickSpeedButton} text={string} />
  }
  makeControlButton(string) {
    const source = {
      START: [this.state.startPushed, this.clickRunButton],
      PAUSE: [(!this.state.running && this.state.generation), this.pause],
      CLEAR: [this.state.clearPushed, this.clearTable]
    };
    const isActive = source[string][0];
    return <Button active={isActive} click={source[string][1]} text={string} />
  }
  clickSizeButton(text) {
    this.pause();
    const size = text.slice(6).split('x').map(v=>parseInt(v, 10));
    this.setState({
      table: this.createTable(size[0], size[1]),
      rows: size[0],
      cols: size[1],
      generation: 0,
      markedCells: 0
    }, ()=>{
      this.markRandomCells();
      this.run();
    });
  }
  clickSpeedButton(text) {
    this.pause();
    this.setState({
      speed: speed[text]
    }, ()=>{
      this.run();
    });
  }
  makeButtons([texts, maker]) {
    return texts.map(button=>maker(button));
  }
  render() {
      const controlButtons = [
        ['START', 'PAUSE', 'CLEAR'],
        this.makeControlButton
      ];
      const sizeButtons = [
        ['30x50', '50x70', '80x100'],
        this.makeSizeButton
      ];
      const speedButtons = [
        ['Slow', 'Medium', 'Fast'],
        this.makeSpeedButton
      ];
    return (
      <div>
        <div id="control">
          {this.makeButtons(controlButtons)}
          Generation: {this.state.generation}
        </div>
        <Table table={this.state.table} cellClick={this.setCellValue} />
        <div id="game-settings">
          <div>
            {this.makeButtons(sizeButtons)}
          </div>
          <div>
           {this.makeButtons(speedButtons)}
          </div>
        </div>
      </div>
    );
  }
}

function Table(props) {
    const table =
      props.table.map((v, i)=>
        <tr key={i}>
          {v.map((e,n)=>
                 <Cell key={n} val={e} row={i}
                       col={n} tSize={props.table.length}
                       click={props.cellClick} />)}
        </tr>
      );
    return (
      <table>
          <tbody>
              {table}
          </tbody>
      </table>
    );
}

class Button extends BaseComponent {
  constructor(props) {
    super(props);
    this._bind('clickHandler');
  }
  shouldComponentUpdate(newProps, newState) {
    return newProps.active !== this.props.active;
  }
  clickHandler() {
    return this.props.click(this.props.text);
  }
  render() {
    const classN = this.props.active ? 'active' : '';
    return <button className={classN}
                   onClick={this.clickHandler}>{this.props.text}
           </button>
  }
}

class Cell extends BaseComponent {
  constructor(props) {
    super(props);
    this._bind('clickHandler');
  }
  clickHandler() {
    return this.props.click(this.props.row, this.props.col);
  }
  render() {
    const val = this.props.val,
          tSize = this.props.tSize;
    const classN1 = val ? 'alive' : val === false ? 'newborn' : 'dead';
    const classN2 = tSize === 30 ? 'big' : tSize === 80 ? 'small' : '';
    const classN = classN1 + ' ' + classN2;
    return <td className={classN} onClick={this.clickHandler}/>
  }
}

export default Game;
