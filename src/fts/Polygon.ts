import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { ArxVertex, Vertex } from './Vertex'
import { ArxVector3, QuadrupleOf } from '../common/types'
import { times } from '../common/helpers'
import { ArxTextureContainer } from './TextureContainer'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/GraphicsTypes.h#L88
 */
export enum ArxPolygonFlags {
  None = 0,
  NoShadow = 1 << 0,
  DoubleSided = 1 << 1,
  Trans = 1 << 2,
  Water = 1 << 3,
  Glow = 1 << 4,
  Ignore = 1 << 5,
  Quad = 1 << 6,
  // Tiled = 1 << 7, // unused
  Metal = 1 << 8,
  Hide = 1 << 9,
  Stone = 1 << 10,
  Wood = 1 << 11,
  Gravel = 1 << 12,
  Earth = 1 << 13,
  NoCollision = 1 << 14,
  Lava = 1 << 15,
  Climbable = 1 << 16,
  Falling = 1 << 17,
  NoPath = 1 << 18,
  NoDraw = 1 << 19,
  PrecisePath = 1 << 20,
  // NoClimb = 1 << 21, // unused
  // Angular = 1 << 22, // unused
  // AngularIdx0 = 1 << 23, // unused
  // AngularIdx1 = 1 << 24, // unused
  // AngularIdx2 = 1 << 25, // unused
  // AngularIdx3 = 1 << 26, // unused
  LateMip = 1 << 27,
}

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L81
 */
export type ArxPolygon = {
  vertices: QuadrupleOf<ArxVertex>
  /**
   * reference to {@link ArxTextureContainer.id}
   */
  textureContainerId: number
  norm: ArxVector3
  norm2: ArxVector3
  normals?: QuadrupleOf<ArxVector3>
  transval: number
  area: number
  flags: ArxPolygonFlags
  room: number
  paddy?: number
}

export class Polygon {
  static readFrom(binary: BinaryIO): ArxPolygon {
    return {
      vertices: times(() => Vertex.readFrom(binary), 4) as QuadrupleOf<ArxVertex>,
      textureContainerId: binary.readInt32(),
      norm: binary.readVector3(),
      norm2: binary.readVector3(),
      normals: times(() => binary.readVector3(), 4) as QuadrupleOf<ArxVector3>,
      transval: binary.readFloat32(),
      area: binary.readFloat32(),
      flags: binary.readInt32(),
      room: binary.readInt16(),
      paddy: binary.readInt16(),
    }
  }

  static accumulateFrom(polygon: ArxPolygon) {
    const buffer = Buffer.alloc(Polygon.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeBuffer(Buffer.concat(polygon.vertices.map(Vertex.accumulateFrom)))
    binary.writeInt32(polygon.textureContainerId)
    binary.writeVector3(polygon.norm)
    binary.writeVector3(polygon.norm2)
    binary.writeVector3Array(polygon.normals ?? [polygon.norm, polygon.norm, polygon.norm, polygon.norm2])
    binary.writeFloat32(polygon.transval)
    binary.writeFloat32(polygon.area)
    binary.writeInt32(polygon.flags)
    binary.writeInt16(polygon.room)
    binary.writeInt16(polygon.paddy ?? 0)

    return buffer
  }

  static sizeOf() {
    return (
      Vertex.sizeOf() * 4 +
      BinaryIO.sizeOfInt32() +
      BinaryIO.sizeOfVector3Array(1 + 1 + 4) +
      BinaryIO.sizeOfFloat32Array(2) +
      BinaryIO.sizeOfInt32() +
      BinaryIO.sizeOfInt16Array(2)
    )
  }
}
