import { useState } from 'react'
import './App.css'

interface Cell {
  i: number;
  j: number;
  key: string;
}

class UniqueCell implements Cell {
  private constructor(public readonly i: number, public readonly j: number) { }
  public get key(): string {
    return this.i + ',' + this.j;
  }

  private static knownCells = new Map<string, UniqueCell>();
  public static at(i: number, j: number): UniqueCell {
    const key = i + ',' + j;
    if (UniqueCell.knownCells.has(key)) {
      return UniqueCell.knownCells.get(key)!;
    }
    const cell = new UniqueCell(i, j);
    UniqueCell.knownCells.set(key, cell);
    return cell;
  }
}

interface Plant {
  species: string;
  level: number;
}

interface CellContents {
  plant?: Plant;
}

interface Garden {
  cells: Map<Cell, CellContents>;
}


function PlantView(props: { plant: Plant }) {
  return (
    <div className="plant">
      {props.plant.species} [lvl.&nbsp;{props.plant.level}]
    </div>
  );
}

function CellView(props: { cell: Cell, contents: CellContents, clicked: () => void }) {
  return (
    <div className="cell">
      <div className="cell-contents">
        {props.contents.plant ? <PlantView plant={props.contents.plant} /> : "empty"}
      </div>
      <button onClick={props.clicked}>@</button>
    </div>
  );
}

function GardenView(props: {
  garden: Garden
  cellClicked: (cell: Cell) => void
}) {
  const cells = Array.from(props.garden.cells.keys());
  const ii = cells.map(cell => cell.i);
  const jj = cells.map(cell => cell.j);
  const minI = Math.min(...ii);
  const minJ = Math.min(...jj);
  const maxI = Math.max(...ii);
  const maxJ = Math.max(...jj);

  const rows = [];
  for (let i = minI; i < maxI; i++) {
    const tdsInRow = [];
    for (let j = minJ; j < maxJ; j++) {
      const cell = UniqueCell.at(i, j);
      const contents = props.garden.cells.get(cell);
      if (contents !== undefined) {
        tdsInRow.push(
        <td key={cell.key}>
          <CellView
            cell={cell}
            contents={contents}
            clicked={() => props.cellClicked(cell)} />
        </td>);
      } else {
        tdsInRow.push(<td key={cell.key}>...</td>)
      }
    }
    rows.push(<tr key={i}>{tdsInRow}</tr>);
  }
  const table = <table><tbody>{rows}</tbody></table>;

  return (
    <div className='garden'>
      {table}
    </div>
  );
}

function generateGarden(): Garden {
  const cells = new Map<Cell, CellContents>();
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 8; j++) {
      if (Math.random() < 0.75) {
        const cell = UniqueCell.at(i, j);
        const contents = { moisture: 0 } as CellContents;
        if (Math.random() < 0.1) {
          contents.plant = { species: '🌿', level: 1 };
        }
        cells.set(cell, contents);
      }
    }
  }
  return {
    cells,
  };
}

function App() {
  const [garden, setGarden] = useState(generateGarden());

  function cellClicked(cell: Cell) {
    const contents = garden.cells.get(cell);
    if (contents !== undefined) {
      if (contents.plant !== undefined) {
        contents.plant.level++;
      } else {
        contents.plant = { species: '🌵', level: 1 };
      }

      setGarden({ ...garden });
    }
  }
  
  return (
    <>
      <h1>My Garden</h1>
      <GardenView garden={garden} cellClicked={cellClicked}/>
    </>
  )
}

export default App
