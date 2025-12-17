import axios from 'axios'
import './style.css'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import { XYZ } from 'ol/source'
import { TileGrid } from 'ol/tilegrid'
import {defaults as defaultInteractions} from 'ol/interaction';

const mapInst = new Map({
  target: 'map',
  layers: [],
  view: new View({
    center: [0, 0],
    zoom: 17,
  }),
  interactions: defaultInteractions({
    doubleClickZoom: false,
  }),
})

async function getArcgisParam(url) {
  const paramUrl = url + `?f=json`
  const response = await axios.get(paramUrl).then((res) => res)
  const data = response.data
  const tileInfo = data.tileInfo
  if (!tileInfo || response.status != 200) {
    return
  }
  const fullExtent = data.fullExtent
  const resolutions = tileInfo.lods.map((item) => {
    return item.resolution
  })
  const extent = [fullExtent.xmin, fullExtent.ymin, fullExtent.xmax, fullExtent.ymax]
  return {
    url: url + '/tile/{z}/{y}/{x}',
    extent: extent,
    resolutions: resolutions,
    tileInfo: tileInfo,
  }
}

async function addTileLayer(layerInfo) {
  const param = await getArcgisParam(layerInfo.url)
  const source = new XYZ({
    crossOrigin: 'anonymous',
    url: param.url,
    tileGrid: new TileGrid({
      tileSize: param.tileInfo.rows,
      origin: [param.tileInfo.origin.x, param.tileInfo.origin.y],
      resolutions: param.resolutions,
      extent: param.extent,
    }),
  })
  const layer = new TileLayer({
    type: layerInfo.type,
    source: source,
    zIndex: layerInfo.zIndex,
  })
  mapInst.addLayer(layer)
  mapInst.getView().fit(param.extent, { duration: 500 })
}

export const testData = {
  newImgUrl: '',  // your url
  oldImgUrl: '',  // your url
}

addTileLayer({ url: testData.newImgUrl, type: 'new', zIndex: 10 })
addTileLayer({ url: testData.oldImgUrl, type: 'old', zIndex: 9 })

function downHandler(evt) {
  mapInst
    .getLayers()
    .getArray()
    .forEach((lay) => {
      const t = lay.get('type')
      if (t === 'old') lay.setVisible(true)
      if (t === 'new') lay.setVisible(false)
    })
}
function upHandler(evt) {
  mapInst
    .getLayers()
    .getArray()
    .forEach((lay) => {
      const t = lay.get('type')
      if (t === 'old') lay.setVisible(false)
      if (t === 'new') lay.setVisible(true)
    })
}
mapInst.getTargetElement().addEventListener('pointerdown', downHandler)
mapInst.getTargetElement().addEventListener('pointerup', upHandler)

mapInst.on('dblclick', () => {
  console.log('dblclick')
})
