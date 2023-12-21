import {NextApiRequest, NextApiResponse} from 'next'
import {zingchart} from 'zingchart/zingchart-nodejs.min'

export default zingchartRoute

export type ZCResponse = {
  filename: string
}

/*
 * Render a ZingChart on the server
 */
async function zingchartRoute(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {chartData, filename, width, height} = await req.body
    const fn = `${filename}.png`

    zingchart.render({
      id: 'zc',
      width: width,
      height: height,
      data: chartData,
      filetype: 'png',
      filename: `public/${fn}`
    })

    res.json({
      filename: fn
    })
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
