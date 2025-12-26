import './style.css'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import { defaults as defaultInteractions } from 'ol/interaction'
import ImageTile from 'ol/source/ImageTile'

const mapInst = new Map({
  target: 'map',
  layers: [],
  view: new View({
    center: [-472202, 7530279],
    zoom: 12,
  }),
  interactions: defaultInteractions({
    doubleClickZoom: false,
  }),
})

async function addTileLayer(layerInfo) {
  const source = new ImageTile({
    url: layerInfo.url,
  })
  const layer = new TileLayer({
    type: layerInfo.type,
    source: source,
    zIndex: layerInfo.zIndex,
  })
  mapInst.addLayer(layer)
}

export const testData = {
  newImgUrl:
    'https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=0e6fc415256d4fbb9b5166a718591d71',
  oldImgUrl:
    'https://{a-c}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=0e6fc415256d4fbb9b5166a718591d71',
}

addTileLayer({ url: testData.newImgUrl, type: 'new', zIndex: 10 })
addTileLayer({ url: testData.oldImgUrl, type: 'old', zIndex: 9 })

function checkMissParam() {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('miss') === '1'
}

function downHandler(evt) {
  console.log('down')
  if (checkMissParam()) {
    mapInst
      .getLayers()
      .getArray()
      .forEach((lay) => {
        const t = lay.get('type')
        if (t === 'old') lay.setVisible(true)
        if (t === 'new') lay.setVisible(false)
      })
  }
}
function upHandler(evt) {
  console.log('up')
  if (checkMissParam()) {
    mapInst
      .getLayers()
      .getArray()
      .forEach((lay) => {
        const t = lay.get('type')
        if (t === 'old') lay.setVisible(false)
        if (t === 'new') lay.setVisible(true)
      })
  }
}
mapInst.getTargetElement().addEventListener('pointerdown', downHandler)
mapInst.getTargetElement().addEventListener('pointerup', upHandler)

mapInst.on('dblclick', () => {
  console.log('dblclick')
})
