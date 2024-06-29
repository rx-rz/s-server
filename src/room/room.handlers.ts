import { Handler } from "express";
import { v } from "./room.validators";
import { roomRepository } from "./room.repository";
import { httpstatus } from "../ctx";
import { roomTypeRepository } from "../room_types/roomtype.repository";
import { NotFoundError } from "../errors";

async function checkIfRoomExists(roomNo: number) {
  const room = await roomRepository.getRoomDetails(roomNo);
  if (!room) {
    throw new NotFoundError(`Room does not exist.`);
  }
  return room;
}

const createRoom: Handler = async (req, res, next) => {
  try {
    const { noOfRooms, typeId } = v.roomCreationValidator.parse(req.body);
    const roomTypeExists = await roomTypeRepository.getRoomTypeDetailsByID(typeId)
    if(!roomTypeExists) throw new NotFoundError(`Room type with the provided ID does not exist`)
    await roomRepository.createRoom({ noOfRooms, typeId });
    return res.status(httpstatus.CREATED).json({
      message: `${noOfRooms} rooms have been created.`,
      isSuccess: true,
    });
  } catch (err) {
    next(err);
  }
};

const getRoomDetails: Handler = async (req, res, next) => {
  try {
    const { roomNo } = v.roomNoValidator.parse(req.query);
    const room = checkIfRoomExists(roomNo);
    return res.status(httpstatus.OK).json({
      room,
      isSuccess: true,
    });
  } catch (err) {
    next(err);
  }
};

const getAvailableRooms: Handler = async (req, res, next) => {
  try {
    const availableRooms = await roomRepository.getAvailableRooms();
    return res.status(httpstatus.OK).json({
      availableRooms,
      isSuccess: true,
    });
  } catch (err) {
    next(err);
  }
};

const listRooms: Handler = async (req, res, next) => {
  try {
    const queries = v.listRoomValidator.parse(req.query);
    const { rooms, noOfRooms } = await roomRepository.listRooms(queries);
    const maxPageNo = Math.ceil(noOfRooms / queries.limit);
    return res.status(httpstatus.OK).json({
      rooms,
      maxPageNo,
      isSuccess: true,
    });
  } catch (err) {
    next(err);
  }
};

const updateRoom: Handler = async (req, res, next) => {
  try {
    const { typeId, roomNo, status } = v.roomUpdateValidator.parse(req.body);
    if (typeId) {
      const existingRoomType = await roomTypeRepository.getRoomTypeDetailsByID(
        typeId
      );
      if (!existingRoomType)
        throw new NotFoundError(`Provided room type does not exist.`);
    }
    await checkIfRoomExists(roomNo);
    const roomUpdated = await roomRepository.updateRoom({
      roomNo,
      typeId,
      status,
    });
    return res.status(httpstatus.OK).json({
      roomUpdated,
      isSuccess: true,
    });
  } catch (err) {
    next(err);
  }
};

const deleteRoom: Handler = async (req, res, next) => {
  try {
    const { roomNo } = v.roomNoValidator.parse(req.query);
    await checkIfRoomExists(roomNo);
    const roomDeleted = await roomRepository.deleteRoom(roomNo);
    return res.status(httpstatus.OK).json({
      roomDeleted,
      isSuccess: true
    });
  } catch (err) {
    next(err);
  }
};

export const roomHandlers = {
  createRoom,
  deleteRoom,
  getRoomDetails,
  getAvailableRooms,
  updateRoom,
  listRooms,
};
