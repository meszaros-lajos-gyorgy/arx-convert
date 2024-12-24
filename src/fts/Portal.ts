import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxPortalPolygon, PortalPolygon } from '@fts/PortalPolygon.js'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/GraphicsTypes.h#L268
 */
export type ArxPortal = {
  polygon: ArxPortalPolygon
  room1: number
  room2: number
  useportal: number
  paddy: number
}

export class Portal {
  static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxPortal {
    return {
      polygon: PortalPolygon.readFrom(binary),
      room1: binary.readInt32(), // facing normal
      room2: binary.readInt32(),
      useportal: binary.readInt16(),
      paddy: binary.readInt16(),
    }
  }

  static accumulateFrom(portal: ArxPortal, levelIdx: number): ArrayBuffer {
    const buffer = new ArrayBuffer(Portal.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeBuffer(PortalPolygon.accumulateFrom(portal.polygon, levelIdx))
    binary.writeInt32(portal.room1)
    binary.writeInt32(portal.room2)
    binary.writeInt16(portal.useportal)
    binary.writeInt16(portal.paddy)

    return buffer
  }

  static sizeOf(): number {
    return PortalPolygon.sizeOf() + BinaryIO.sizeOfInt32Array(2) + BinaryIO.sizeOfInt16Array(2)
  }
}
