import { BinaryIO } from '../common/BinaryIO'
import { ArxColor, Color } from '../common/Color'
import { repeat } from '../common/helpers'
import { ArxVector3 } from '../common/types'
import { ArxZoneFlags } from '../types'
import { ArxPath } from './DLF'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LevelFormat.h#L150
 */
export type ArxPathHeader = {
  name: string
  idx: number
  flags: ArxZoneFlags
  pos: ArxVector3
  numberOfPathways: number
  color: ArxColor
  farClip: number
  reverb: number
  ambianceMaxVolume: number
  height: number
  ambiance: string
}

export class PathHeader {
  static readFrom(binary: BinaryIO): ArxPathHeader {
    const dataBlock1 = {
      name: binary.readString(64),
      idx: binary.readInt16(),
      flags: binary.readInt16(),
    }

    binary.readVector3() // initPos - the same as pos with only 1 instance of being different on level 6:
    // initPos: { x: -2647.48486328125, y: -0.5400390625, z: 6539.69091796875 }
    //     pos: { x: -2647.48486328125, y: -0.5400390625, z: 6539.6904296875 }

    const dataBlock2 = {
      pos: binary.readVector3(),
      numberOfPathways: binary.readInt32(),
      color: Color.readFrom(binary, 'rgb'),
      farClip: binary.readFloat32(),
      reverb: binary.readFloat32(),
      ambianceMaxVolume: binary.readFloat32(),
    }

    binary.readFloat32Array(26) // fpad - ?

    const dataBlock3 = {
      height: binary.readInt32(),
    }

    binary.readInt32Array(31) // lpad - ?

    const dataBlock4 = {
      ambiance: binary.readString(128),
    }

    binary.readString(128) // cpad - ?

    return {
      ...dataBlock1,
      ...dataBlock2,
      ...dataBlock3,
      ...dataBlock4,
    }
  }

  static allocateFrom(path: ArxPath) {
    const buffer = Buffer.alloc(PathHeader.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeString(path.header.name, 64)
    binary.writeInt16(path.header.idx)
    binary.writeInt16(path.header.flags)
    binary.writeVector3(path.header.pos) // initPos
    binary.writeVector3(path.header.pos)
    binary.writeInt32(path.pathways.length)
    binary.writeBuffer(Color.accumulateFrom(path.header.color, 'rgb'))
    binary.writeFloat32(path.header.farClip)
    binary.writeFloat32(path.header.reverb)
    binary.writeFloat32(path.header.ambianceMaxVolume)

    binary.writeFloat32Array(repeat(0, 26))

    binary.writeInt32(path.header.height)

    binary.writeInt32Array(repeat(0, 31))

    binary.writeString(path.header.ambiance, 128)

    binary.writeString('', 128)

    return buffer
  }

  static sizeOf() {
    return (
      BinaryIO.sizeOfString(64) +
      BinaryIO.sizeOfInt16Array(2) +
      BinaryIO.sizeOfVector3Array(2) +
      BinaryIO.sizeOfInt32() +
      Color.sizeOf('rgb') +
      BinaryIO.sizeOfFloat32Array(3 + 26) +
      BinaryIO.sizeOfInt32Array(1 + 31) +
      BinaryIO.sizeOfString(256)
    )
  }
}
